import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function Logo({ className = "", width = 218, height = 62, priority = false }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="CompareMag"
        width={width}
        height={height}
        priority={priority}
        className="h-auto max-w-full object-contain"
        style={{
          maxHeight: `${height}px`,
          maxWidth: `min(100%, ${width}px)`,
          height: "auto",
          width: "auto",
        }}
      />
    </Link>
  )
}

