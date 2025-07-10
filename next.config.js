/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pgvector"],
  },
};

module.exports = nextConfig;
