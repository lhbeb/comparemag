"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// ─── Session ID (stable for the whole tab) ────────────────────────────────────
function getSessionId(): string {
  try {
    const KEY = "cm_sid"
    let sid = sessionStorage.getItem(KEY)
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem(KEY, sid)
    }
    return sid
  } catch {
    return "storage-blocked"
  }
}

// ─── Per-path dedup — track each unique path once per tab ─────────────────────
// Stored in memory (a Set) so SPA navigations back to the same URL don't double-fire,
// but a hard reload (new tab) always fires fresh.
const reportedPaths = new Set<string>()

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

// ─── Send — fire-and-forget, zero UX impact ───────────────────────────────────
function sendPayload(payload: object) {
  const endpoint = "/api/track-session"
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })

  if (typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(endpoint, blob)
    if (sent) return
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => { /* silent */ })
}

// ─── Scheduler: runs only during browser idle time ────────────────────────────
function scheduleWhenIdle(task: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    requestIdleCallback(task, { timeout: 6000 })
  } else {
    setTimeout(task, 3000) // Safari fallback
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SessionTracker() {
  const pathname = usePathname() // re-renders on every SPA navigation
  const sessionId = useRef<string | null>(null)

  useEffect(() => {
    // Initialise session ID once per tab
    if (!sessionId.current) {
      sessionId.current = getSessionId()
    }

    const currentPath = window.location.pathname

    // Skip if this exact path was already reported in this tab
    if (reportedPaths.has(currentPath)) return
    reportedPaths.add(currentPath)

    const sid = sessionId.current

    scheduleWhenIdle(() => {
      try {
        const payload = buildPayload(sid)
        sendPayload(payload)
      } catch {
        // Never propagate — must never affect UX
      }
    })
  }, [pathname]) // ← fires on every route change, including direct loads

  return null
}
