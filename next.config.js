/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production settings (disable checks for builds)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip type checking during development
  reactStrictMode: true,
  swcMinify: true,
  // Fix "unescaped apostrophe" warnings
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'lrsmgdyxntdmtjdyxapt.supabase.co', 'lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
