import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const productId = parseInt(resolvedParams.id);
    const searchParams = request.nextUrl.searchParams;
    const clientId = parseInt(searchParams.get('clientId') || '1');

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Get product
    const result = await query(
      `SELECT id, name, description, price, stock_quantity, category, image_url, created_at, updated_at
       FROM products 
       WHERE id = $1 AND client_id = $2`,
      [productId, clientId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = result.rows[0];

    // Log analytics event if user is authenticated
    const auth = getAuthFromRequest(request);
    if (auth) {
      await query(
        `INSERT INTO analytics_events (client_id, user_id, event_type, event_data)
         VALUES ($1, $2, $3, $4)`,
        [clientId, auth.userId, 'product_viewed', { 
          productId: product.id,
          productName: product.name,
          category: product.category,
          price: product.price
        }]
      );
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stockQuantity: product.stock_quantity,
        category: product.category,
        imageUrl: product.image_url,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const productId = parseInt(resolvedParams.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, stockQuantity, category, imageUrl } = body;

    // Validation
    if (!name || !description || !price || stockQuantity === undefined) {
      return NextResponse.json(
        { error: 'Name, description, price, and stock quantity are required' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    if (stockQuantity < 0) {
      return NextResponse.json(
        { error: 'Stock quantity cannot be negative' },
        { status: 400 }
      );
    }

    // Update product
    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, stock_quantity = $4, 
           category = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND client_id = $8
       RETURNING id, name, description, price, stock_quantity, category, image_url, created_at, updated_at`,
      [name, description, price, stockQuantity, category, imageUrl, productId, auth.clientId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = result.rows[0];

    // Log analytics event
    await query(
      `INSERT INTO analytics_events (client_id, user_id, event_type, event_data)
       VALUES ($1, $2, $3, $4)`,
      [auth.clientId, auth.userId, 'product_updated', { 
        productId: product.id,
        name,
        price,
        category 
      }]
    );

    return NextResponse.json({
      message: 'Product updated successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stockQuantity: product.stock_quantity,
        category: product.category,
        imageUrl: product.image_url,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const productId = parseInt(resolvedParams.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Delete product
    const result = await query(
      'DELETE FROM products WHERE id = $1 AND client_id = $2 RETURNING id, name',
      [productId, auth.clientId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const deletedProduct = result.rows[0];

    // Log analytics event
    await query(
      `INSERT INTO analytics_events (client_id, user_id, event_type, event_data)
       VALUES ($1, $2, $3, $4)`,
      [auth.clientId, auth.userId, 'product_deleted', { 
        productId: deletedProduct.id,
        productName: deletedProduct.name
      }]
    );

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}