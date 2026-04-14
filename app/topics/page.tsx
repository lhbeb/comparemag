"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Laptop, Speaker, Home, Gamepad2, Camera, Mail, Twitter, Github, Linkedin, Rss } from "lucide-react"
import { useRouter } from "next/navigation"

const topics = [
  {
    title: "Smartphones",
    description: "In-depth reviews, comparisons, and news on the latest iOS and Android smartphones.",
    icon: <Phone className="h-6 w-6" />,
    count: 24,
    slug: "smartphones",
  },
  {
    title: "Laptops & PCs",
    description: "Find the best laptops for work, gaming, and everyday use with our bench-tested reviews.",
    icon: <Laptop className="h-6 w-6" />,
    count: 18,
    slug: "laptops",
  },
  {
    title: "Audio & Headphones",
    description: "Clear sound matters. We test the latest wireless earbuds, headsets, and speakers.",
    icon: <Speaker className="h-6 w-6" />,
    count: 15,
    slug: "audio",
  },
  {
    title: "Home Appliances",
    description: "Smart home devices, vacuums, and kitchen tech compared and reviewed.",
    icon: <Home className="h-6 w-6" />,
    count: 12,
    slug: "home-appliances",
  },
  {
    title: "Gaming",
    description: "Consoles, accessories, and gaming monitors put to the test.",
    icon: <Gamepad2 className="h-6 w-6" />,
    count: 20,
    slug: "gaming",
  },
  {
    title: "Cameras",
    description: "From beginner mirrorless to professional gear, we review the top photography tech.",
    icon: <Camera className="h-6 w-6" />,
    count: 8,
    slug: "cameras",
  },
]

export default function TopicsPage() {
  const router = useRouter()

  const handleSubscribeClick = () => {
    router.push("/#newsletter")
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">


      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 text-slate-900">Categories</h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <TopicCard
                key={index}
                title={topic.title}
                description={topic.description}
                icon={topic.icon}
                count={topic.count}
                slug={topic.slug}
              />
            ))}
          </div>
        </section>
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

function TopicCard({ title, description, icon, count, slug = "" }: any) {
  return (
    <Link href={`/topics/${slug}`} className="group">
      <Card className="bg-white border-gray-200 hover:border-blue-300 transition-colors h-full shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">{icon}</div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-slate-600 font-medium">{count} items</div>
          </div>
          <CardTitle className="text-xl mt-4 text-slate-900 group-hover:text-blue-600 transition-colors">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-slate-600">{description}</CardDescription>
        </CardContent>
        <CardFooter>
          <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">View articles →</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
