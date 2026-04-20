"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Search, Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { LazySearchBar } from "@/components/lazy-search-bar"

const navLinks = [
  { label: "Trending", href: "/topics/trending/" },
  { label: "Tech", href: "/topics/tech/" },
  { label: "Innovation", href: "/topics/innovation/" },
  { label: "Business", href: "/topics/business/" },
  { label: "Security", href: "/topics/security/" },
  { label: "Advice", href: "/topics/advice/" },
  { label: "Buying Guides", href: "/articles/" },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const closeAll = () => {
    setMobileMenuOpen(false)
    setMobileSearchOpen(false)
  }

  return (
    <>
      <header className="site-header sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 lg:gap-8 h-20 sm:h-24">
            {/* Logo */}
            <Logo className="flex-shrink-0 transition-transform hover:scale-105 duration-300" priority />

            {/* Navigation Links - Desktop only */}
            <div className="hidden lg:flex flex-1 justify-center">
              <nav className="flex items-center gap-1 text-[15px] flex-shrink-0 bg-white/5 rounded-full px-1.5 py-1.5 backdrop-blur-sm border border-white/10 h-11">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-3.5 py-1.5 text-white hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 font-medium group whitespace-nowrap"
                  >
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Action Group */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Search Bar - Desktop */}
              <div className="hidden md:block">
                <Suspense fallback={<div className="w-[200px] h-11 bg-white/5 rounded-full animate-pulse" />}>
                  <LazySearchBar />
                </Suspense>
              </div>

              {/* Mobile Search icon */}
              <button
                type="button"
                className="md:hidden flex items-center justify-center bg-white/5 hover:bg-white/15 text-white h-10 w-10 rounded-full transition-all duration-300 border border-white/10 shadow-sm flex-shrink-0"
                onClick={() => {
                  setMobileSearchOpen(!mobileSearchOpen)
                  setMobileMenuOpen(false)
                }}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Subscribe button */}
              <Button
                asChild
                className="bg-orange-700 hover:bg-orange-800 text-white h-10 px-4 sm:px-6 font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 rounded-full text-sm flex-shrink-0"
              >
                <Link href="/#newsletter">
                  <span className="hidden sm:inline">Subscribe</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </Button>

              {/* Hamburger - mobile/tablet only */}
              <button
                type="button"
                className="lg:hidden flex items-center justify-center bg-white/5 hover:bg-white/15 text-white h-10 w-10 rounded-full transition-all duration-300 border border-white/10 shadow-sm flex-shrink-0"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen)
                  setMobileSearchOpen(false)
                }}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Dropdown - inside header */}
          {mobileSearchOpen && (
            <div className="md:hidden pb-3 pt-1 animate-in slide-in-from-top-2 duration-200">
              <Suspense fallback={<div className="w-full h-11 bg-white/5 rounded-xl animate-pulse" />}>
                <LazySearchBar />
              </Suspense>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu - Full width overlay OUTSIDE the sticky header so it is never clipped */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={closeAll}
            aria-hidden="true"
          />
          {/* Menu Panel */}
          <div className="fixed top-0 left-0 right-0 z-50 lg:hidden animate-in slide-in-from-top-3 duration-200"
            style={{ marginTop: 'calc(var(--header-height, 80px))' }}
          >
            <nav
              className="mx-4 mt-2 flex flex-col gap-1 rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(222 68% 22%) 0%, hsl(221 75% 28%) 100%)' }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white hover:bg-white/15 px-5 py-4 font-semibold text-base transition-colors border-b border-white/10 last:border-0 active:bg-white/20"
                  onClick={closeAll}
                >
                  {link.label}
                </Link>
              ))}
              <div className="p-4 pt-2">
                <Link
                  href="/#newsletter"
                  onClick={closeAll}
                  className="flex items-center justify-center w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full text-sm transition-colors"
                >
                  Subscribe to Newsletter
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
