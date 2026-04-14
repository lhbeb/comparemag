"use client"

import React, { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate subscription process
    setTimeout(() => {
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      })
      setEmail("")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
      <Input
        type="email"
        placeholder="your@email.com"
        className="h-12 sm:h-14 text-base px-6 bg-white/10 border-white/30 text-white placeholder:text-blue-200 focus-visible:bg-white/20 focus-visible:ring-white/30 flex-1 rounded-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button
        type="submit"
        className="h-12 sm:h-14 text-base px-8 bg-orange-600 hover:bg-orange-700 whitespace-nowrap text-white w-full sm:w-auto font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-full transition-all"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Subscribing..." : "Subscribe Free"}
      </Button>
    </form>
  )
}
