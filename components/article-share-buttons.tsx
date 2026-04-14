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
    <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-slate-200 text-slate-700 hover:bg-white hover:text-blue-600"
          onClick={() => handleShare("twitter")}
        >
          <Twitter className="h-4 w-4 mr-2" />
          Tweet
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-slate-200 text-slate-700 hover:bg-white hover:text-blue-600"
          onClick={() => handleShare("facebook")}
        >
          <Facebook className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-slate-200 text-slate-700 hover:bg-white hover:text-blue-600"
          onClick={() => handleShare("linkedin")}
        >
          <Linkedin className="h-4 w-4 mr-2" />
          Post
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-9 border-slate-200 text-slate-700 hover:bg-white hover:text-blue-600"
        onClick={() => handleShare("clipboard")}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Copy
      </Button>
    </div>
  )
}
