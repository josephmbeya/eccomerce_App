import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { products } from '@/lib/products'

const ADMIN_EMAILS = ['admin@tishope.com', 'your-email@example.com']

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productData = await request.json()
    
    // In a real application, you would save to database
    // For now, we'll just return the product data with a success message
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      rating: 0,
      reviewCount: 0,
      images: productData.image ? [productData.image] : []
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Create product API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
