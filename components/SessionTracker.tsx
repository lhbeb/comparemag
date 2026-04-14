"use client"

import { useEffect } from "react"

// ─── Session deduplication ────────────────────────────────────────────────────
// One report per browser tab (sessionStorage). A fresh tab = fresh report.
function getOrCreateSessionId(): string | null {
  try {
    const FIRED_KEY = "cm_tracked"
    const SID_KEY = "cm_sid"
    if (sessionStorage.getItem(FIRED_KEY)) return null // already tracked this tab
    sessionStorage.setItem(FIRED_KEY, "1")
    let sid = sessionStorage.getItem(SID_KEY)
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem(SID_KEY, sid)
    }
    return sid
  } catch {
    return "storage-blocked"
  }
}

// ─── Canvas fingerprint ───────────────────────────────────────────────────────
function getCanvasHash(): string {
  try {
    const c = document.createElement("canvas")
    c.width = 220
    c.height = 50
    const ctx = c.getContext("2d")
    if (!ctx) return "no-ctx"
    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillStyle = "#f60"
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = "#069"
    ctx.fillText("CompareMag🔍", 2, 15)
    ctx.fillStyle = "rgba(102,204,0,0.7)"
    ctx.fillText("CompareMag🔍", 4, 17)
    const data = c.toDataURL()
    let h = 0
    for (let i = 0; i < data.length; i++) {
      h = (Math.imul(31, h) + data.charCodeAt(i)) | 0
    }
    return (h >>> 0).toString(16)
  } catch {
    return "canvas-error"
  }
}

// ─── WebGL info ───────────────────────────────────────────────────────────────
function getWebGL(): { vendor: string; renderer: string } {
  try {
    const c = document.createElement("canvas")
    const gl = (c.getContext("webgl") ||
      c.getContext("experimental-webgl")) as WebGLRenderingContext | null
    if (!gl) return { vendor: "no-webgl", renderer: "no-webgl" }
    const ext = gl.getExtension("WEBGL_debug_renderer_info")
    if (ext) {
      return {
        vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) ?? "unknown",
        renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "unknown",
      }
    }
    return {
      vendor: gl.getParameter(gl.VENDOR) ?? "unknown",
      renderer: gl.getParameter(gl.RENDERER) ?? "unknown",
    }
  } catch {
    return { vendor: "webgl-error", renderer: "webgl-error" }
  }
}

// ─── Plugins ──────────────────────────────────────────────────────────────────
function getPlugins(): string[] {
  try {
    return Array.from(navigator.plugins ?? []).map((p) => p.name)
  } catch {
    return []
  }
}

// ─── Build payload ────────────────────────────────────────────────────────────
function buildPayload(sessionId: string) {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const webgl = getWebGL()
  return {
    sessionId,
    url: window.location.href,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: Array.from(navigator.languages ?? []),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: nav.deviceMemory ?? null,
    touchPoints: navigator.maxTouchPoints,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
    },
    canvasHash: getCanvasHash(),
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    plugins: getPlugins(),
  }
}

// ─── Send — guaranteed delivery, zero UX impact ───────────────────────────────
// sendBeacon: fires even when user closes tab, never blocks the browser
// fetch keepalive: fallback with identical guarantees on browsers without sendBeacon
function sendPayload(payload: object) {
  const endpoint = "/api/track-session"
  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  })

  if (typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(endpoint, blob)
    if (sent) return // done — browser queued it
  }

  // Fallback: keepalive fetch (won't cancel on page unload)
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* silent — server has its own retry logic */
  })
}

// ─── Scheduler: runs during browser idle time ─────────────────────────────────
// requestIdleCallback waits until the browser has nothing more important to do.
// This guarantees zero impact on FCP, LCP, TTI, or any core web vital.
function scheduleWhenIdle(task: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    // timeout: 6000ms — if browser never goes idle within 6s, run anyway
    requestIdleCallback(task, { timeout: 6000 })
  } else {
    // Safari fallback — still deferred past all critical rendering
    setTimeout(task, 3000)
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SessionTracker() {
  useEffect(() => {
    scheduleWhenIdle(() => {
      const sessionId = getOrCreateSessionId()
      if (!sessionId) return // already tracked this tab

      try {
        const payload = buildPayload(sessionId)
        sendPayload(payload)
      } catch {
        // Never propagate — this must never affect UX
      }
    })
  }, [])

  return null
}
