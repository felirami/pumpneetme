/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [64, 128, 256],
    imageSizes: [16, 32, 48, 64],
  },
}

module.exports = nextConfig

