import crypto from "crypto";

/**
 * ZPay MD5 签名：参数名 ASCII 升序，sign / sign_type / 空值不参与，值不做 URL 编码。
 * 拼接串末尾直接拼接商户 KEY，再 MD5 小写。
 */
export function buildZPaySign(params: Record<string, string>, appKey: string): string {
  const entries = Object.entries(params).filter(
    ([k, v]) =>
      k !== "sign" &&
      k !== "sign_type" &&
      v !== undefined &&
      v !== null &&
      String(v).trim() !== "",
  );
  entries.sort(([a], [b]) => a.localeCompare(b));
  const paramString = entries.map(([k, v]) => `${k}=${v}`).join("&");
  return crypto.createHash("md5").update(paramString + appKey).digest("hex").toLowerCase();
}

export function verifyZPayNotifyQuery(
  searchParams: URLSearchParams,
  appKey: string,
): { ok: boolean; params: Record<string, string> } {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  const provided = raw.sign?.toLowerCase();
  if (!provided) return { ok: false, params: raw };
  const computed = buildZPaySign(raw, appKey);
  return { ok: computed === provided, params: raw };
}
