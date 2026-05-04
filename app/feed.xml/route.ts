import { getAllArticles } from '@/lib/supabase/articles'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

export const revalidate = 3600 // Revalidate the feed every hour

export async function GET() {
  const articles = await getAllArticles(true)

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
      <description>The latest articles and reviews from ${SITE_NAME}</description>
      <language>en</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
      ${articles.map(article => `
        <item>
          <title><![CDATA[${article.title}]]></title>
          <link>${SITE_URL}/blog/${article.slug}</link>
          <guid isPermaLink="true">${SITE_URL}/blog/${article.slug}</guid>
          <pubDate>${new Date(article.published_at || article.created_at).toUTCString()}</pubDate>
          <description><![CDATA[${article.meta_description || article.og_description || article.content?.slice(0, 200)}]]></description>
          ${article.author ? `<dc:creator><![CDATA[${article.author}]]></dc:creator>` : ''}
          ${article.category ? `<category><![CDATA[${article.category}]]></category>` : ''}
        </item>
      `).join('')}
    </channel>
  </rss>`

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
