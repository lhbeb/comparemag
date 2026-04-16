import { NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/supabase/products'

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

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
