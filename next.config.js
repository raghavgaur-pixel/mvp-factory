/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable turbopack for production
    experimental: {
      turbo: undefined
    }
  }
  
  module.exports = nextConfig