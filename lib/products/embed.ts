import { getProductBySlug } from '@/lib/supabase/products'

/**
 * Replaces `[product-card:slug]` shortcodes in content with rendered HTML.
 */
export async function parseProductShortcodes(content: string): Promise<string> {
  const shortcodeRegex = /\[product-card:([a-zA-Z0-9-]+)\]/g;
  const matches = [...content.matchAll(shortcodeRegex)];

  if (matches.length === 0) {
    return content;
  }

  let parsedContent = content;

  // We fetch products and replace them one by one
  for (const match of matches) {
    const originalShortcode = match[0];
    const slug = match[1];

    try {
      const product = await getProductBySlug(slug);

      if (!product || !product.published) {
        // Leave shortcode or remove it if product not found/published. 
        // We'll replace with an empty string or a small notice.
        parsedContent = parsedContent.replace(originalShortcode, '');
        continue;
      }

      // Generate HTML string for the product card
      const ctaHref = product.external_url || '#';
      const ctaLabel = product.cta_label || 'Check Price';
      
      const featuresHTML = product.specs ? Object.entries(product.specs).map(([k, v]) => `
        <li style="display: flex; justify-content: space-between; font-size: 0.875rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.25rem;">
          <span style="color: #64748b; font-weight: 500;">${k}</span>
          <span style="color: #0f172a;">${v}</span>
        </li>
      `).join('') : '';

      const badgeHtml = product.badge_text ? `
        <div style="position: absolute; top: -10px; left: 16px; background-color: #ea580c; color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          ${product.badge_text}
        </div>
      ` : '';

      const ratingHtml = product.rating_text ? `
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b; fill: #f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span style="font-size: 0.875rem; font-weight: 600; color: #334155;">${product.rating_text}</span>
        </div>
      ` : '';

      const cardHtml = `
      <div style="position: relative; margin: 32px 0; border-radius: 16px; border: 1px solid #e2e8f0; background: white; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); display: flex; flex-direction: column; gap: 20px;" class="product-card-embed">
        ${badgeHtml}
        
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            ${product.image_url ? `
              <img src="${product.image_url}" alt="${product.title}" style="max-height: 200px; width: auto; object-fit: contain; border-radius: 8px; margin: 0;" />
            ` : `
              <div style="height: 150px; width: 100%; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">No image</div>
            `}
          </div>
          
          <div style="flex: 1;">
            ${product.brand ? `<p style="text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-size: 0.75rem; font-weight: 700; margin: 0 0 4px 0;">${product.brand}</p>` : ''}
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; line-height: 1.3;">${product.title}</h3>
            ${ratingHtml}
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin: 0 0 16px 0;">${product.short_description}</p>
            
            ${product.specs && Object.keys(product.specs).length > 0 ? `
              <div style="margin-bottom: 20px;">
                <h4 style="font-size: 0.875rem; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; text-transform: uppercase;">Key Specs</h4>
                <ul style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; list-style: none;">
                  ${featuresHTML}
                </ul>
              </div>
            ` : ''}

            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: auto;">
              ${product.price_text ? `
                <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a;">${product.price_text}</div>
              ` : ''}
              <a href="${ctaHref}" target="_blank" rel="noopener noreferrer nofollow" style="display: block; width: 100%; text-align: center; background-color: #ea580c; color: white; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; transition: background-color 0.2s;">
                ${ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
      `;

      parsedContent = parsedContent.replace(originalShortcode, cardHtml);
    } catch (err) {
      console.error(`Failed to load product card for slug ${slug}`, err);
      parsedContent = parsedContent.replace(originalShortcode, '');
    }
  }

  return parsedContent;
}
