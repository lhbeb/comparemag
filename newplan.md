Here’s the next plan, ordered by impact.

Immediate Wins

Add crawl infrastructure.
Create app/robots.ts
Create app/sitemap.ts
Include articles, writers, topics, product pages later
Set proper canonical host once, everywhere
Precise fix:

Standardize on one domain in lib/seo/article-seo.tsx
Remove the neuralpulse.blog fallback and use only comparemag.blog
Make homepage content crawlable on first render.
app/page.tsx is client-only and fetches articles after mount
That should become server-rendered for article listings and expert listings
Precise fix:

Move homepage article and writer fetching to the server page
Keep only search/menu/newsletter interactions client-side
Make article pages mostly server components.
components/blog-post-content.tsx (line 1) is client-side
That is too expensive for a content page
Precise fix:

Split the page into:
server-rendered article layout/content
tiny client share-actions component only
Fix image performance on article pages.
components/supabase-image.tsx disables optimization for Supabase images
That likely hurts LCP
Precise fix:

Configure Next image remote patterns properly
Stop forcing unoptimized for article hero images if possible
Ensure article hero image has explicit width/height behavior and optimized delivery
High-Impact Structural Fixes
5. Turn topics into real SEO hubs.

app/topics/page.tsx is currently weak SEO-wise
Topic cards link to /articles/ instead of dedicated topic pages
Precise fix:

Add routes like /topics/[slug]
Each topic page should include:
unique intro copy
featured articles in that topic
latest articles
related subtopics/products later
Link articles back to topic hubs and vice versa
Strengthen writers as authority entities.
Writer pages exist, which is good
They need to become stronger trust pages
Precise fix:

Expand writer pages with:
expertise
editorial methodology
recent articles
social/profile URLs
Add author links from article headers
Add Person schema tied to article schema
Improve internal linking system.
Right now the content graph is still thin
Precise fix:

Every article should link to:
its topic hub
author page
3-6 related articles
product/comparison pages when relevant
Homepage and articles index should reinforce topic clusters, not just list recent posts
Advanced Entity / Schema Strategy
8. Upgrade article schema from “basic” to “entity graph.”
Current:

Article
BreadcrumbList
Organization
Needed:

graph with stable @ids for:
WebPage
BlogPosting or Review when applicable
Person
Organization
ImageObject
BreadcrumbList
Precise fix:

Prefer BlogPosting for standard editorial articles
Use Review when the article is a product review
Later use Product + Review together for review pages
Later use ItemList / comparison-oriented schema for comparison pages
Make article types map to schema types.
Your content model is already moving there.
Precise fix:

Manual article, news article, review article, comparison article, programmatic article should not all emit identical schema
Schema should reflect page intent
Example target:

News-style piece → NewsArticle or BlogPosting
Product review → Review + Product
Comparison page → ItemList + multiple Product entities
Evergreen guide → BlogPosting
Add top-of-article extraction helpers.
AI search systems prefer pages that are easy to summarize.
Precise fix:

Add near the top:
short summary/dek
key takeaways
tested verdict / recommendation
pros/cons for review pages
specs/summary box where relevant
That improves:

scanability
snippet quality
AI extraction quality
user trust
Performance / Core Web Vitals
11. Reduce JS on content pages.
Precise fix:

Remove client wrappers unless needed
Avoid shipping share logic with article body
Keep article content static server HTML
Improve layout stability and LCP.
Precise fix:
Hero image optimization
stable dimensions for media/cards
reduce unnecessary client fetches on primary pages
preload only what matters
Metadata Fixes
13. Tighten canonical and metadata consistency.
Precise fix:

Use the same canonical URL in:
alternates.canonical
Open Graph URL
JSON-LD mainEntityOfPage
Ensure one source of truth
Strengthen metadata quality rules.
Precise fix:
Title templates per content type
meta descriptions based on real summaries, not raw truncation
better keyword strategy through content structure, not meta keywords alone
preserve published and modified dates consistently
Priority Order

Fix domain/canonical/schema consistency
Add robots.ts and sitemap.ts
Server-render homepage content
Make article pages mostly server-rendered
Fix image optimization/LCP
Build /topics/[slug] hubs
Strengthen writer authority pages
Improve related/internal linking
Upgrade schema by article type
Add structured summary blocks to articles
What Will Move the Needle Most
If you only do 5 things first:

Server-render homepage and article pages more aggressively
Add sitemap and robots
Build real topic pages
Fix image optimization
Upgrade schema to content-type-aware graph schema
If you want, I can turn this into a repo-specific implementation checklist with exact file targets and what to change in each one.