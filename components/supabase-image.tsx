"use client"

import Image from "next/image"
import { useState } from "react"

interface SupabaseImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  onLoad?: () => void
}

/**
 * Custom Image component for Supabase images
 * Uses unoptimized mode to avoid private IP resolution issues
 */
export function SupabaseImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority = false,
  quality = 85,
  onLoad,
}: SupabaseImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const isSupabaseImage = src?.includes('supabase.co')

  const handleLoad = () => {
    setImageLoaded(true)
    onLoad?.()
  }

  // Use unoptimized for Supabase images to avoid private IP resolution issues
  if (isSupabaseImage) {
    return (
      <>
        {!imageLoaded && (
          <div className={`absolute inset-0 bg-gray-200 animate-pulse ${fill ? '' : 'w-full h-full'}`} />
        )}
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={width}
          height={height}
          className={`${className || ''} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          sizes={sizes}
          priority={priority}
          quality={quality}
          unoptimized={true} // Disable optimization for Supabase images
          onLoad={handleLoad}
        />
      </>
    )
  }

  // Regular optimized images for other sources
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      onLoad={onLoad}
    />
  )
}
