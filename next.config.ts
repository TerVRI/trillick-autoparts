import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trillickautoparts.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "www.trillickautoparts.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/categories/accessories/:path*",
        destination: "/britpart/:path*",
        permanent: true,
      },
      {
        source: "/britpart-calalogue",
        destination: "/catalogue",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
