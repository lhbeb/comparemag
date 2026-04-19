"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem("comparemag-cookie-consent")
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("comparemag-cookie-consent", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in-up pointer-events-none">
      <div className="max-w-4xl mx-auto w-full pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="hidden sm:flex flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">We value your privacy</h4>
              <p className="text-sm text-slate-600 leading-snug">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 gap-3 w-full sm:w-auto">
            <Button 
              onClick={handleAccept} 
              className="w-full sm:w-auto bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-md hover:shadow-orange-700/25 px-8"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
