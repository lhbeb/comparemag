'use client'

import React from 'react'

export function EmbeddedScript({ src }: { src: string }) {
  React.useEffect(() => {
    if (!src) return
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (src.includes('instagram')) (window as any).instgrm?.Embeds?.process()
      if (src.includes('twitter')) (window as any).twttr?.widgets?.load()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    document.body.appendChild(script)
  }, [src])
  return null
}
