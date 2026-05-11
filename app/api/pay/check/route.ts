import { NextRequest, NextResponse } from "next/server";

/**
 * 查询易支付订单：文档 https://zpayz.cn — api.php?act=order&pid&key&out_trade_no
 * code=1 表示查询成功；status=1 表示已支付。
 */

interface CheckPayRequest {
  orderNo: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPayRequest = await request.json();
    const { orderNo } = body;

    const appId = process.env.ZPAY_APP_ID;
    const appKey = process.env.ZPAY_APP_KEY;
    const orderApiBase = process.env.ZPAY_ORDER_QUERY_URL || "https://zpayz.cn/api.php";

    if (!appId || !appKey) {
      return NextResponse.json({ error: "支付配置未完成" }, { status: 500 });
    }

    if (!orderNo) {
      return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
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
    });
  } catch (error) {
    console.error("查询订单状态失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
