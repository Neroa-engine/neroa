/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  async redirects() {
    return [
      {
        source: "/blog/why-neroa-starts-with-narua-instead-of-a-dashboard",
        destination: "/blog/why-neroa-starts-with-neroa-instead-of-a-dashboard",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
