import { NextRequest, NextResponse } from "next/server";

interface CreatePayRequest {
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePayRequest = await request.json();
    const { type } = body;

    const appId = process.env.ZPAY_APP_ID;
    const appKey = process.env.ZPAY_APP_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!appId || !appKey) {
      return NextResponse.json(
        { error: "支付配置未完成" },
        { status: 500 }
      );
    }

    const orderNo = `MTL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const amount = 990;
    const subject = "Mia图灵迷宫-完整AI人格报告";
    const notifyUrl = `${baseUrl}/api/pay/notify`;
    const returnUrl = `${baseUrl}/payment/success`;

    const payRequestParams = new URLSearchParams({
      appid: appId,
      appkey: appKey,
      out_trade_no: orderNo,
      total_fee: amount.toString(),
      subject,
      notify_url: notifyUrl,
      return_url: returnUrl,
    });

    const zpayApiUrl = `https://zpayz.cn/api/pay/create?${payRequestParams.toString()}`;

    const response = await fetch(zpayApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.code === 1 && data.data?.qrcode) {
      return NextResponse.json({
        success: true,
        orderNo,
        qrCode: data.data.qrcode,
        payUrl: data.data.payurl,
        type: data.data.type || "link",
      });
    }

    return NextResponse.json(
      { error: data.msg || "创建订单失败" },
      { status: 400 }
    );
  } catch (error) {
    console.error("创建支付订单失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}