import Link from "next/link"
import { Logo } from "@/components/logo"
import { Github, Linkedin, Mail, Twitter, MapPin } from "lucide-react"
import { CONTACT_EMAIL, SITE_DOMAIN, TWITTER_HANDLE } from "@/lib/site-config"

const footerSocialLinks = [
  {
    href: `https://twitter.com/${TWITTER_HANDLE.replace('@', '')}`,
    label: 'CompareMag on X',
    icon: Twitter,
  },
  {
    href: 'https://github.com/comparemag',
    label: 'CompareMag on GitHub',
    icon: Github,
  },
  {
    href: 'https://linkedin.com/company/comparemag',
    label: 'CompareMag on LinkedIn',
    icon: Linkedin,
  },
]

export function SiteFooter() {
  return (
    <footer className="py-12 bg-slate-950 text-slate-200 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-4">
            <Logo width={140} height={40} />
            <p className="text-slate-200 text-sm">
              Your trusted source for unbiased product reviews, price comparisons, and the latest tech news.
            </p>
            <div className="flex space-x-4">
              {footerSocialLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-slate-200 hover:text-white transition-colors"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4 text-white">Categories</h3>
            <ul className="space-y-2 text-sm text-slate-200">
              <li><Link href="/topics/" className="hover:text-white transition-colors">Smartphones</Link></li>
              <li><Link href="/topics/" className="hover:text-white transition-colors">Laptops & PCs</Link></li>
              <li><Link href="/topics/" className="hover:text-white transition-colors">Audio & Headphones</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-sm text-slate-200">
              <li><Link href="/about/" className="hover:text-white transition-colors">About CompareMag</Link></li>
              <li><Link href="/advertise/" className="hover:text-white transition-colors">Advertise With Us</Link></li>
              <li><Link href="/privacy/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms/" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4 text-white">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-200">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{CONTACT_EMAIL}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>123 Tech Avenue<br />Suite 400<br />San Francisco, CA 94105</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-6 text-sm text-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {SITE_DOMAIN}. All rights reserved.</p>
          <div className="flex gap-4 text-slate-200">
             <Link href="/privacy/" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="/terms/" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
