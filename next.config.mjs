/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer ships ESM-only and Next's server-side module graph
  // needs this hint even when the package is only ever dynamically imported
  // client-side (see components/admin/documents/*Form.tsx).
  transpilePackages: ["@react-pdf/renderer"],
};

export default nextConfig;
