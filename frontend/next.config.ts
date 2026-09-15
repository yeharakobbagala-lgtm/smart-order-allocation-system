import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN / any IPv4 host to load Next.js HMR + dev assets
  // (hostname only — no scheme/port). Restart `npm run dev` after changes.
  allowedDevOrigins: [
    "192.168.1.4",
    "*.*.*.*", // any IPv4 address (e.g. other devices on your network)
  ],
};

export default nextConfig;
