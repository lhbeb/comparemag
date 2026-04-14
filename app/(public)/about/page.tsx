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

      
    </div>
  )
}
