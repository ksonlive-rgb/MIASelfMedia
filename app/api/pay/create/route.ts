import { NextRequest, NextResponse } from "next/server";
import { buildZPaySign } from "@/lib/pay/zpaySign";

type QuizId = "parent-child-edu" | "partner-loyalty" | "media-talent";

function resolveQuiz(body: { type?: string; paidLabel?: string }): {
  quizId: QuizId;
  orderTitle: string;
  paidLabel: string;
} {
  const t = typeof body.type === "string" ? body.type : "";
  const pl = typeof body.paidLabel === "string" ? body.paidLabel : "";

  if (t === "parent-child-edu") {
    return { quizId: "parent-child-edu", orderTitle: "亲子教育画像测试", paidLabel: pl };
  }
  if (t === "partner-loyalty") {
    return { quizId: "partner-loyalty", orderTitle: "伴侣忠诚度测试（情侣版）", paidLabel: pl };
  }
  return { quizId: "media-talent", orderTitle: "自媒体天赋测试", paidLabel: t.trim() ? t : pl };
}

function signedZpayFormFields(
  appId: string,
  orderNo: string,
  notifyUrl: string,
  returnUrl: string,
  orderTitle: string,
  appKey: string,
  paramJson: string,
): { formFields: Record<string, string>; sign: string } {
  const base: Record<string, string> = {
    pid: appId,
    type: "alipay",
    out_trade_no: orderNo,
    notify_url: notifyUrl,
    return_url: returnUrl,
    name: orderTitle,
    money: "9.9",
    clientip: "127.0.0.1",
    param: paramJson,
  };
  const sign = buildZPaySign(base, appKey);
  return { formFields: base, sign };
}

export async function POST(request: NextRequest) {
  const orderNo = `MIA_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  let jsonBody: { type?: string; paidLabel?: string } = {};
  try {
    jsonBody = (await request.json()) as typeof jsonBody;
  } catch {
    jsonBody = {};
  }

  const { quizId, orderTitle, paidLabel } = resolveQuiz(jsonBody);
  const paramJson = JSON.stringify({ quiz: quizId, label: paidLabel });

  const metaJson = {
    quizId,
    paidLabel,
    orderNo,
  };

  try {
    const appId = process.env.ZPAY_APP_ID;
    const appKey = process.env.ZPAY_APP_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!appId || !appKey) {
      return NextResponse.json({ error: "支付配置未完成，请联系管理员", ...metaJson }, { status: 500 });
    }

    const notifyUrl = `${baseUrl}/api/pay/notify`;
    const returnUrl = `${baseUrl}/payment/success`;

    const { formFields: signedBase, sign } = signedZpayFormFields(
      appId,
      orderNo,
      notifyUrl,
      returnUrl,
      orderTitle,
      appKey,
      paramJson,
    );

    const formData = new URLSearchParams();
    formData.append("pid", signedBase.pid);
    formData.append("type", signedBase.type);
    formData.append("out_trade_no", signedBase.out_trade_no);
    formData.append("notify_url", signedBase.notify_url);
    formData.append("return_url", signedBase.return_url);
    formData.append("name", signedBase.name);
    formData.append("money", signedBase.money);
    formData.append("clientip", signedBase.clientip);
    formData.append("param", signedBase.param);
    formData.append("sign_type", "MD5");
    formData.append("sign", sign);

    const fallbackParams: Record<string, string> = {
      pid: signedBase.pid,
      type: signedBase.type,
      out_trade_no: signedBase.out_trade_no,
      notify_url: signedBase.notify_url,
      return_url: signedBase.return_url,
      name: signedBase.name,
      money: signedBase.money,
      clientip: signedBase.clientip,
      param: signedBase.param,
      sign_type: "MD5",
      sign,
    };

    const response = await fetch("https://zpayz.cn/mapi.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
      },
      body: formData.toString(),
    });

    const text = await response.text();

    if (!text || text.trim() === "") {
      console.error("ZPay returned empty response, using fallback");
      return NextResponse.json({ fallbackParams, ...metaJson });
    }

    let data: { code?: number; qrcode?: string; payurl?: string };
    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      console.error("ZPay响应解析失败:", text.substring(0, 500));
      return NextResponse.json({ fallbackParams, ...metaJson });
    }

    if (data.code === 1) {
      return NextResponse.json({
        success: true,
        ...metaJson,
        qrCode: data.qrcode || null,
        payUrl: data.payurl || null,
      });
    }

    console.error("ZPay API Error:", data);
    return NextResponse.json({ fallbackParams, ...metaJson });
  } catch (error) {
    console.error("创建支付订单失败:", error);

    const appId = process.env.ZPAY_APP_ID || "";
    const appKey = process.env.ZPAY_APP_KEY || "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!appId || !appKey) {
      return NextResponse.json({ error: "支付配置未完成", ...metaJson }, { status: 500 });
    }

    const notifyUrl = `${baseUrl}/api/pay/notify`;
    const returnUrl = `${baseUrl}/payment/success`;

    const { formFields: fb, sign } = signedZpayFormFields(
      appId,
      orderNo,
      notifyUrl,
      returnUrl,
      orderTitle,
      appKey,
      paramJson,
    );

    const fallbackParams: Record<string, string> = {
      pid: fb.pid,
      type: fb.type,
      out_trade_no: fb.out_trade_no,
      notify_url: fb.notify_url,
      return_url: fb.return_url,
      name: fb.name,
      money: fb.money,
      clientip: fb.clientip,
      param: fb.param,
      sign_type: "MD5",
      sign,
    };

    return NextResponse.json({ fallbackParams, ...metaJson });
  }
}
