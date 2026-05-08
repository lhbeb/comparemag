import { absoluteUrl } from './site-config'

const ARTICLE_IMAGES_MARKER = '/storage/v1/object/public/article_images/articles/'
const PROXY_PREFIX = '/media/articles/'

export function getArticleImageFileName(src: string | null | undefined) {
  if (!src) return null

  try {
    const parsed = new URL(src)
    const markerIndex = parsed.pathname.indexOf(ARTICLE_IMAGES_MARKER)

    if (markerIndex === -1) return null

    return decodeURIComponent(parsed.pathname.slice(markerIndex + ARTICLE_IMAGES_MARKER.length))
  } catch {
    if (!src.startsWith(PROXY_PREFIX)) return null
    return decodeURIComponent(src.slice(PROXY_PREFIX.length))
  }
}

export function getArticleImageDeliveryUrl(
  src: string | null | undefined,
  options: { absolute?: boolean } = {},
) {
  if (!src) return src || ''

  const useSupabaseDirect = process.env.NEXT_PUBLIC_ARTICLE_IMAGE_DELIVERY === 'supabase'
  const fileName = getArticleImageFileName(src)

  if (!fileName || useSupabaseDirect) {
    return options.absolute ? absoluteUrl(src) : src
  }

  const path = `${PROXY_PREFIX}${encodeURIComponent(fileName)}`
  return options.absolute ? absoluteUrl(path) : path
}

export function isArticleImageProxyUrl(src: string | null | undefined) {
  return Boolean(src?.startsWith(PROXY_PREFIX))
}
