/**
 * Certonis contact endpoint — Cloudflare Worker
 *
 * Receives the JSON payload from the website's contact form and sends it as an
 * e-mail through Microsoft Graph, from and to info@certonis.com.
 *
 * Required secrets (wrangler secret put <NAME>):
 *   MS_TENANT_ID      Directory (tenant) ID of the Microsoft 365 tenant
 *   MS_CLIENT_ID      Application (client) ID of the app registration
 *   MS_CLIENT_SECRET  Client secret value of that app registration
 *
 * Required variables (wrangler.toml [vars]):
 *   MAILBOX           info@certonis.com
 *   ALLOWED_ORIGINS   comma separated list of origins allowed to post here
 *
 * The app registration needs the APPLICATION permission Mail.Send with admin
 * consent granted. Scope it down to the single mailbox with an Exchange
 * application access policy so the app cannot send as anyone else:
 *
 *   New-ApplicationAccessPolicy -AppId <MS_CLIENT_ID> `
 *     -PolicyScopeGroupId info@certonis.com -AccessRight RestrictAccess `
 *     -Description "Certonis website contact form"
 */

const FIELDS = [
  ["name", "Name"],
  ["company", "Firma"],
  ["email", "E-Mail"],
  ["phone", "Telefon"],
  ["employees", "Mitarbeiter"],
  ["current_system", "Aktuelles System"],
  ["timeline", "Gewünschter Start"],
  ["language", "Sprache"],
  ["page", "Seite"]
];

const MAX_LEN = 5000;

function corsHeaders(origin, allowed) {
  const ok = allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0] || "https://certonis.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}

function clean(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\x00-\x1F\x7F]/g, "").slice(0, MAX_LEN).trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getToken(env) {
  const body = new URLSearchParams({
    client_id: env.MS_CLIENT_ID,
    client_secret: env.MS_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${env.MS_TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }
  );

  if (!res.ok) throw new Error("token request failed: " + res.status);
  const data = await res.json();
  return data.access_token;
}

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || "https://certonis.com")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, allowed);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "method not allowed" }, 405, cors);
    if (origin && !allowed.includes(origin)) return json({ error: "origin not allowed" }, 403, cors);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid json" }, 400, cors);
    }

    // bot trap — the form ships a hidden field that humans never fill in
    if (clean(payload._hp)) return json({ ok: true }, 200, cors);

    const name = clean(payload.name);
    const email = clean(payload.email);
    const message = clean(payload.message);

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
      return json({ error: "missing or invalid fields" }, 422, cors);
    }

    const rows = FIELDS.map(([key, label]) => {
      const value = clean(payload[key]);
      return value ? `<tr><td style="padding:4px 14px 4px 0;color:#666">${label}</td><td><strong>${escapeHtml(value)}</strong></td></tr>` : "";
    }).join("");

    const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.5">
<h2 style="margin:0 0 16px">Neue Anfrage über certonis.com</h2>
<table style="border-collapse:collapse;font-size:14px">${rows}</table>
<h3 style="margin:24px 0 8px">Nachricht</h3>
<p style="white-space:pre-wrap;font-size:14px">${escapeHtml(message)}</p>
<hr style="margin:24px 0;border:0;border-top:1px solid #eee">
<p style="font-size:12px;color:#888">Gesendet am ${new Date().toISOString()} · IP-Land: ${request.cf?.country || "?"}</p>
</body></html>`;

    const mail = {
      message: {
        subject: `Anfrage certonis.com — ${clean(payload.company) || name}`,
        body: { contentType: "HTML", content: html },
        toRecipients: [{ emailAddress: { address: env.MAILBOX } }],
        replyTo: [{ emailAddress: { address: email, name } }]
      },
      saveToSentItems: true
    };

    try {
      const token = await getToken(env);
      const res = await fetch(
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.MAILBOX)}/sendMail`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(mail)
        }
      );

      if (!res.ok) {
        const detail = await res.text();
        console.log("graph error", res.status, detail.slice(0, 500));
        return json({ error: "send failed" }, 502, cors);
      }
    } catch (err) {
      console.log("worker error", String(err));
      return json({ error: "send failed" }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  }
};
