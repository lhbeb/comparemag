import Link from "next/link"
import { Mail } from "lucide-react"

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900">Advertise With Us</h1>
          <div className="prose prose-blue prose-lg max-w-none text-slate-700">
            <p className="lead text-xl text-slate-600 mb-8 border-l-4 border-blue-600 pl-4">
              Reach a highly engaged audience of tech enthusiasts, early adopters, and serious buyers at Compareradar.com.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Our Audience</h2>
            <p className="mb-6">
              Our readers depend on our deep-dive reviews and straightforward comparisons to make purchasing decisions. Whether you are launching a new consumer service, software platform, or hardware product, we provide unparalleled visibility to high-intent shoppers.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Partnership Opportunities</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Custom display banners across category pages</li>
              <li>Dedicated email newsletter sponsorships</li>
              <li>Sponsored deep-dive articles (clearly marked as sponsored)</li>
            </ul>
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Get in Touch</h2>
            <p className="mb-6">
              To request our media kit and discuss custom campaign integrations, please reach out to our partnerships team directly.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 mt-8">
               <Mail className="h-8 w-8 text-blue-600 mb-2" />
               <a href="mailto:contact@compareradar.com" className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
                 contact@compareradar.com
               </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
