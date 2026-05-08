import { submitIndexNowUrls } from '../lib/indexnow'

async function main() {
  const urls = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))

  if (urls.length === 0) {
    throw new Error('Usage: npm run indexnow:submit -- https://www.comparemag.com/blog/example-slug')
  }

  const result = await submitIndexNowUrls(urls)

  if (!result) {
    console.log('No URLs submitted.')
    return
  }

  console.log(`IndexNow status: ${result.status} ${result.statusText}`)
  console.log(`Submitted URLs: ${result.submittedUrls.length}`)

  for (const url of result.submittedUrls) {
    console.log(`- ${url}`)
  }

  if (!result.ok) {
    if (result.responseText) {
      console.log(result.responseText)
    }
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
