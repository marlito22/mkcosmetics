import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autocontenido para desplegar en el servidor local con `node server.js`
  output: "standalone",
  // Permite acceder al dev server (y su HMR) desde esta IP de LAN
  allowedDevOrigins: ["26.218.78.183"],
  // El output file tracing de Next no detecta los binarios nativos de sharp
  // (libvips), asi que hay que forzar su inclusion en el standalone o falla
  // en runtime con "Could not load the sharp module".
  outputFileTracingIncludes: {
    "/*": ["./node_modules/sharp/**/*", "./node_modules/@img/**/*"],
  },
  experimental: {
    serverActions: {
      // Dominio público detrás del Cloudflare Tunnel: valida el CSRF check de los Server Actions
      allowedOrigins: ["mkcosmetic.com", "www.mkcosmetic.com"],
      // Por defecto Next limita el body a 1mb; un producto admite hasta 6 imágenes
      // generales + 10 tonos de hasta 4mb cada uno (ver MAX_IMAGE_BYTES/MAX_GENERAL_IMAGES/
      // MAX_VARIANTS en src/lib/actions/products.ts), + margen para overhead de multipart.
      bodySizeLimit: "70mb",
    },
  },
};

export default nextConfig;
