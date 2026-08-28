/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necesario para que Next.js transpile el paquete del workspace (vive como
  // fuente TS compilada a dist/, pero igual conviene declararlo explícito).
  transpilePackages: ["@eternity/shared-types"],
};

export default nextConfig;
