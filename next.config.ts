import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to be accessed over the LAN / server IP without the
  // cross-origin dev-resource warning. Add your own host/IP here if different.
  // (Only relevant for `next dev`; production `next start` is unaffected.)
  allowedDevOrigins: ["91.107.174.255"],
};

export default nextConfig;
