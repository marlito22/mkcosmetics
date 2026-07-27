import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autocontenido para desplegar en el servidor local con `node server.js`
  output: "standalone",
  // Permite acceder al dev server (y su HMR) desde esta IP de LAN
  allowedDevOrigins: ["26.218.78.183"],
  experimental: {
    // Dominio público detrás del Cloudflare Tunnel: valida el CSRF check de los Server Actions
    serverActions: {
      allowedOrigins: ["mkcosmetic.com", "www.mkcosmetic.com"],
    },
  },
};

export default nextConfig;
