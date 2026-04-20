'use client'

import React, { useEffect, useRef, useState } from 'react'

export function LazyTwitterEmbed({ tweetId }: { tweetId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasRenderedRef = useRef(false)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    const renderTweet = () => {
      if (isCancelled || hasRenderedRef.current) return

      // If twitter widgets API is available, use it
      if ((window as any).twttr?.widgets?.createTweet) {
        if (containerRef.current) {
          if (containerRef.current.dataset.tweetRendered === tweetId) {
            hasRenderedRef.current = true
            if (!isCancelled) setLoading(false)
            return
          }

          containerRef.current.innerHTML = '' // Clear out any previous loading state

          hasRenderedRef.current = true
          ;(window as any).twttr.widgets.createTweet(
            tweetId,
            containerRef.current,
            { align: 'center', dnt: true }
          ).then(() => {
            if (containerRef.current) {
              containerRef.current.dataset.tweetRendered = tweetId
            }
            if (!isCancelled) setLoading(false)
          }).catch((err: any) => {
            console.error('Failed to load tweet', err)
            hasRenderedRef.current = false
            if (!isCancelled) setLoading(false)
          })
        }
      } else {
        // If script hasn't loaded yet, try again shortly
        retryTimeoutRef.current = setTimeout(renderTweet, 300)
      }
    }

    // Load Twitter script if it doesn't exist
    if (!(window as any).twttr) {
      const existing = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
      if (!existing) {
        const script = document.createElement('script')
        script.src = "https://platform.twitter.com/widgets.js"
        script.async = true
        script.charset = "utf-8"
        document.body.appendChild(script)
      }
    }

    renderTweet()

    return () => {
      isCancelled = true
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [tweetId])

  return (
    <div className="w-full flex justify-center my-6 relative min-h-[250px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
            <span className="text-sm font-medium text-slate-500">Loading Tweet...</span>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full max-w-[550px]" />
    </div>
  )
}
