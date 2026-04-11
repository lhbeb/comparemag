'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ArticlesSubscribeButton() {
  const router = useRouter()

  const handleSubscribeClick = () => {
    router.push('/#newsletter')
  }

  return (
    <Button
      className="bg-accent hover:bg-accent-500 text-white"
      onClick={handleSubscribeClick}
    >
      Subscribe
    </Button>
  )
}
