/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@healthcoin/wallet-core"],
  webpack: (config, { isServer }) => {
    // Wormhole SDK uses rpc-websockets which has broken ESM exports in this version.
    // Mark heavy SDK packages as external on the server side.
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "@wormhole-foundation/sdk",
        "rpc-websockets",
      ];
    }
    // Silence missing optional deps from @solana/web3.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, net: false, tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
