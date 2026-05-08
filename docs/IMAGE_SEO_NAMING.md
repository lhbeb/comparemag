# Image SEO Naming

CompareMag uses separate signals for image SEO:

- `image_alt`: natural alt text for accessibility and Google Images.
- `image_title`: readable title/filename label.
- storage filename: URL-safe, lowercase, hyphen-separated filename.

## Article Thumbnail Images

Use article metadata:

```text
{product/article topic}-review-{year}-{intent phrase}.webp
```

Examples:

```text
nintendo-switch-v2-review-2026-worth-buying.webp
sony-playstation-5-review-2026-which-model-to-buy.webp
flipper-zero-review-2026-hacking-tool-breakdown.webp
```

Alt text should be natural, not the filename:

```text
Nintendo Switch V2 review 2026, is it worth buying
```

## In-Article Images

Use the article title plus the image role/context:

```text
{article-topic}-{image-role-or-context}.webp
```

Examples:

```text
nintendo-switch-v2-oled-handheld-mode.webp
switch-v2-vs-steam-deck-size-comparison.webp
switch-v2-nintendo-eshop-home-screen.webp
switch-v2-price-drop-amazon-may-2026.webp
```

## Rules

- Use lowercase filenames.
- Use hyphens, not spaces or underscores.
- Include brand and model when they are relevant.
- Do not use the filename as alt text.
- Do not start alt text with filler like "image of" or "photo showing".
- Decorative images must use `alt=""` explicitly.
- Never keyword-stuff alt text.

## Article Thumbnail Delivery

Article thumbnails stored in Supabase under `article_images/articles/` are delivered through the CompareMag domain by default:

```text
https://comparemag.com/media/articles/{seo-file-name}
```

The proxy route is intentionally limited to those article thumbnail files. Product card images and other buckets still use their source URL.

To switch article thumbnails back to direct Supabase URLs, set:

```text
NEXT_PUBLIC_ARTICLE_IMAGE_DELIVERY=supabase
```

Leaving the variable unset uses the CompareMag proxy route.
