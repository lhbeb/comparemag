# How to Add Articles to NeuralPulse Blog

## Overview

This blog is **static** - all articles are stored in a centralized data file. This makes it easy to add new articles without modifying multiple files.

## Current Structure

All blog articles are stored in: **`lib/data/blogPosts.ts`**

## How to Add a New Article

### Step 1: Open the Data File

Open `lib/data/blogPosts.ts` in your editor.

### Step 2: Add Your Article

Add a new entry to the `blogPosts` object. Each article needs:

- **slug**: A URL-friendly identifier (e.g., `"my-new-article"`)
- **title**: The article title
- **date**: Publication date (e.g., `"December 9, 2024"`)
- **author**: Author name
- **category**: Article category (e.g., `"GenAI"`, `"AI Research"`, `"Computer Vision"`, etc.)
- **readTime**: Estimated reading time (e.g., `"5 min read"`)
- **image**: URL to the article's hero image
- **content**: HTML content of the article (can include `<p>`, `<h2>`, `<ul>`, etc.)
- **relatedPosts**: Array of related articles (with `title`, `category`, `image`, and `slug`)

### Example Article Entry

```typescript
"my-new-article-slug": {
  title: "My New Article Title",
  date: "December 9, 2024",
  author: "Your Name",
  category: "GenAI",
  readTime: "5 min read",
  image: "https://images.unsplash.com/photo-...",
  content: `
    <p>Your article content goes here. You can use HTML tags.</p>
    
    <h2>Section Title</h2>
    <p>More content...</p>
    
    <ul>
      <li>List item 1</li>
      <li>List item 2</li>
    </ul>
  `,
  relatedPosts: [
    {
      title: "Related Article Title",
      category: "AI Research",
      image: "https://images.unsplash.com/photo-...",
      slug: "related-article-slug",
    },
  ],
},
```

### Step 3: Update Article Lists (Optional)

If you want your article to appear on the homepage:

1. **Featured Articles**: Edit `app/page.tsx` and add your article to the featured section
2. **Recent Articles**: Edit `app/page.tsx` and add your article to the recent articles section
3. **All Articles**: The articles page (`app/articles/page.tsx`) automatically shows all articles from the data file

### Step 4: Test Your Article

1. Run `npm run dev` to start the development server
2. Navigate to `http://localhost:3000/blog/your-article-slug/`
3. Verify everything looks correct

## Important Notes

- **Slug Format**: Use lowercase, hyphens instead of spaces (e.g., `"my-article-title"`)
- **Content Format**: Use HTML tags for formatting. The content is rendered as HTML.
- **Images**: You can use Unsplash URLs or host your own images
- **Related Posts**: Make sure the slugs in `relatedPosts` match actual article slugs

## File Locations

- **Article Data**: `lib/data/blogPosts.ts`
- **Blog Post Page**: `app/blog/[slug]/page.tsx`
- **Articles Listing**: `app/articles/page.tsx`
- **Homepage**: `app/page.tsx`

## Static Site Generation

This blog is designed for static site generation (GitHub Pages). When you build the site (`npm run build`), all articles are included in the static output.




