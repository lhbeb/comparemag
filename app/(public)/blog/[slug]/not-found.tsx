import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">404 - Post Not Found</h1>
        <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/articles/">View All Articles</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}




