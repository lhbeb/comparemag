import { getProductBySlug } from '@/lib/supabase/products'
import type { ProductCardData } from '@/components/blocks/product-card-embed'

/**
 * Extracts all [product-card:slug] shortcodes from content and fetches their data.
 * Used for SSR SEO optimizations to prevent Client-Side waterfalls.
 */
export async function getPreloadProducts(content: string): Promise<Record<string, ProductCardData>> {
  const shortcodeRegex = /\[product-card:([a-zA-Z0-9-]+)\]/g;
  const matches = [...content.matchAll(shortcodeRegex)];

  if (matches.length === 0) {
    return {};
  }

  const productsDict: Record<string, ProductCardData> = {};

  // Fetch products efficiently
  for (const match of matches) {
    const slug = match[1];
    if (productsDict[slug]) continue; // Already fetching

    try {
      const product = await getProductBySlug(slug);
      if (product && product.published) {
        productsDict[slug] = product;
      }
    } catch (err) {
      console.error(`Failed to load product card for slug ${slug}`, err);
    }
  }

  return productsDict;
}
