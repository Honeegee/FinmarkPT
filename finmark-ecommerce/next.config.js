/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Disable telemetry for faster builds
  experimental: {
    instrumentationHook: false,
  },
  
  // Optimize for production builds
  swcMinify: true,
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    unoptimized: true, // For faster builds, can be removed if you need image optimization
  },
  
  // Reduce bundle analyzer overhead
  webpack: (config, { dev, isServer }) => {
    // Optimize for faster builds
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig