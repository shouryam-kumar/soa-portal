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
  // Suppress the punycode deprecation warning
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ }
    ];
    
    return config;
  }
};

module.exports = nextConfig;
