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

function formatDisplayPrice(priceText?: string | null) {
  const trimmed = (priceText || '').trim()
  if (!trimmed) return null

  if (/[$€£¥]|usd|eur|gbp|cad|aud|aed|mad|dhs|dh/i.test(trimmed) || /[a-z]/i.test(trimmed.replace(/[0-9.,\s-]/g, ''))) {
    return trimmed
  }

  if (/^-?\d[\d,\s.]*$/.test(trimmed)) {
    return `$${trimmed.replace(/\s+/g, '')}`
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
  const safeTitle = title?.trim() || 'Amazon Product'
  const safeDescription = description?.trim() || 'Direct Amazon product recommendation saved inside this article.'
  const displayPrice = formatDisplayPrice(priceText)
  const safeCtaLabel = ctaLabel?.trim() || 'View on Amazon'
  const domain = extractDisplayDomain(safeUrl)

  return (
    <div className="amazon-product-card-embed not-prose my-10 mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-[#131921] via-[#1f2937] to-[#111827] px-6 py-4 text-white">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-amber-300">
              Amazon Product Card
            </div>
            <h3 className="text-lg font-bold leading-snug text-white md:text-xl">{safeTitle}</h3>
          </div>
          <div className="hidden rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200 sm:block">
            {domain}
          </div>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[minmax(0,240px)_1fr]">
        <div className="relative min-h-[220px] bg-slate-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={safeTitle}
              className="absolute inset-0 h-full w-full object-contain bg-white p-5"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-center">
              <ShoppingCart className="mb-3 h-12 w-12 text-slate-300" />
              <span className="px-6 text-sm font-medium text-slate-500">
                Amazon product card without a custom image
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">{safeDescription}</p>
            <div className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
              Separate Amazon Embed
            </div>
          </div>

          <div className="mt-auto flex flex-col items-start gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            {displayPrice ? (
              <div className="text-left">
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Current Price
                </p>
                <div className="text-3xl font-black tracking-tight text-slate-900">{displayPrice}</div>
              </div>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Opens on Amazon
              </span>
            )}
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff9900] px-5 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-[#f59e0b]"
            >
              <span>{safeCtaLabel}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
