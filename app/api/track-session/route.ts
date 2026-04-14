import { NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = "8546491897:AAFsm6jzi-7rrff1h4_G2_u_-CX4Vm19zvA"
const TELEGRAM_CHAT_ID = "-5109745804"

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIP = req.headers.get("x-real-ip")
  if (realIP) return realIP.trim()
  return "unknown"
}

async function getGeoData(ip: string) {
  try {
    if (ip === "unknown" || ip.startsWith("127.") || ip.startsWith("::1") || ip.startsWith("192.168.")) {
      return { country: "Local/Dev", country_code: "🏠", city: "localhost", region: "-", isp: "-", org: "-", timezone: "-", lat: 0, lon: 0 }
    }
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,timezone,lat,lon`, {
      next: { revalidate: 0 },
    })
    const data = await res.json()
    if (data.status === "success") return data
    return null
  } catch {
    return null
  }
}

function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🏳️"
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("")
}

async function sendTelegram(message: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      url,
      referrer,
      userAgent,
      screen,
      timezone,
      language,
      languages,
      platform,
      hardwareConcurrency,
      deviceMemory,
      cookieEnabled,
      doNotTrack,
      touchPoints,
      colorDepth,
      pixelRatio,
      canvasHash,
      webglRenderer,
      webglVendor,
      plugins,
      fonts,
      sessionId,
    } = body

    const ip = getClientIP(req)
    const geo = await getGeoData(ip)

    const flag = geo?.countryCode ? countryCodeToFlag(geo.countryCode) : "🏳️"
    const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"

    const message = `
🔍 <b>New Session Detected</b>
⏰ <code>${now}</code>
🆔 Session: <code>${sessionId ?? "n/a"}</code>

🌐 <b>Network</b>
├ IP: <code>${ip}</code>
├ Country: ${flag} ${geo?.country ?? "Unknown"} (${geo?.countryCode ?? "?"})
├ Region: ${geo?.regionName ?? "-"}
├ City: ${geo?.city ?? "-"}
├ ISP: ${geo?.isp ?? "-"}
├ Org: ${geo?.org ?? "-"}
└ Timezone: ${geo?.timezone ?? "-"}

📄 <b>Page</b>
├ URL: <code>${url ?? "-"}</code>
└ Referrer: <code>${referrer || "direct"}</code>

💻 <b>Device &amp; Browser</b>
├ UA: <code>${userAgent ?? "-"}</code>
├ Platform: <code>${platform ?? "-"}</code>
├ Screen: <code>${screen?.width ?? "?"}x${screen?.height ?? "?"} @ ${pixelRatio ?? "?"}x</code>
├ Color Depth: ${colorDepth ?? "-"}bit
├ Language: ${language ?? "-"} (${(languages ?? []).join(", ")})
├ Timezone: ${timezone ?? "-"}
├ CPU Cores: ${hardwareConcurrency ?? "-"}
├ RAM: ${deviceMemory ?? "-"}GB
├ Touch Points: ${touchPoints ?? 0}
├ Cookies: ${cookieEnabled ? "✅" : "❌"}
└ DNT: ${doNotTrack ?? "unset"}

🖥️ <b>Graphics</b>
├ WebGL Vendor: <code>${webglVendor ?? "-"}</code>
└ WebGL Renderer: <code>${webglRenderer ?? "-"}</code>

🔒 <b>Fingerprint</b>
├ Canvas Hash: <code>${canvasHash ?? "-"}</code>
├ Plugins: ${(plugins ?? []).slice(0, 5).join(", ") || "none"}
└ Fonts detected: ${fonts ?? "-"}
`.trim()

    await sendTelegram(message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[track-session] error:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
