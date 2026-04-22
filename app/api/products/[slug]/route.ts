import { NextResponse } from 'next/server'
import { getProductBySlug, updateProduct } from '@/lib/supabase/products'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const product = await getProductBySlug(resolvedParams.slug)
    
    if (!product) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const data = await request.json()

    const updatedProduct = await updateProduct(resolvedParams.slug, {
      slug: data.slug,
      title: data.title,
      brand: data.brand || null,
      image_url: data.image_url || null,
      short_description: data.short_description,
      cta_label: data.cta_label || 'Check Price',
      external_url: data.external_url,
      price_text: data.price_text || null,
      rating_text: data.rating_text || null,
      badge_text: data.badge_text || null,
      specs: data.specs || null,
      published: data.published || false,
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product by slug:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    )
  }
}
