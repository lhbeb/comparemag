import { absoluteUrl, SITE_URL } from './site-config'

export const INDEXNOW_KEY = 'c35fd300ae7045898b8a6654db596b47'
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
export const INDEXNOW_KEY_LOCATION = absoluteUrl(`/${INDEXNOW_KEY}.txt`)

type IndexNowResult = {
  ok: boolean
  status: number
  statusText: string
  submittedUrls: string[]
  responseText?: string
}

function normalizeSubmittedUrl(url: string) {
  return new URL(absoluteUrl(url)).toString()
}

function getIndexNowHost() {
  return new URL(SITE_URL).host
}

function assertCompareMagUrls(urls: string[]) {
  const host = getIndexNowHost()
  const invalidUrl = urls.find((url) => new URL(url).host !== host)

  if (invalidUrl) {
    throw new Error(`IndexNow only accepts ${host} URLs. Invalid URL: ${invalidUrl}`)
  }
}

export async function submitIndexNowUrls(urls: string[]): Promise<IndexNowResult | null> {
  const submittedUrls = [...new Set(urls.map(normalizeSubmittedUrl))].filter(Boolean)

  if (submittedUrls.length === 0) {
    return null
  }

  assertCompareMagUrls(submittedUrls)

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      host: getIndexNowHost(),
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: submittedUrls,
    }),
  })

  const responseText = await response.text().catch(() => undefined)

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    submittedUrls,
    responseText,
  }
}

export async function safeSubmitIndexNowUrls(urls: string[]) {
  try {
    const result = await submitIndexNowUrls(urls)

    if (result && !result.ok) {
      console.warn('IndexNow submission was not accepted:', result)
    }

    return result
  } catch (error) {
    console.warn('IndexNow submission failed:', error)
    return null
  }
}
