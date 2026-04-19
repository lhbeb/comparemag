'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Video } from 'lucide-react'

interface LazyTikTokEmbedProps {
  videoId: string
}

export function LazyTikTokEmbed({ videoId }: LazyTikTokEmbedProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (shouldLoad || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px 0px' },
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <div ref={containerRef} className="flex justify-center w-full my-10">
      {shouldLoad ? (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}?lang=en-US`}
          className="w-full max-w-[325px] sm:max-w-[400px] border-none shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white rounded-xl"
          style={{ height: '730px', minWidth: '325px' }}
          allowFullScreen
          scrolling="no"
          allow="encrypted-media"
          loading="lazy"
          title="TikTok video player"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShouldLoad(true)}
          className="w-full max-w-[325px] sm:max-w-[400px] min-h-[730px] rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 flex flex-col items-center justify-center text-center hover:border-orange-300 hover:bg-white transition-colors"
        >
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-600/20">
            <Play className="h-7 w-7 fill-current" />
          </div>
          <div className="mb-2 flex items-center gap-2 text-slate-900 font-bold">
            <Video className="h-4 w-4 text-orange-600" />
            TikTok Embed
          </div>
          <p className="max-w-[20rem] text-sm leading-relaxed text-slate-600">
            This embed loads on demand to keep the article fast. Tap to view the TikTok inside the page.
          </p>
        </button>
      )}
    </div>
  )
}
