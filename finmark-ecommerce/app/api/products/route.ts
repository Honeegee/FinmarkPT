import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const clientId = parseInt(searchParams.get('clientId') || '1');

    const offset = (page - 1) * limit;

    // Build query based on filters
    let baseQuery = `
      SELECT id, name, description, price, stock_quantity, category_id, image_url, created_at, updated_at
      FROM product_schema.products
      WHERE is_active = true
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total
      FROM product_schema.products
      WHERE is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      baseQuery += ` AND category_id = $${paramIndex}`;
      countQuery += ` AND category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      baseQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      countQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add ordering and pagination
    baseQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute queries
    const [productsResult, countResult] = await Promise.all([
      query(baseQuery, params),
      query(countQuery, params.slice(0, paramIndex - 1))
    ]);

    const products = productsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Log analytics event if user is authenticated
    const auth = getAuthFromRequest(request);
    if (auth) {
      await query(
        `INSERT INTO analytics_schema.events (client_id, user_id, event_type, event_data)
         VALUES ($1, $2, $3, $4)`,
        [1, auth.userId, 'products_viewed', {
          page,
          limit,
          category,
          search,
          resultsCount: products.length
        }]
      );
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      filters: {
        category,
        search
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
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

    // Create product
    const result = await query(
      `INSERT INTO product_schema.products (name, description, price, stock_quantity, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, price, stock_quantity, category_id, image_url, created_at, updated_at`,
      [name, description, price, stockQuantity, category, imageUrl]
    );

    const product = result.rows[0];

    // Log analytics event
    await query(
      `INSERT INTO analytics_schema.events (client_id, user_id, event_type, event_data)
       VALUES ($1, $2, $3, $4)`,
      [1, auth.userId, 'product_created', {
        productId: product.id,
        name,
        price,
        category
      }]
    );

    return NextResponse.json({
      message: 'Product created successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stockQuantity: product.stock_quantity,
        category: product.category_id,
        imageUrl: product.image_url,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}