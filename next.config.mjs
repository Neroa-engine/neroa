const retirementRedirects = [
  {
    source: "/diy",
    destination: "/start?entry=diy",
    permanent: true
  },
  {
    source: "/diy-build",
    destination: "/start?entry=diy",
    permanent: true
  },
  {
    source: "/managed-build",
    destination: "/start?entry=managed",
    permanent: true
  },
  {
    source: "/managed-builds",
    destination: "/start?entry=managed",
    permanent: true
  },
  {
    source: "/managed-software-build-service",
    destination: "/start?entry=managed",
    permanent: true
  },
  {
    source: "/pricing/diy",
    destination: "/pricing",
    permanent: true
  },
  {
    source: "/pricing/managed",
    destination: "/pricing",
    permanent: true
  },
  {
    source: "/budget-pricing-logic",
    destination: "/pricing",
    permanent: true
  },
  {
    source: "/support",
    destination: "/contact?type=support",
    permanent: true
  },
  {
    source: "/example-build",
    destination: "/start",
    permanent: true
  },
  {
    source: "/system/ai",
    destination: "/",
    permanent: true
  },
  {
    source: "/system/:slug",
    destination: "/",
    permanent: true
  },
  {
    source: "/system",
    destination: "/",
    permanent: true
  },
  {
    source: "/ai-system/:slug",
    destination: "/",
    permanent: true
  },
  {
    source: "/ai-system",
    destination: "/",
    permanent: true
  },
  {
    source: "/blog/:slug",
    destination: "/",
    permanent: true
  },
  {
    source: "/blog",
    destination: "/",
    permanent: true
  },
  {
    source: "/use-cases/:slug/:detailSlug",
    destination: "/",
    permanent: true
  },
  {
    source: "/use-cases/:slug",
    destination: "/",
    permanent: true
  },
  {
    source: "/use-cases",
    destination: "/",
    permanent: true
  },
  {
    source: "/how-it-works/:slug",
    destination: "/",
    permanent: true
  },
  {
    source: "/how-it-works",
    destination: "/",
    permanent: true
  },
  {
    source: "/ai-app-builder",
    destination: "/",
    permanent: true
  },
  {
    source: "/ai-avatars",
    destination: "/",
    permanent: true
  },
  {
    source: "/what-is-saas",
    destination: "/",
    permanent: true
  },
  {
    source: "/instructions",
    destination: "/",
    permanent: true
  },
  {
    source: "/build-internal-tools-with-ai",
    destination: "/",
    permanent: true
  },
  {
    source: "/build-saas-with-ai",
    destination: "/",
    permanent: true
  },
  {
    source: "/build-software-without-hiring-developers",
    destination: "/",
    permanent: true
  },
  {
    source: "/early-access",
    destination: "/",
    permanent: true
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  async redirects() {
    return retirementRedirects;
  }
};

export default nextConfig;
