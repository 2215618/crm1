/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'picsum.photos' },
      { hostname: 'ui-avatars.com' }
    ]
  }
};

module.exports = nextConfig;