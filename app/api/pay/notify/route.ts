import { NextRequest, NextResponse } from "next/server";
import { verifyZPayNotifyQuery } from "@/lib/pay/zpaySign";

const EXPECT_MONEY = "9.9";

function respondNotify(searchParams: URLSearchParams): NextResponse {
  const appKey = process.env.ZPAY_APP_KEY;
  if (!appKey) {
    return new NextResponse("fail", { status: 500 });
  }

  const { ok, params } = verifyZPayNotifyQuery(searchParams, appKey);
  if (!ok) {
    console.warn("[pay notify] sign mismatch or missing");
    return new NextResponse("fail", { status: 400 });
  }

  if (params.trade_status !== "TRADE_SUCCESS") {
    return new NextResponse("success", {
      status: 200,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
  }

  const amt = Number.parseFloat((params.money || "").trim());
  if (!Number.isFinite(amt) || Math.abs(amt - Number.parseFloat(EXPECT_MONEY)) > 1e-6) {
    console.warn("[pay notify] money mismatch", params.money);
    return new NextResponse("fail", { status: 400 });
  }

  console.log("[pay notify] OK out_trade_no=", params.out_trade_no);
  return new NextResponse("success", {
    status: 200,
    headers: { "Content-Type": "text/plain;charset=utf-8" },
  });
}

/**
 * ZPay 异步通知。须返回纯文本 success。
 * 文档为 GET；部分环境可能 POST x-www-form-urlencoded，两者均支持。
 */
export async function GET(request: NextRequest) {
  return respondNotify(request.nextUrl.searchParams);
}

export async function POST(request: NextRequest) {
  const ct = request.headers.get("content-type") || "";

  try {
    if (ct.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      return respondNotify(new URLSearchParams(text));
    }

    const fd = await request.formData();
    const sp = new URLSearchParams();
    fd.forEach((v, k) => {
      sp.append(k, v instanceof File ? "" : String(v));
    });
    return respondNotify(sp);
  } catch {
    return new NextResponse("fail", { status: 400 });
  }
}
