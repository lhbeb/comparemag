import { NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = "8546491897:AAFsm6jzi-7rrff1h4_G2_u_-CX4Vm19zvA"
const TELEGRAM_CHAT_ID = "-5109745804"
const MAX_RETRIES = 3

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIP(req: NextRequest): string {
  const candidates = [
    req.headers.get("cf-connecting-ip"),       // Cloudflare
    req.headers.get("x-forwarded-for"),         // Most proxies / Vercel
    req.headers.get("x-real-ip"),               // Nginx
    req.headers.get("x-client-ip"),
    req.headers.get("true-client-ip"),          // Akamai / Cloudflare Enterprise
  ]
  for (const raw of candidates) {
    if (raw) {
      const ip = raw.split(",")[0].trim()
      if (ip) return ip
    }
  }
  return "unknown"
}

async function getGeoData(ip: string) {
  // Skip geo for private / local addresses
  if (
    !ip ||
    ip === "unknown" ||
    ip.startsWith("127.") ||
    ip.startsWith("::1") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.match(/^172\.(1[6-9]|2\d|3[01])\./)
  ) {
    return {
      country: "Local / Dev",
      countryCode: "🏠",
      regionName: "localhost",
      city: "localhost",
      isp: "-",
      org: "-",
      timezone: "-",
    }
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,timezone`,
      { headers: { Accept: "application/json" } }
    )
    const data = await res.json()
    if (data.status === "success") return data
  } catch {
    // geo failure is non-fatal
  }
  return null
}

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🏳️"
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(127397 + c.charCodeAt(0))).join("")
}

// ─── Telegram send with retry ─────────────────────────────────────────────────

async function sendTelegram(text: string, attempt = 1): Promise<void> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    )

    if (res.ok) return // ✅ delivered

    const body = await res.text()
    console.warn(`[track-session] Telegram attempt ${attempt} failed: ${res.status} — ${body}`)
  } catch (err) {
    console.warn(`[track-session] Telegram attempt ${attempt} network error:`, err)
  }

  if (attempt < MAX_RETRIES) {
    // Exponential backoff: 1s → 2s → 4s
    await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
    return sendTelegram(text, attempt + 1)
  }

  console.error(`[track-session] Telegram delivery failed after ${MAX_RETRIES} attempts.`)
}

// ─── Format message ───────────────────────────────────────────────────────────

function buildMessage(ip: string, geo: ReturnType<typeof getGeoData> extends Promise<infer T> ? T : never, body: Record<string, unknown>): string {
  const flag = geo?.countryCode ? countryFlag(geo.countryCode as string) : "🏳️"
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"
  const s = body.screen as { width?: number; height?: number } | undefined

  // Extract domain from full URL
  let domain = "-"
  try {
    const parsed = new URL(String(body.url ?? ""))
    domain = parsed.hostname
  } catch { /* keep "-" */ }

  // Full OS + device type from UA
  const ua = String(body.userAgent ?? "")
  function detectOS(ua: string): string {
    if (/Android/i.test(ua))                        return "Android"
    if (/iPhone/i.test(ua))                         return "iOS (iPhone)"
    if (/iPad/i.test(ua))                           return "iOS (iPad)"
    if (/CrOS/i.test(ua))                           return "ChromeOS"
    if (/Macintosh|Mac OS X/i.test(ua))             return "macOS"
    if (/Windows NT 10/i.test(ua))                  return "Windows 10/11"
    if (/Windows NT 6\.3/i.test(ua))                return "Windows 8.1"
    if (/Windows NT 6\.1/i.test(ua))                return "Windows 7"
    if (/Windows/i.test(ua))                        return "Windows"
    if (/Linux/i.test(ua))                          return "Linux"
    return "Unknown OS"
  }
  const os = detectOS(ua)
  const isMobile = (body.touchPoints as number) > 0
  const formFactor = isMobile
    ? ua.includes("iPad") ? "Tablet" : "Phone"
    : "Desktop"
  const device = `${formFactor} · ${os}`


  // Referrer: always a value, never empty
  const referrer = body.referrer && String(body.referrer).trim()
    ? String(body.referrer)
    : "direct"

  return [
    `👁 <b>New Visit</b>`,
    `📄 <a href="${body.url}">${body.url}</a>`,
    ``,
    `🔗 Ref: <code>${referrer}</code>`,
    `🖥 IP: <code>${ip}</code>`,
    `${flag} ${geo?.city ?? "?"}, ${geo?.country ?? "?"} (${geo?.countryCode ?? "?"})`,
    `📡 ${geo?.isp ?? "-"}`,
    ``,
    `💻 ${device} · ${s?.width ?? "?"}×${s?.height ?? "?"} · ${body.language ?? "-"}`,
    `🔑 Canvas: <code>${body.canvasHash ?? "-"}</code>`,
    ``,
    `📅 ${ts}`,
  ].join("\n").trim()
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Respond to client IMMEDIATELY — Telegram delivery happens in the background.
  // This means the client's sendBeacon gets acknowledged instantly and the
  // website never waits for Telegram.

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 })
  }

  // Do not track admin dashboard visits
  if (String(body.url ?? "").includes("/admin")) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const ip = getClientIP(req)

  // Kick off the slow work (geo + Telegram) without blocking the response
  const work = async () => {
    try {
      const geo = await getGeoData(ip)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = buildMessage(ip, geo as any, body)
      await sendTelegram(message)
    } catch (err) {
      console.error("[track-session] unexpected error:", err)
    }
  }

  // Use waitUntil if available (Vercel Edge / Cloudflare Workers)
  // so the process isn't killed before the async work finishes
  if (req.signal != null && typeof (globalThis as { EdgeRuntime?: string }).EdgeRuntime === "string") {
    // Edge runtime — use native waitUntil via event
    work() // fire and forget — edge runtime keeps it alive
  } else {
    // Node.js runtime — schedule micro-task after response
    setImmediate ? setImmediate(() => { work() }) : setTimeout(() => { work() }, 0)
  }

  // ← Client gets this instantly, never waits for Telegram
  return NextResponse.json({ ok: true })
}
