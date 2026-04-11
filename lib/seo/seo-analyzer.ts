/**
 * SEO Analyzer - Analyzes article content and provides SEO score
 * Helps ensure articles meet Google PageSpeed Insights requirements
 */

import type { Article } from '@/lib/supabase/types'

export interface SEOAnalysis {
  score: number
  issues: string[]
  suggestions: string[]
  checks: {
    title: { passed: boolean; message: string }
    metaDescription: { passed: boolean; message: string }
    headings: { passed: boolean; message: string }
    images: { passed: boolean; message: string }
    contentLength: { passed: boolean; message: string }
    keywords: { passed: boolean; message: string }
    internalLinks: { passed: boolean; message: string }
    readability: { passed: boolean; message: string }
  }
}

export function analyzeArticleSEO(article: Article): SEOAnalysis {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  // Extract text content
  const textContent = article.content.replace(/<[^>]*>/g, '')
  const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length

  // Check title
  const titleLength = article.title.length
  const titleCheck = {
    passed: titleLength >= 30 && titleLength <= 60,
    message: titleLength < 30 
      ? 'Title is too short (aim for 30-60 characters)'
      : titleLength > 60
      ? 'Title is too long (aim for 30-60 characters)'
      : 'Title length is optimal'
  }
  if (!titleCheck.passed) {
    issues.push(titleCheck.message)
    score -= 10
  }

  // Check meta description
  const metaDesc = article.meta_description || textContent.substring(0, 160)
  const metaDescLength = metaDesc.length
  const metaDescCheck = {
    passed: metaDescLength >= 120 && metaDescLength <= 160,
    message: metaDescLength < 120
      ? 'Meta description is too short (aim for 120-160 characters)'
      : metaDescLength > 160
      ? 'Meta description is too long (aim for 120-160 characters)'
      : 'Meta description length is optimal'
  }
  if (!metaDescCheck.passed) {
    issues.push(metaDescCheck.message)
    score -= 10
  }

  // Check headings (H1, H2, H3 structure)
  const h1Count = (article.content.match(/<h1[^>]*>/gi) || []).length
  const h2Count = (article.content.match(/<h2[^>]*>/gi) || []).length
  const headingsCheck = {
    passed: h1Count <= 1 && h2Count >= 2,
    message: h1Count > 1
      ? 'Multiple H1 tags found (should have only one)'
      : h2Count < 2
      ? 'Not enough H2 headings (aim for at least 2)'
      : 'Heading structure is good'
  }
  if (!headingsCheck.passed) {
    issues.push(headingsCheck.message)
    score -= 10
  }

  // Check images
  const imageCount = (article.content.match(/<img[^>]*>/gi) || []).length
  const imagesWithAlt = (article.content.match(/<img[^>]*alt=["'][^"']+["'][^>]*>/gi) || []).length
  const imagesCheck = {
    passed: imageCount === 0 || imagesWithAlt === imageCount,
    message: imageCount === 0
      ? 'No images in content (consider adding relevant images)'
      : imagesWithAlt < imageCount
      ? `${imageCount - imagesWithAlt} image(s) missing alt text`
      : 'All images have alt text'
  }
  if (!imagesCheck.passed) {
    issues.push(imagesCheck.message)
    score -= 15
  }

  // Check content length
  const contentLengthCheck = {
    passed: wordCount >= 300,
    message: wordCount < 300
      ? `Content is too short (${wordCount} words, aim for 300+)`
      : `Content length is good (${wordCount} words)`
  }
  if (!contentLengthCheck.passed) {
    issues.push(contentLengthCheck.message)
    score -= 10
  } else if (wordCount < 1000) {
    suggestions.push('Consider expanding content to 1000+ words for better SEO')
  }

  // Check keywords
  const keywordsCheck = {
    passed: !!article.focus_keyword && article.focus_keyword.length > 0,
    message: article.focus_keyword
      ? 'Focus keyword is set'
      : 'No focus keyword set'
  }
  if (!keywordsCheck.passed) {
    issues.push(keywordsCheck.message)
    score -= 5
  }

  // Check internal links
  const internalLinks = (article.content.match(/href=["']\/[^"']+["']/gi) || []).length
  const internalLinksCheck = {
    passed: internalLinks >= 2,
    message: internalLinks < 2
      ? `Not enough internal links (${internalLinks} found, aim for 2+)`
      : `Good internal linking (${internalLinks} links)`
  }
  if (!internalLinksCheck.passed) {
    suggestions.push(internalLinksCheck.message)
    score -= 5
  }

  // Check readability (simple check - average sentence length)
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentenceLength = sentences.length > 0 
    ? sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length
    : 0
  const readabilityCheck = {
    passed: avgSentenceLength >= 10 && avgSentenceLength <= 20,
    message: avgSentenceLength < 10
      ? 'Sentences are too short (aim for 10-20 words average)'
      : avgSentenceLength > 20
      ? 'Sentences are too long (aim for 10-20 words average)'
      : 'Readability is good'
  }
  if (!readabilityCheck.passed) {
    suggestions.push(readabilityCheck.message)
    score -= 5
  }

  // Additional suggestions
  if (!article.og_image && article.image_url) {
    suggestions.push('Consider setting a custom OG image for better social sharing')
  }

  if (wordCount > 0 && !article.meta_keywords) {
    suggestions.push('Add meta keywords for better discoverability')
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
    checks: {
      title: titleCheck,
      metaDescription: metaDescCheck,
      headings: headingsCheck,
      images: imagesCheck,
      contentLength: contentLengthCheck,
      keywords: keywordsCheck,
      internalLinks: internalLinksCheck,
      readability: readabilityCheck,
    },
  }
}

