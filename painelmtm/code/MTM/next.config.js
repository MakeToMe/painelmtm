/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: { 
    unoptimized: true,
    domains: ['kcpgvnvqpcqflrqhwxjf.supabase.co', 'studio.rardevops.com']
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://studio.rardevops.com',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  poweredByHeader: false,
  generateEtags: false,
  distDir: '.next',
  cleanDistDir: true,
  output: 'standalone'
}

module.exports = nextConfig
