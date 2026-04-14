import Link from "next/link"
import { Logo } from "@/components/logo"
import { Github, Linkedin, Mail, Rss, Twitter } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="py-12 bg-slate-900 text-slate-300 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-4">
            <Logo width={140} height={40} />
            <p className="text-slate-400 text-sm">
              Your trusted source for unbiased product reviews, price comparisons, and the latest tech news.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Github className="h-5 w-5" /></Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Rss className="h-5 w-5" /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4 text-white">Categories</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/topics/" className="hover:text-white transition-colors">Smartphones</Link></li>
              <li><Link href="/topics/" className="hover:text-white transition-colors">Laptops & PCs</Link></li>
              <li><Link href="/topics/" className="hover:text-white transition-colors">Audio & Headphones</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about/" className="hover:text-white transition-colors">About CompareMag</Link></li>
              <li><Link href="/advertise/" className="hover:text-white transition-colors">Advertise With Us</Link></li>
              <li><Link href="/privacy/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms/" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4 text-white">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="break-all">contact@compareradar.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-6 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Compareradar.com. All rights reserved.</p>
          <div className="flex gap-4 text-slate-500">
             <Link href="/privacy/" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="/terms/" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
