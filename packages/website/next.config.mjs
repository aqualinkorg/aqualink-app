/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA).
  distDir: './build',
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
