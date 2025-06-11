// In-memory database implementation for demo purposes
// In production, replace with actual PostgreSQL connection

interface Client {
  id: number;
  company_name: string;
  domain: string;
  contact_email: string;
  subscription_plan: string;
  created_at: string;
}

interface User {
  id: number;
  client_id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  client_id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface AnalyticsEvent {
  id: number;
  client_id: number;
  user_id?: number;
  event_type: string;
  event_data: any;
  created_at: string;
}

// In-memory data storage
let clients: Client[] = [];
let users: User[] = [];
let products: Product[] = [];
let analytics_events: AnalyticsEvent[] = [];

let nextClientId = 1;
let nextUserId = 1;
let nextProductId = 1;
let nextEventId = 1;

// Initialize database with sample data
export async function initializeDatabase() {
  try {
    // Clear existing data
    clients = [];
    users = [];
    products = [];
    analytics_events = [];

    // Reset IDs
    nextClientId = 1;
    nextUserId = 1;
    nextProductId = 1;
    nextEventId = 1;

    // Insert default client (Finmark Corporation)
    const finmarkClient: Client = {
      id: nextClientId++,
      company_name: 'Finmark Corporation',
      domain: 'finmarksolutions.ph',
      contact_email: 'info@finmarksolutions.ph',
      subscription_plan: 'enterprise',
      created_at: new Date().toISOString()
    };
    clients.push(finmarkClient);

    // Insert sample products
    const sampleProducts: Omit<Product, 'id'>[] = [
      {
        client_id: 1,
        name: 'Business Analytics Dashboard',
        description: 'Complete analytics solution for SMEs with real-time reporting, KPI tracking, and business intelligence tools.',
        price: 2999.00,
        stock_quantity: 100,
        category: 'Software',
        image_url: '/api/placeholder/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        client_id: 1,
        name: 'Marketing Intelligence Suite',
        description: 'Advanced marketing analytics and insights to optimize campaigns, track customer acquisition, and improve ROI.',
        price: 4999.00,
        stock_quantity: 50,
        category: 'Software',
        image_url: '/api/placeholder/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        client_id: 1,
        name: 'Financial Planning Tool',
        description: 'Comprehensive financial analysis and planning software with forecasting, budgeting, and cash flow management.',
        price: 3999.00,
        stock_quantity: 75,
        category: 'Software',
        image_url: '/api/placeholder/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        client_id: 1,
        name: 'E-commerce Platform License',
        description: 'Full-featured e-commerce solution with inventory management, payment processing, and customer analytics.',
        price: 7999.00,
        stock_quantity: 25,
        category: 'Software',
        image_url: '/api/placeholder/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        client_id: 1,
        name: 'Business Strategy Consultation',
        description: 'One-on-one business strategy consultation with expert analysts to optimize your operations and growth.',
        price: 1999.00,
        stock_quantity: 200,
        category: 'Service',
        image_url: '/api/placeholder/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        client_id: 1,
        name: 'Data Migration Service',
        description: 'Professional data migration and setup service for seamless transition to our platform.',
        price: 2499.00,
        stock_quantity: 150,
        category: 'Service',
        image_url: '/api/placeholder/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        client_id: 1,
        name: 'Advanced Analytics Package',
        description: 'Premium analytics package with AI-powered insights, predictive modeling, and custom reporting.',
        price: 8999.00,
        stock_quantity: 30,
        category: 'Software',
        image_url: '/api/placeholder/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        client_id: 1,
        name: 'Training & Support Package',
        description: 'Comprehensive training and ongoing support package for maximum platform utilization.',
        price: 1499.00,
        stock_quantity: 300,
        category: 'Service',
        image_url: '/api/placeholder/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    sampleProducts.forEach(product => {
      products.push({
        id: nextProductId++,
        ...product
      });
    });

    console.log('In-memory database initialized successfully');
    console.log(`Initialized with ${clients.length} clients and ${products.length} products`);
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Query execution interface
export async function query(text: string, params?: any[]) {
  // Simple query parser for basic SQL operations
  const queryText = text.trim().toLowerCase();
  
  if (queryText.startsWith('select')) {
    return handleSelect(text, params);
  } else if (queryText.startsWith('insert')) {
    return handleInsert(text, params);
  } else if (queryText.startsWith('update')) {
    return handleUpdate(text, params);
  } else if (queryText.startsWith('delete')) {
    return handleDelete(text, params);
  } else {
    throw new Error('Unsupported query type');
  }
}

function handleSelect(queryText: string, params: any[] = []): { rows: any[] } {
  const query = queryText.toLowerCase();
  
  // Users queries
  if (query.includes('from users')) {
    let filteredUsers = [...users];
    
    if (query.includes('where')) {
      if (params.length > 0) {
        if (query.includes('email = $1 and client_id = $2')) {
          filteredUsers = users.filter(u => u.email === params[0] && u.client_id === params[1]);
        } else if (query.includes('id = $1 and client_id = $2')) {
          filteredUsers = users.filter(u => u.id === params[0] && u.client_id === params[1]);
        } else if (query.includes('email = $1 and client_id = $2 and id != $3')) {
          filteredUsers = users.filter(u => u.email === params[0] && u.client_id === params[1] && u.id !== params[2]);
        }
      }
    }
    
    if (query.includes('count(*)')) {
      return { rows: [{ count: filteredUsers.length.toString() }] };
    }
    
    return { rows: filteredUsers };
  }
  
  // Products queries
  if (query.includes('from products')) {
    let filteredProducts = [...products];
    let paramIndex = 0;
    
    if (query.includes('where')) {
      if (query.includes('client_id = $1')) {
        filteredProducts = products.filter(p => p.client_id === params[paramIndex]);
        paramIndex++;
      }
      
      if (query.includes('id = $' + (paramIndex + 1))) {
        filteredProducts = filteredProducts.filter(p => p.id === params[paramIndex]);
        paramIndex++;
      }
      
      if (query.includes('category = $' + (paramIndex + 1))) {
        filteredProducts = filteredProducts.filter(p => p.category === params[paramIndex]);
        paramIndex++;
      }
      
      if (query.includes('ilike')) {
        const searchTerm = params[paramIndex]?.replace(/%/g, '');
        if (searchTerm) {
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      }
    }
    
    // Apply ordering and pagination
    if (query.includes('order by created_at desc')) {
      filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    if (query.includes('limit') && query.includes('offset')) {
      const limitMatch = query.match(/limit \$(\d+)/);
      const offsetMatch = query.match(/offset \$(\d+)/);
      
      if (limitMatch && offsetMatch) {
        const limitIndex = parseInt(limitMatch[1]) - 1;
        const offsetIndex = parseInt(offsetMatch[1]) - 1;
        const limit = params[limitIndex];
        const offset = params[offsetIndex];
        
        filteredProducts = filteredProducts.slice(offset, offset + limit);
      }
    }
    
    if (query.includes('count(*)')) {
      return { rows: [{ total: filteredProducts.length.toString() }] };
    }
    
    return { rows: filteredProducts };
  }
  
  // Analytics events queries
  if (query.includes('from analytics_events')) {
    let filteredEvents = [...analytics_events];
    
    if (query.includes('where client_id = $1')) {
      filteredEvents = analytics_events.filter(e => e.client_id === params[0]);
    }
    
    if (query.includes('group by')) {
      // Handle grouped queries for analytics
      if (query.includes("date(created_at)")) {
        const grouped = filteredEvents.reduce((acc, event) => {
          const date = event.created_at.split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          rows: Object.entries(grouped).map(([date, count]) => ({ date, count }))
        };
      }
      
      if (query.includes("event_type")) {
        const grouped = filteredEvents.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          rows: Object.entries(grouped).map(([event_type, count]) => ({ event_type, count }))
        };
      }
    }
    
    if (query.includes('count(*)')) {
      return { rows: [{ count: filteredEvents.length.toString() }] };
    }
    
    return { rows: filteredEvents };
  }
  
  // Summary queries for dashboard
  if (query.includes('select ') && query.includes('as total_users')) {
    return {
      rows: [{
        total_users: users.length,
        total_products: products.length,
        active_users_24h: analytics_events.filter(e => 
          e.event_type === 'user_login' && 
          new Date(e.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length,
        total_product_views: analytics_events.filter(e => e.event_type === 'product_viewed').length
      }]
    };
  }
  
  // Category stats
  if (query.includes('group by category')) {
    const categoryStats = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          category: product.category,
          product_count: 0,
          total_price: 0,
          total_stock: 0
        };
      }
      acc[product.category].product_count++;
      acc[product.category].total_price += product.price;
      acc[product.category].total_stock += product.stock_quantity;
      return acc;
    }, {} as Record<string, any>);
    
    return {
      rows: Object.values(categoryStats).map((cat: any) => ({
        ...cat,
        avg_price: (cat.total_price / cat.product_count).toFixed(2)
      }))
    };
  }
  
  return { rows: [] };
}

function handleInsert(queryText: string, params: any[] = []): { rows: any[] } {
  const query = queryText.toLowerCase();
  
  if (query.includes('into users')) {
    const newUser: User = {
      id: nextUserId++,
      client_id: params[0],
      email: params[1],
      password_hash: params[2],
      first_name: params[3],
      last_name: params[4],
      role: 'customer',
      email_verified: params[5] || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(newUser);
    return { rows: [newUser] };
  }
  
  if (query.includes('into products')) {
    const newProduct: Product = {
      id: nextProductId++,
      client_id: params[0],
      name: params[1],
      description: params[2],
      price: params[3],
      stock_quantity: params[4],
      category: params[5],
      image_url: params[6],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    products.push(newProduct);
    return { rows: [newProduct] };
  }
  
  if (query.includes('into analytics_events')) {
    const newEvent: AnalyticsEvent = {
      id: nextEventId++,
      client_id: params[0],
      user_id: params[1],
      event_type: params[2],
      event_data: typeof params[3] === 'string' ? JSON.parse(params[3]) : params[3],
      created_at: new Date().toISOString()
    };
    analytics_events.push(newEvent);
    return { rows: [newEvent] };
  }
  
  return { rows: [] };
}

function handleUpdate(queryText: string, params: any[] = []): { rows: any[] } {
  const query = queryText.toLowerCase();
  
  if (query.includes('update users')) {
    const userId = params[params.length - 2];
    const clientId = params[params.length - 1];
    
    const userIndex = users.findIndex(u => u.id === userId && u.client_id === clientId);
    if (userIndex !== -1) {
      if (query.includes('first_name = $1')) {
        users[userIndex].first_name = params[0];
        users[userIndex].last_name = params[1];
        if (params[2]) users[userIndex].email = params[2];
      }
      users[userIndex].updated_at = new Date().toISOString();
      return { rows: [users[userIndex]] };
    }
  }
  
  if (query.includes('update products')) {
    const productId = params[params.length - 2];
    const clientId = params[params.length - 1];
    
    const productIndex = products.findIndex(p => p.id === productId && p.client_id === clientId);
    if (productIndex !== -1) {
      products[productIndex].name = params[0];
      products[productIndex].description = params[1];
      products[productIndex].price = params[2];
      products[productIndex].stock_quantity = params[3];
      products[productIndex].category = params[4];
      products[productIndex].image_url = params[5];
      products[productIndex].updated_at = new Date().toISOString();
      return { rows: [products[productIndex]] };
    }
  }
  
  return { rows: [] };
}

function handleDelete(queryText: string, params: any[] = []): { rows: any[] } {
  const query = queryText.toLowerCase();
  
  if (query.includes('from products')) {
    const productId = params[0];
    const clientId = params[1];
    
    const productIndex = products.findIndex(p => p.id === productId && p.client_id === clientId);
    if (productIndex !== -1) {
      const deletedProduct = products[productIndex];
      products.splice(productIndex, 1);
      return { rows: [deletedProduct] };
    }
  }
  
  return { rows: [] };
}

// Export for compatibility
export const pool = {
  connect: async () => ({
    query: async (text: string, params?: any[]) => query(text, params),
    release: () => {}
  })
};