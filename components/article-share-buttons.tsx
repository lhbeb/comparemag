"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Share2, Twitter, Facebook, Linkedin } from "lucide-react"

interface ArticleShareButtonsProps {
  title: string
}

export function ArticleShareButtons({ title }: ArticleShareButtonsProps) {
  const { toast } = useToast()

  const shareOptions = [
    { key: "twitter", label: "Tweet", icon: Twitter },
    { key: "facebook", label: "Share", icon: Facebook },
    { key: "linkedin", label: "Post", icon: Linkedin },
    { key: "clipboard", label: "Copy", icon: Share2 },
  ] as const

  const handleShare = (platform: string) => {
    // Only execute on client
    if (typeof window === "undefined") return

    const url = window.location.href
    const text = `Check out this article: ${title}`
    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      default:
        navigator.clipboard.writeText(url)
        toast({
          title: "Link copied",
          description: "The article link has been copied to your clipboard.",
        })
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {shareOptions.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className="h-10 w-full justify-center whitespace-nowrap border-slate-200 bg-white px-3 text-slate-700 hover:bg-white hover:text-slate-900 sm:h-9 sm:w-auto"
            onClick={() => handleShare(key)}
          >
            <Icon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
