import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autocontenido para desplegar en el servidor local con `node server.js`
  output: "standalone",
  // Permite acceder al dev server (y su HMR) desde esta IP de LAN
  allowedDevOrigins: ["26.218.78.183"],
  experimental: {
    serverActions: {
      // Dominio público detrás del Cloudflare Tunnel: valida el CSRF check de los Server Actions
      allowedOrigins: ["mkcosmetic.com", "www.mkcosmetic.com"],
      // Por defecto Next limita el body a 1mb; las fotos de producto admiten hasta 8mb
      // (ver MAX_IMAGE_BYTES en src/lib/actions/products.ts), + margen para overhead de multipart.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
