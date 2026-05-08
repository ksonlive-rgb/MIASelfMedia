import { NextRequest, NextResponse } from "next/server";

interface CheckPayRequest {
  orderNo: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPayRequest = await request.json();
    const { orderNo } = body;

    const appId = process.env.ZPAY_APP_ID;
    const appKey = process.env.ZPAY_APP_KEY;

    if (!appId || !appKey) {
      return NextResponse.json(
        { error: "支付配置未完成" },
        { status: 500 }
      );
    }

    const payRequestParams = new URLSearchParams({
      appid: appId,
      appkey: appKey,
      out_trade_no: orderNo,
    });

    const zpayApiUrl = `https://zpayz.cn/api/pay/check?${payRequestParams.toString()}`;

    const response = await fetch(zpayApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

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