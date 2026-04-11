import Head from 'next/head'

interface ArticleHeadProps {
  article: {
    title: string
    meta_description?: string | null
    meta_keywords?: string | null
    image_url?: string | null
    slug: string
    author: string
    category: string
    published_at?: string | null
    created_at: string
    updated_at: string
  }
  siteUrl?: string
}

export function ArticleHead({ article, siteUrl = 'https://comparemag.blog' }: ArticleHeadProps) {
  const url = `${siteUrl}/blog/${article.slug}`
  const imageUrl = article.image_url || `${siteUrl}/placeholder.svg`
  const metaDescription = article.meta_description || article.title

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{article.title} | CompareMag</title>
      <meta name="title" content={article.title} />
      <meta name="description" content={metaDescription} />
      {article.meta_keywords && <meta name="keywords" content={article.meta_keywords} />}
      <meta name="author" content={article.author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={article.title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="CompareMag" />
      <meta property="article:published_time" content={article.published_at || article.created_at} />
      <meta property="article:modified_time" content={article.updated_at} />
      <meta property="article:author" content={article.author} />
      <meta property="article:section" content={article.category} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={article.title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content="@neuralpulse" />
      <meta name="twitter:site" content="@neuralpulse" />
    </Head>
  )
}

