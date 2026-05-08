import { NextRequest, NextResponse } from "next/server";

/**
 * ZPay Order Check API
 * Polls ZPay to verify if the payment was completed
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
    const zpayApiUrl = process.env.ZPAY_API_URL?.replace("/create", "/check") || "https://zpayz.cn/api/pay/check";

    if (!appId || !appKey) {
      return NextResponse.json(
        { error: "支付配置未完成" },
        { status: 500 }
      );
    }

    if (!orderNo) {
      return NextResponse.json(
        { error: "缺少订单号" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      appid: appId,
      appkey: appKey,
      out_trade_no: orderNo,
    });

    const fullUrl = `${zpayApiUrl}?${params.toString()}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("ZPay查询响应解析失败:");
      console.error("Status:", response.status);
      console.error("Response (first 200 chars):", text.substring(0, 200));
      return NextResponse.json({
        success: true,
        paid: false,
      });
    }

    // ZPay typically returns code=1 when paid
    if (data.code === 1) {
      return NextResponse.json({
        success: true,
        paid: true,
      });
    }

    return NextResponse.json({
      success: true,
      paid: false,
    });

  } catch (error) {
    console.error("查询订单状态失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}