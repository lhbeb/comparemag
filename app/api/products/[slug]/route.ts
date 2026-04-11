import { NextResponse } from 'next/server'
import { getProductBySlug, updateProduct, deleteProduct } from '@/lib/supabase/products'
import type { ProductCardUpdate } from '@/lib/supabase/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const product = await getProductBySlug(resolvedParams.slug)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const data = await request.json()
    
    const updates: ProductCardUpdate = {
      title: data.title,
      slug: data.slug,
      brand: data.brand || null,
      image_url: data.image_url || null,
      short_description: data.short_description,
      cta_label: data.cta_label || 'Check Price',
      external_url: data.external_url,
      price_text: data.price_text || null,
      rating_text: data.rating_text || null,
      badge_text: data.badge_text || null,
      specs: data.specs || null,
      published: data.published
    }

    const product = await updateProduct(resolvedParams.slug, updates)
    return NextResponse.json(product)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    await deleteProduct(resolvedParams.slug)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    )
  }
}
