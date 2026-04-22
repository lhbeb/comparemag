export const SITE_NAME = 'CompareMag'
export const SITE_DOMAIN = 'comparemag.com'
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `https://${SITE_DOMAIN}`).replace(/\/+$/, '')
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || `contact@${SITE_DOMAIN}`
export const TWITTER_HANDLE = '@comparemag'

export function absoluteUrl(path = '') {
  if (!path) return SITE_URL
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
