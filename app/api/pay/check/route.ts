import { NextRequest, NextResponse } from "next/server";
import { verifyZPayNotifyQuery } from "@/lib/pay/zpaySign";

/**
 * 查询易支付订单：文档 https://zpayz.cn — api.php?act=order&pid&key&out_trade_no
 * code=1 表示查询成功；status=1 表示已支付。
 *
 * 同步跳转带回的 query（含 sign）若校验通过且 trade_status 成功，则视为已付款，
 * 不依赖异步订单查询滞后。
 */

const EXPECT_MONEY = "9.9";

interface CheckPayRequest {
  orderNo: string;
  /** 浏览器当前页完整 query（与 notify 同规则签名的参数）。 */
  returnQuery?: Record<string, string>;
}

function paidFromSignedReturn(
  returnQuery: Record<string, string> | undefined,
  orderNo: string,
  appKey: string,
): boolean {
  if (!returnQuery || !returnQuery.sign) return false;

  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(returnQuery)) {
    if (typeof v !== "string") continue;
    sp.append(k, v);
  }

  const { ok, params } = verifyZPayNotifyQuery(sp, appKey);
  if (!ok) return false;

  if ((params.trade_status || "").trim() !== "TRADE_SUCCESS") return false;

  const out = (params.out_trade_no || "").trim();
  if (!out || out !== orderNo.trim()) return false;

  const amt = Number.parseFloat((params.money || "").trim());
  if (!Number.isFinite(amt) || Math.abs(amt - Number.parseFloat(EXPECT_MONEY)) > 1e-6) {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPayRequest = await request.json();
    const { orderNo, returnQuery } = body;

    const appId = process.env.ZPAY_APP_ID;
    const appKey = process.env.ZPAY_APP_KEY;
    const orderApiBase = process.env.ZPAY_ORDER_QUERY_URL || "https://zpayz.cn/api.php";

    if (!appId || !appKey) {
      return NextResponse.json({ error: "支付配置未完成" }, { status: 500 });
    }

    if (!orderNo) {
      return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
    }

    if (paidFromSignedReturn(returnQuery, orderNo, appKey)) {
      return NextResponse.json({ success: true, paid: true, source: "return" });
    }

    const qs = new URLSearchParams({
      act: "order",
      pid: appId,
      key: appKey,
      out_trade_no: orderNo,
    });
    const fullUrl = `${orderApiBase}?${qs.toString()}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      console.error("ZPay查询响应解析失败:", response.status, text.substring(0, 200));
      return NextResponse.json({ success: true, paid: false });
    }

    const codeOk = Number(data.code) === 1;
    const paid = codeOk && Number(data.status) === 1;

    return NextResponse.json({
      success: true,
      paid,
      source: paid ? "query" : undefined,
    });
  } catch (error) {
    console.error("查询订单状态失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
