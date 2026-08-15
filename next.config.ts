import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Static export: the registry is just JSON under public/r plus a docs site,
  // so there is no server runtime to pay for. Output lands in ./out.
  output: "export",
  // The export target has no Next image optimiser.
  images: { unoptimized: true },
  // Cloudflare static assets serve /path as /path/index.html.
  trailingSlash: true,
}

export default nextConfig
