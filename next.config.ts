import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // remotePatterns reemplaza a images.domains (obsoleto en Next.js 16):
    // solo se optimizan las imágenes de personajes de la API, por HTTPS.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rickandmortyapi.com',
        pathname: '/api/character/avatar/**',
      },
    ],
  },
};

export default nextConfig;
