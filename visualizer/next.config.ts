import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Configure Monaco Editor workers
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: "worker-loader" },
    });

    return config;
  },

  // Enable experimental features for better Monaco integration
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;
