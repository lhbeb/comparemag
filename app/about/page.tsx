import Link from "next/link"
import { Logo } from "@/components/logo"
import { Github, Linkedin, Mail, Rss, Twitter } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">


      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900">About CompareMag</h1>

          <div className="prose prose-blue prose-lg max-w-none text-slate-700">
            <p className="lead text-xl text-slate-600 mb-8 border-l-4 border-blue-600 pl-4">
              CompareMag is your trusted source for unbiased, in-depth product reviews, side-by-side price 
              comparisons, and the latest consumer technology news.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Our Mission</h2>
            <p className="mb-6">
              Our mission is to help you buy better. With thousands of products released every year, 
              finding the right device at the right price is harder than ever. Our expert editors test 
              smartphones, laptops, home appliances, and audio gear so you don't have to guess.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">How We Test</h2>
            <p className="mb-6">
              We purchase products at retail and subject them to rigorous, real-world testing. 
              We don't accept paid reviews, and our editorial standards ensure that every recommendation 
              is independent, honest, and truly focused on value for the consumer.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-12 bg-slate-900 text-slate-300">
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
              <h3 className="font-medium mb-4 text-white">Useful Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/articles/" className="hover:text-white transition-colors">All Reviews</Link></li>
                <li><Link href="/about/" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-white">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="break-all">ameyaudeshmukh@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-6 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} CompareMag. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
