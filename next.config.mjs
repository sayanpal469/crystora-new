// Plain JS (not .ts): Hostinger's build servers have an old glibc, so Next falls back to
// WASM SWC, which can't compile a TypeScript config.
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Legacy SPA URLs that were never real pages.
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/home', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
