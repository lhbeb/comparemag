import Image from "next/image"

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
 * Custom Image component for Supabase images.
 * We keep storage URLs direct here because Next optimization is disabled for
 * Supabase storage hosts in this app, and not every Supabase project enables
 * the render/image endpoint consistently.
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
  const isSupabaseStorageImage =
    typeof src === "string" &&
    /https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//i.test(src)

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
      unoptimized={isSupabaseStorageImage}
      onLoad={onLoad}
    />
  )
}
