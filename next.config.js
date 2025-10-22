
/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // ✅ THIS WILL IGNORE ALL ESLINT ERRORS DURING BUILD
      ignoreDuringBuilds: true,
    },
    typescript: {
      // ✅ ALSO IGNORE TYPESCRIPT ERRORS
      ignoreBuildErrors: true,
    },
  }
  
  module.exports = nextConfig