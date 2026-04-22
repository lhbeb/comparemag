import { NextResponse } from 'next/server'
import { createProduct, getAllProducts, getAllProductsOverview } from '@/lib/supabase/products'
import type { ProductCardInsert } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const publishedOnly = searchParams.get('published') === 'true'
    const includeFull = searchParams.get('full') === 'true'
    
    const products = includeFull
      ? await getAllProducts(publishedOnly)
      : await getAllProductsOverview(publishedOnly)

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const product: ProductCardInsert = {
      slug: data.slug,
      title: data.title,
      brand: data.brand || null,
      image_url: data.image_url || null,
      short_description: data.short_description,
      cta_label: data.cta_label || 'Get Deal',
      external_url: data.external_url,
      price_text: data.price_text || null,
      rating_text: data.rating_text || null,
      badge_text: data.badge_text || null,
      specs: data.specs || null,
      listed_by: data.listed_by || null,
      published: data.published || false
    }

    const newProduct = await createProduct(product)
    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}
