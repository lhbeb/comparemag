import { ExternalLink, ShoppingCart } from 'lucide-react'

export interface AmazonProductCardData {
  url: string
  title: string
  description?: string | null
  imageUrl?: string | null
  priceText?: string | null
  ctaLabel?: string | null
}

function normalizeUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return '#'
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function extractDisplayDomain(url: string) {
  if (!url || url === '#') return 'Amazon'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'Amazon'
  }
}

function getSourceLabel(url: string) {
  const domain = extractDisplayDomain(url)
  if (/amazon\./i.test(domain)) return 'Available on Amazon'
  return `Available on ${domain}`
}

function formatDisplayPrice(priceText?: string | null) {
  const trimmed = (priceText || '').trim()
  if (!trimmed) return null

  // If it already has an explicit currency symbol or code, return it as-is
  if (/[$€£¥]|usd|eur|gbp|cad|aud|aed|mad|dhs|dh/i.test(trimmed)) {
    return trimmed
  }

  // If there are digits but no currency symbol, default to USD ($)
  if (/\d/.test(trimmed)) {
    // If it's pure numbers/punctuation, cleanly format it
    if (/^[-\d,\s.]+$/.test(trimmed)) {
      return `$${trimmed.replace(/\s+/g, '')}`
    }
    // Otherwise, prepend $ to the first number it finds
    return trimmed.replace(/(\d+[\d,.]*)/, '$$$1')
  }

  return trimmed
}

export function AmazonProductCardEmbed({
  url,
  title,
  description,
  imageUrl,
  priceText,
  ctaLabel,
}: AmazonProductCardData) {
  const safeUrl = normalizeUrl(url)
  const safeTitle = title?.trim() || 'Product Recommendation'
  const safeDescription = description?.trim() || 'A product mention saved directly inside this article.'
  const displayPrice = formatDisplayPrice(priceText)
  const safeCtaLabel = ctaLabel?.trim() || 'View details'
  const sourceLabel = getSourceLabel(safeUrl)

  return (
    <div className="amazon-product-card-embed not-prose my-10 mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group">
      <div className="grid gap-0 md:grid-cols-[minmax(0,240px)_1fr]">
        <div className="relative min-h-[220px] border-b border-slate-100 bg-slate-100 md:border-b-0 md:border-r">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={safeTitle}
              className="absolute inset-0 h-full w-full bg-white p-5 object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-center">
              <ShoppingCart className="mb-3 h-12 w-12 text-slate-300" />
              <span className="px-6 text-sm font-medium text-slate-500">
                No image available
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-6 md:p-7">
          <div>
            <div className="mb-3 inline-flex items-center justify-center rounded-md bg-white p-1.5 shadow-sm border border-slate-100">
              <img src="/amazon-logo.svg" alt="Amazon" className="h-4 w-auto" />
            </div>
            <h3 className="text-xl font-bold leading-snug text-slate-900 md:text-2xl">{safeTitle}</h3>
          </div>

          <div className="my-1 border-l-2 border-slate-200 pl-3">
            <p className="text-sm italic leading-relaxed text-slate-500">{safeDescription}</p>
          </div>

          <div className="mt-auto flex flex-col items-start gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            {displayPrice ? (
              <div className="w-full text-left sm:w-auto">
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  From
                </p>
                <div className="text-3xl font-black tracking-tight text-slate-900">{displayPrice}</div>
              </div>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Product page
              </span>
            )}
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold !text-white no-underline transition-all visited:!text-white hover:!text-white hover:bg-slate-800 focus:!text-white active:!text-white sm:w-auto sm:min-w-[190px]"
              style={{ color: '#ffffff', textDecoration: 'none' }}
            >
              <span className="!text-white">{safeCtaLabel}</span>
              <ExternalLink className="h-4 w-4 !text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
