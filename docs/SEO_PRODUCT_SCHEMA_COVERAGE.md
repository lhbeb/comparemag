# SEO Product Schema Coverage

Product/Review JSON-LD for blog articles is generated in `lib/seo/article-seo.tsx`.

It currently covers only these product card formats:

1. Database-backed product cards saved in article content as:
   ```text
   [product-card:product-slug]
   ```

2. Inline Amazon cards saved in article content as:
   ```html
   <amazon-product-card data-url="..." data-title="..."></amazon-product-card>
   ```

If a new product card type is added in the future, it is not automatically included in Google product/review schema. Update `getEmbeddedProductReferences()` in `lib/seo/article-seo.tsx` and this document so the rendered product card and the JSON-LD stay in sync.
