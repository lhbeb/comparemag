"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Search, Menu, X, Mail } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { LazySearchBar } from "@/components/lazy-search-bar"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 sm:gap-4 h-20 sm:h-24">
          {/* Logo */}
          <Logo className="flex-shrink-0 transition-transform hover:scale-105 duration-300" priority />

          {/* Search Bar - Hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg">
            <Suspense fallback={<div className="w-full h-11 bg-white/5 rounded-xl animate-pulse" />}>
              <LazySearchBar />
            </Suspense>
          </div>

          {/* Navigation Links - Hidden on mobile/tablet, visible on desktop */}
          <nav className="hidden lg:flex items-center gap-1.5 text-[15px] flex-shrink-0 bg-white/5 rounded-full px-2 py-1.5 backdrop-blur-sm border border-white/10 h-11">
            <Link
              href="/topics/trending/"
              className="relative px-4 py-2 text-white hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 font-semibold group whitespace-nowrap"
            >
              <span className="relative z-10">Trending</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/topics/tech/"
              className="relative px-4 py-2 text-white hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 font-semibold group whitespace-nowrap"
            >
              <span className="relative z-10">Tech</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/topics/innovation/"
              className="relative px-4 py-2 text-white hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 font-semibold group whitespace-nowrap"
            >
              <span className="relative z-10">Innovation</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/topics/business/"
              className="relative px-4 py-2 text-white hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 font-semibold group whitespace-nowrap"
            >
              <span className="relative z-10">Business</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/topics/security/"
              className="relative px-4 py-2 text-white hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 font-semibold group whitespace-nowrap"
            >
              <span className="relative z-10">Security</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/topics/advice/"
              className="relative px-4 py-2 text-white hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 font-semibold group whitespace-nowrap"
            >
              <span className="relative z-10">Advice</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/articles/"
              className="relative px-4 py-2 text-white hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 font-semibold group whitespace-nowrap"
            >
              <span className="relative z-10">Buying Guides</span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </nav>

          {/* Mobile Search icon - mobile only, sits left of the right action group */}
          <Button
            className="md:hidden bg-white/10 hover:bg-white/20 text-white h-11 w-11 p-0 rounded-full transition-all duration-300 hover:scale-105 flex-shrink-0 border border-white/20"
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen)
              if (mobileMenuOpen) setMobileMenuOpen(false)
            }}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Right action group: Newsletter directly left of Menu (best practice) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Subscribe / Newsletter button */}
            <Button
              asChild
              className="bg-orange-600 hover:bg-orange-700 text-white h-11 px-4 sm:px-6 font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] rounded-full text-sm flex-shrink-0"
            >
              <Link href="/#newsletter">
                <Mail className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Subscribe</span>
              </Link>
            </Button>

            {/* Hamburger - far right, hidden on desktop */}
            <Button
              className="lg:hidden bg-white/10 hover:bg-white/20 text-white h-11 w-11 p-0 rounded-full transition-all duration-300 hover:scale-105 flex-shrink-0 border border-white/20"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen)
                if (mobileSearchOpen) setMobileSearchOpen(false)
              }}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 pt-2 animate-in slide-in-from-top-2 duration-200">
            <Suspense fallback={<div className="w-full h-11 bg-white/5 rounded-xl animate-pulse" />}>
              <LazySearchBar />
            </Suspense>
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
              <Link href="/topics/trending/" className="text-white hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Trending
              </Link>
              <Link href="/topics/tech/" className="text-white hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Tech
              </Link>
              <Link href="/topics/innovation/" className="text-white hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Innovation
              </Link>
              <Link href="/topics/business/" className="text-white hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Business
              </Link>
              <Link href="/topics/security/" className="text-white hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Security
              </Link>
              <Link href="/topics/advice/" className="text-white hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Advice
              </Link>
              <Link href="/articles/" className="text-white hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Buying Guides
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
