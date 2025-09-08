import type { Handler } from "@netlify/functions";

function json(statusCode: number, data: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(data),
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const toRaw: string = body.to;
    const channel: "sms" | "whatsapp" = body.channel;
    const text: string = body.text;
    if (!toRaw || !text || !channel) return json(400, { error: "Missing to/channel/text" });

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      return json(501, { error: "SMS service not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in environment." });
    }

    // Lazy import to avoid bundling when not configured
    const twilio = (await import("twilio")).default as any;
    const client = twilio(sid, token);

    const normalizePhone = (n: string) => {
      const t = n.trim();
      if (t.startsWith("+")) return t;
      // default to India country code if 10 digits
      const digits = t.replace(/\D/g, "");
      if (digits.length === 10) return "+91" + digits;
      return t;
    };

    let from: string | undefined;
    let to: string;
    if (channel === "whatsapp") {
      const WFROM = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
      if (!WFROM) return json(501, { error: "Missing TWILIO_WHATSAPP_FROM" });
      from = WFROM.startsWith("whatsapp:") ? WFROM : `whatsapp:${WFROM}`;
      const normalized = normalizePhone(toRaw);
      to = normalized.startsWith("whatsapp:") ? normalized : `whatsapp:${normalized}`;
    } else {
      const SFROM = process.env.TWILIO_SMS_FROM; // e.g. +15005550006
      if (!SFROM) return json(501, { error: "Missing TWILIO_SMS_FROM" });
      from = SFROM;
      to = normalizePhone(toRaw);
    }

    const resp = await client.messages.create({ from, to, body: text });
    return json(200, { ok: true, sid: resp.sid });
  } catch (e: any) {
    return json(500, { error: e?.message || String(e) });
  }
};
