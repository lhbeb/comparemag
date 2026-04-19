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
 * Custom Image component for Supabase images
 * Uses Supabase image transformations for better LCP when Next optimization
 * is disabled for storage URLs.
 */

function getTransformedSupabaseImageUrl(src: string, widthHint: number, quality: number) {
  if (
    !/https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//i.test(src)
  ) {
    return src
  }

  try {
    const url = new URL(src)
    url.pathname = url.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    url.searchParams.set('width', String(widthHint))
    url.searchParams.set('quality', String(quality))
    url.searchParams.set('format', 'webp')
    return url.toString()
  } catch {
    return src
  }
}

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

  const widthHint = width || (fill ? 1600 : 1200)
  const finalSrc =
    typeof src === "string"
      ? getTransformedSupabaseImageUrl(src, widthHint, quality)
      : src

  return (
    <Image
      src={finalSrc}
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
