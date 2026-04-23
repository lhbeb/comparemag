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
 * Custom Image component for external and Supabase-hosted images.
 * When the host is allowed by Next's remotePatterns, we let the built-in image
 * optimizer handle responsive sizing and modern formats for us.
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
  const isRemoteUrl = typeof src === "string" && /^https?:\/\//i.test(src)
  const canUseNextImage = (() => {
    if (!isRemoteUrl) return true

    try {
      const hostname = new URL(src).hostname.toLowerCase()
      return (
        hostname === "images.unsplash.com" ||
        hostname.endsWith(".supabase.co") ||
        hostname.endsWith(".amazonaws.com") ||
        hostname.endsWith(".cloudinary.com") ||
        hostname.endsWith(".imgix.net")
      )
    } catch {
      return false
    }
  })()

  if (!canUseNextImage) {
    return fill ? (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        onLoad={onLoad}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    ) : (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        onLoad={onLoad}
      />
    )
  }

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
