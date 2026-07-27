import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autocontenido para desplegar en el servidor local con `node server.js`
  output: "standalone",
};

export default nextConfig;
