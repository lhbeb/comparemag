"use client"

import { useEffect } from "react"

function generateSessionId(): string {
  const key = "cm_sid"
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(key, sid)
  }
  return sid
}

async function getCanvasHash(): Promise<string> {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext("2d")
    if (!ctx) return "no-ctx"
    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillStyle = "#f60"
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = "#069"
    ctx.fillText("CompareMag🔍", 2, 15)
    ctx.fillStyle = "rgba(102,204,0,0.7)"
    ctx.fillText("CompareMag🔍", 4, 17)
    const data = canvas.toDataURL()
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i)
      hash |= 0
    }
    return hash.toString(16)
  } catch {
    return "error"
  }
}

function getWebGLInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null
    if (!gl) return { vendor: "no-webgl", renderer: "no-webgl" }
    const ext = gl.getExtension("WEBGL_debug_renderer_info")
    if (ext) {
      return {
        vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) ?? "unknown",
        renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "unknown",
      }
    }
    return { vendor: gl.getParameter(gl.VENDOR), renderer: gl.getParameter(gl.RENDERER) }
  } catch {
    return { vendor: "error", renderer: "error" }
  }
}

function getPlugins(): string[] {
  try {
    return Array.from(navigator.plugins).map((p) => p.name)
  } catch {
    return []
  }
}

export default function SessionTracker() {
  useEffect(() => {
    // Only fire once per session tab
    const firedKey = "cm_tracked"
    if (sessionStorage.getItem(firedKey)) return
    sessionStorage.setItem(firedKey, "1")

    const run = async () => {
      try {
        const [canvasHash, webgl] = await Promise.all([
          getCanvasHash(),
          Promise.resolve(getWebGLInfo()),
        ])

        const nav = navigator as Navigator & {
          deviceMemory?: number
          connection?: { effectiveType?: string }
        }

        const payload = {
          sessionId: generateSessionId(),
          url: window.location.href,
          referrer: document.referrer,
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
          canvasHash,
          webglVendor: webgl.vendor,
          webglRenderer: webgl.renderer,
          plugins: getPlugins(),
          fonts: null, // can be extended with FontFace API if needed
        }

        await fetch("/api/track-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        })
      } catch {
        // Silent fail — never break user experience
      }
    }

    // Small delay so it doesn't compete with critical resources
    const timer = setTimeout(run, 1500)
    return () => clearTimeout(timer)
  }, [])

  return null
}
