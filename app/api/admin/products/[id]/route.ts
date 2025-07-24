import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const ADMIN_EMAILS = ['admin@tishope.com', 'your-email@example.com']

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productData = await request.json()
    const resolvedParams = await params
    
    // In a real application, you would update the product in database
    // For now, we'll just return the updated product data
    const updatedProduct = {
      ...productData,
      id: resolvedParams.id,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Update product API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    // In a real application, you would delete the product from database
    // For now, we'll just return a success message
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
