import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface CreatePayRequest {
  type?: "alipay" | "wxpay";
}

export async function POST(request: NextRequest) {
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

    const orderNo = `MIA_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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

    // Make request to ZPay
    const response = await fetch("https://zpayz.cn/mapi.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    // Read response as text to prevent HTML parsing errors
    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("ZPay响应解析失败:");
      console.error("Response (first 500 chars):", text.substring(0, 500));
      return NextResponse.json(
        { error: "支付接口返回了非预期的格式，请稍后重试" },
        { status: 500 }
      );
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

    // ZPay returned an error
    console.error("ZPay API Error:", data);
    return NextResponse.json(
      { error: data.msg || data.errmsg || "创建订单失败" },
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