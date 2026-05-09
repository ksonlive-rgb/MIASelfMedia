import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface CreatePayRequest {
  type?: "alipay" | "wxpay";
}

export async function POST(request: NextRequest) {
  const orderNo = `MIA_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    const body: CreatePayRequest = await request.json();
    const payType = body.type || "wxpay";

    const appId = process.env.ZPAY_APP_ID;
    const appKey = process.env.ZPAY_APP_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!appId || !appKey) {
      return NextResponse.json(
        { error: "支付配置未完成，请联系管理员" },
        { status: 500 }
      );
    }

    const notifyUrl = `${baseUrl}/api/pay/notify`;

    // Build parameters object (excluding sign and sign_type)
    const params: Record<string, string> = {
      pid: appId,
      type: payType,
      out_trade_no: orderNo,
      notify_url: notifyUrl,
      name: "自媒体天赋测试",
      money: "0.01",
      clientip: "127.0.0.1",
    };

    // Sort by key a-z
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");

    // Generate MD5 sign: sortParamsString + KEY, then MD5 uppercase
    const signString = paramString + appKey;
    const sign = crypto.createHash("md5").update(signString).digest("hex").toUpperCase();

    // Build form data
    const formData = new URLSearchParams();
    formData.append("pid", appId);
    formData.append("type", payType);
    formData.append("out_trade_no", orderNo);
    formData.append("notify_url", notifyUrl);
    formData.append("name", "自媒体天赋测试");
    formData.append("money", "0.01");
    formData.append("clientip", "127.0.0.1");
    formData.append("sign_type", "MD5");
    formData.append("sign", sign);

    const fallbackUrl = `https://zpayz.cn/submit.php?${formData.toString()}`;

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
      console.error("ZPay returned empty response, using fallback URL");
      return NextResponse.json({
        fallbackUrl,
        orderNo,
      });
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("ZPay响应解析失败:");
      console.error("Response (first 500 chars):", text.substring(0, 500));
      // Return fallback URL instead of 500 error
      return NextResponse.json({
        fallbackUrl,
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
      fallbackUrl,
      orderNo,
    });

  } catch (error) {
    console.error("创建支付订单失败:", error);
    // Return fallback URL instead of 500 error
    const fallbackUrl = `https://zpayz.cn/submit.php?pid=${process.env.ZPAY_APP_ID}&out_trade_no=${orderNo}&type=wxpay&money=0.01&name=自媒体天赋测试`;
    return NextResponse.json({
      fallbackUrl,
      orderNo,
    });
  }
}