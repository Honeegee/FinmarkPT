import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getAuthFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventType, eventData = {} } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    // Track the event
    await query(
      `INSERT INTO analytics_schema.events (client_id, user_id, event_type, event_data)
       VALUES ($1, $2, $3, $4)`,
      [1, auth.userId, eventType, JSON.stringify(eventData)]
    );

    return NextResponse.json({
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Track event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = `
      SELECT id, event_type, event_data, created_at, user_id
      FROM analytics_schema.events
      WHERE client_id = $1
    `;
    
    const params: any[] = [1];
    let paramIndex = 2;

    if (eventType) {
      queryText += ` AND event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }

    // Only allow users to see their own events, admins can see all
    if (auth.role !== 'admin') {
      queryText += ` AND user_id = $${paramIndex}`;
      params.push(auth.userId);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    return NextResponse.json({
      events: result.rows,
      pagination: {
        limit,
        offset,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}