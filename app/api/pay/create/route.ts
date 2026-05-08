import { NextRequest, NextResponse } from "next/server";

/**
 * ZPay API Configuration
 * Please configure these environment variables:
 * - ZPAY_APP_ID: Your ZPay App ID
 * - ZPAY_APP_KEY: Your ZPay App Key
 * - ZPAY_API_URL: The ZPay API base URL (contact ZPay support for the correct endpoint)
 * - NEXT_PUBLIC_BASE_URL: Your website base URL
 *
 * Common ZPay endpoints:
 * - Create Order: /api/pay/create or /api/create
 * - Check Order: /api/pay/check or /api/query
 * - ZPay Dashboard: https://dashboard.zpay.com
 */

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
    const zpayApiUrl = process.env.ZPAY_API_URL || "https://zpayz.cn/api/pay/create";

    if (!appId || !appKey) {
      return NextResponse.json(
        { error: "支付配置未完成，请联系管理员" },
        { status: 500 }
      );
    }

    const orderNo = `MTL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const amount = 990;
    const subject = "Mia图灵迷宫-完整AI人格报告";
    const notifyUrl = `${baseUrl}/api/pay/notify`;
    const returnUrl = `${baseUrl}/payment/success`;

    // Build query parameters for ZPay API
    const params = new URLSearchParams({
      appid: appId,
      appkey: appKey,
      out_trade_no: orderNo,
      total_fee: amount.toString(),
      subject,
      notify_url: notifyUrl,
      return_url: returnUrl,
    });

    const fullUrl = `${zpayApiUrl}?${params.toString()}`;

    // Make request to ZPay
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    // Read response as text first to prevent HTML parsing errors
    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("ZPay响应解析失败:");
      console.error("Status:", response.status);
      console.error("Response (first 200 chars):", text.substring(0, 200));
      return NextResponse.json(
        { error: "支付接口返回了非预期的格式，请稍后重试" },
        { status: 500 }
      );
    }

    // Validate ZPay response structure
    if (data.code === 1 && data.data) {
      return NextResponse.json({
        success: true,
        orderNo,
        qrCode: data.data.qrcode || data.data.qr_code || null,
        payUrl: data.data.payurl || data.data.pay_url || null,
        type: data.data.type || "link",
      });
    }

    // ZPay returned an error
    console.error("ZPay API Error:", data);
    return NextResponse.json(
      { error: data.msg || "创建订单失败" },
      { status: 400 }
    );

  } catch (error) {
    console.error("创建支付订单失败:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}