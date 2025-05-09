/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  // Image domains configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lrsmgdyxntdmtjdyxapt.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Disable experimental features 
  experimental: {},
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Suppress the punycode deprecation warning
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ];

    // Disable code splitting to prevent Supabase chunking issues
    if (isServer) {
      config.optimization.splitChunks = false;
    }

    // Fix for server-side 'self is not defined' error
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;
