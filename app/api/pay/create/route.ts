import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const orderNo = `MIA_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  let paymentKind = "";
  try {
    const body = await request.json();
    paymentKind = typeof body?.type === "string" ? body.type : "";
  } catch {
    paymentKind = "";
  }

  const orderTitle =
    paymentKind === "parent-child-edu"
      ? "亲子教育画像测试"
      : paymentKind === "partner-loyalty"
        ? "伴侣忠诚度测试（情侣版）"
        : "自媒体天赋测试";

  try {
    const appId = process.env.ZPAY_APP_ID;
    const appKey = process.env.ZPAY_APP_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!appId || !appKey) {
      return NextResponse.json(
        { error: "支付配置未完成，请联系管理员" },
        { status: 500 }
      );
    }

    // ZPay channel - always use alipay (or wxpay)
    const zpayChannel = "alipay";
    const notifyUrl = `${baseUrl}/api/pay/notify`;
    const returnUrl = `${baseUrl}/payment/success`;

    // Build parameters object (excluding sign and sign_type)
    const params: Record<string, string> = {
      pid: appId,
      type: zpayChannel,
      out_trade_no: orderNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: orderTitle,
      money: "9.9",
      clientip: "127.0.0.1",
    };

    // Sort by key a-z
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");

    // Generate MD5 sign: sortParamsString + KEY, then MD5 lowercase
    const signString = paramString + appKey;
    const sign = crypto.createHash("md5").update(signString).digest("hex").toLowerCase();

    // Build form data for ZPay API
    const formData = new URLSearchParams();
    formData.append("pid", appId);
    formData.append("type", zpayChannel);
    formData.append("out_trade_no", orderNo);
    formData.append("notify_url", notifyUrl);
    formData.append("return_url", returnUrl);
    formData.append("name", orderTitle);
    formData.append("money", "9.9");
    formData.append("clientip", "127.0.0.1");
    formData.append("sign_type", "MD5");
    formData.append("sign", sign);

    // Build fallbackParams for POST form submission
    const fallbackParams: Record<string, string> = {
      pid: appId,
      type: zpayChannel,
      out_trade_no: orderNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: orderTitle,
      money: "9.9",
      clientip: "127.0.0.1",
      sign_type: "MD5",
      sign: sign,
    };

    // Make request to ZPay with browser-like headers
    const response = await fetch("https://zpayz.cn/mapi.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
      },
      body: formData.toString(),
    });

    console.log("ZPay HTTP Status:", response.status);

    // Read response as text to prevent HTML parsing errors
    const text = await response.text();
    console.log("ZPay Response Length:", text.length);

    // If response is empty, use fallback
    if (!text || text.trim() === "") {
      console.error("ZPay returned empty response, using fallback");
      return NextResponse.json({
        fallbackParams,
        orderNo,
      });
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("ZPay响应解析失败:");
      console.error("Response (first 500 chars):", text.substring(0, 500));
      // Return fallback params for POST form submission
      return NextResponse.json({
        fallbackParams,
        orderNo,
      });
    }

    // ZPay returns code=1 on success
    if (data.code === 1) {
      return NextResponse.json({
        success: true,
        orderNo,
        qrCode: data.qrcode || null,
        payUrl: data.payurl || null,
      });
    }

    // ZPay returned an error, use fallback
    console.error("ZPay API Error:", data);
    return NextResponse.json({
      fallbackParams,
      orderNo,
    });

  } catch (error) {
    console.error("创建支付订单失败:", error);

    // Rebuild fallbackParams for error case
    const appId = process.env.ZPAY_APP_ID || "";
    const appKey = process.env.ZPAY_APP_KEY || "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const zpayChannel = "alipay";
    const notifyUrl = `${baseUrl}/api/pay/notify`;
    const returnUrl = `${baseUrl}/payment/success`;

    const params: Record<string, string> = {
      pid: appId,
      type: zpayChannel,
      out_trade_no: orderNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: orderTitle,
      money: "9.9",
      clientip: "127.0.0.1",
    };

    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
    const signString = paramString + appKey;
    const sign = crypto.createHash("md5").update(signString).digest("hex").toLowerCase();

    const fallbackParams: Record<string, string> = {
      pid: appId,
      type: zpayChannel,
      out_trade_no: orderNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: orderTitle,
      money: "9.9",
      clientip: "127.0.0.1",
      sign_type: "MD5",
      sign: sign,
    };

    return NextResponse.json({
      fallbackParams,
      orderNo,
    });
  }
}