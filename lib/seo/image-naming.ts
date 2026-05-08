const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'before',
  'but',
  'by',
  'for',
  'from',
  'have',
  'how',
  'i',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'so',
  'the',
  'this',
  'to',
  'vs',
  'with',
  'you',
  'your',
])

function normalizeAscii(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/&/g, ' and ')
}

export function slugifyImageText(value: string, maxWords = 10) {
  const words = normalizeAscii(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word))

  return words.slice(0, maxWords).join('-') || 'comparemag-image'
}

export function getArticleYear(value?: string | null) {
  if (!value) return new Date().getFullYear()
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) return date.getFullYear()
  const yearMatch = value.match(/\b(20\d{2})\b/)
  return yearMatch ? Number.parseInt(yearMatch[1], 10) : new Date().getFullYear()
}

export function getImageExtension(fileNameOrUrl: string, fallback = 'webp') {
  const cleanPath = fileNameOrUrl.split('?')[0].split('#')[0]
  const match = cleanPath.match(/\.([a-zA-Z0-9]+)$/)
  const extension = (match?.[1] || fallback).toLowerCase()
  return extension === 'jpeg' ? 'jpg' : extension
}

export function buildArticleThumbnailAlt({
  title,
  category,
  year,
}: {
  title: string
  category?: string | null
  year?: number
}) {
  const cleanTitle = normalizeAscii(title).replace(/\s+/g, ' ').trim()
  const suffix = category ? `${category} review` : 'product review'
  if (!cleanTitle) return year ? `CompareMag ${suffix} ${year}` : `CompareMag ${suffix}`
  return year ? `${cleanTitle}, ${suffix} ${year}` : `${cleanTitle}, ${suffix}`
}

export function buildArticleThumbnailFileName({
  title,
  category,
  year,
  extension,
}: {
  title: string
  category?: string | null
  year?: number
  extension: string
}) {
  const titleSlug = slugifyImageText(title, 8)
  const categorySlug = category ? slugifyImageText(category, 3) : 'review'
  const yearPart = year ? String(year) : String(new Date().getFullYear())
  const safeExtension = getImageExtension(`file.${extension}`, 'webp')

  return `${titleSlug}-${categorySlug}-review-${yearPart}.${safeExtension}`
}

export function buildInlineImageFileName({
  articleTitle,
  imageAlt,
  extension,
}: {
  articleTitle: string
  imageAlt?: string | null
  extension: string
}) {
  const articleSlug = slugifyImageText(articleTitle, 5)
  const imageSlug = imageAlt ? slugifyImageText(imageAlt, 6) : 'in-article-photo'
  const safeExtension = getImageExtension(`file.${extension}`, 'webp')

  return `${articleSlug}-${imageSlug}.${safeExtension}`
}

export function addUniqueSuffix(fileName: string) {
  const extension = getImageExtension(fileName, 'webp')
  const baseName = fileName.replace(new RegExp(`\\.${extension}$`, 'i'), '')
  return `${baseName}-${Date.now().toString(36)}.${extension}`
}
