import type { NextConfig } from 'next';
// A private output directory lets verification coexist with the developer server.
const output = process.env.UNRAVEL_NEXT_OUTPUT;
if (output && !/^\.next-[a-z0-9-]+$/.test(output))
  throw new Error('Invalid verification output directory.');
const config: NextConfig = {
  ...(output ? { distDir: output } : {}),
  images: { qualities: [75, 90] },
  reactStrictMode: true,
  devIndicators: false,
  agentRules: false,
  poweredByHeader: false,
};
export default config;
