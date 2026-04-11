# SEO Checklist for Articles

Use this checklist to ensure your articles meet 99% of Google PageSpeed Insights requirements.

## ✅ Pre-Publication Checklist

### Content Quality
- [ ] Article is at least 300 words (1000+ recommended)
- [ ] Content is original and valuable
- [ ] Proper grammar and spelling
- [ ] Clear, readable sentences (10-20 words average)
- [ ] Well-structured with headings (H1, H2, H3)

### Title & Meta
- [ ] Title is 30-60 characters
- [ ] Title includes focus keyword
- [ ] Meta description is 120-160 characters
- [ ] Meta description includes focus keyword
- [ ] Meta description is compelling and click-worthy

### Keywords
- [ ] Focus keyword is set
- [ ] Focus keyword appears in:
  - [ ] Title (preferably at the beginning)
  - [ ] First paragraph
  - [ ] At least 2-3 H2 headings
  - [ ] Meta description
- [ ] Meta keywords are set (5-10 keywords)
- [ ] LSI keywords naturally included in content

### Images
- [ ] Hero image is set and optimized
- [ ] All images have descriptive alt text
- [ ] Images are properly sized (< 200KB recommended)
- [ ] Images use proper formats (WebP, optimized JPEG/PNG)
- [ ] OG image is set (1200x630px recommended)

### Structure
- [ ] One H1 tag (the article title)
- [ ] At least 2-3 H2 headings for main sections
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Content is broken into readable paragraphs
- [ ] Lists are used where appropriate

### Links
- [ ] At least 2-3 internal links to related articles
- [ ] External links (if any) are to authoritative sources
- [ ] Links use descriptive anchor text
- [ ] No broken links

### Technical SEO
- [ ] Slug is URL-friendly and includes focus keyword
- [ ] Canonical URL is set (if needed)
- [ ] Article is marked as published
- [ ] Published date is set
- [ ] Author information is complete

### Social Sharing
- [ ] OG title is set (or defaults to article title)
- [ ] OG description is set (or defaults to meta description)
- [ ] OG image is set (or defaults to featured image)
- [ ] Twitter card type is set

## 📊 SEO Score Target

Aim for **90+ SEO score** using the SEO analyzer:
- 90-100: Excellent ✅
- 80-89: Good ⚠️ (minor improvements needed)
- 70-79: Fair ⚠️ (needs work)
- Below 70: Poor ❌ (significant improvements needed)

## 🔍 How to Check SEO Score

1. **Via API**:
   ```bash
   curl "http://localhost:3000/api/articles/seo?slug=your-article-slug"
   ```

2. **In Admin Dashboard** (coming soon):
   - View SEO score when editing articles
   - See real-time suggestions

## 🚀 Quick Wins

1. **Add focus keyword** to title and first paragraph
2. **Write compelling meta description** (120-160 chars)
3. **Add alt text** to all images
4. **Include 2-3 internal links** to related articles
5. **Set OG image** for better social sharing

## 📝 Notes

- SEO fields are optional but highly recommended
- If not set, the system will auto-generate from content
- Always review auto-generated content and customize when possible
- Regular SEO audits help maintain high rankings

