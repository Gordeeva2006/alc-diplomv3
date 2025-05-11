import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  }
}
module.exports = {
  typescript: {
    // Игнорировать ошибки TypeScript при сборке
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
