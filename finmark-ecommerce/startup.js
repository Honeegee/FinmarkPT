const { spawn } = require('child_process');
const http = require('http');

// Function to check if the server is ready
function checkServerHealth(port = 3000, maxRetries = 30) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const check = () => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/api/health',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        if (res.statusCode === 200 || res.statusCode === 503) {
          console.log('✅ Server is responding');
          resolve();
        } else {
          retryCheck();
        }
      });
      
      req.on('error', () => {
        retryCheck();
      });
      
      req.on('timeout', () => {
        req.destroy();
        retryCheck();
      });
      
      req.end();
    };
    
    const retryCheck = () => {
      retries++;
      if (retries >= maxRetries) {
        reject(new Error('Server failed to start within timeout'));
        return;
      }
      console.log(`⏳ Waiting for server... (${retries}/${maxRetries})`);
      setTimeout(check, 2000);
    };
    
    check();
  });
}

// Function to initialize database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Initializing database...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/init-db',
      method: 'POST',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Database initialized successfully:', result.message);
            resolve(result);
          } else {
            console.log('⚠️ Database initialization response:', result);
            resolve(result); // Don't fail startup for database issues
          }
        } catch (error) {
          console.log('⚠️ Database initialization completed with non-JSON response');
          resolve({ message: 'Database initialization attempted' });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('⚠️ Database initialization failed:', error.message);
      resolve({ error: error.message }); // Don't fail startup
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('⚠️ Database initialization timed out');
      resolve({ error: 'Timeout' }); // Don't fail startup
    });
    
    req.end();
  });
}

async function startApplication() {
  console.log('🚀 Starting Finmark E-commerce Application...');
  
  // Start the Next.js server
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  // Handle server process events
  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    console.log(`🔄 Server process exited with code ${code}`);
    process.exit(code);
  });
  
  try {
    // Wait for server to be ready
    await checkServerHealth();
    
    // Initialize database
    await initializeDatabase();
    
    console.log('✅ Application startup completed successfully!');
    console.log('🌐 Server is running on port 3000');
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    // Don't exit - let the server continue running
  }
  
  // Keep the process alive
  process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    server.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    server.kill('SIGINT');
  });
}

// Start the application
startApplication().catch((error) => {
  console.error('❌ Fatal startup error:', error);
  process.exit(1);
});