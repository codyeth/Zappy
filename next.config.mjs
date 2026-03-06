/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "1";
const nextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/Zappy" : "",
  assetPrefix: isGitHubPages ? "/Zappy/" : "",
  images: { unoptimized: true },
};

export default nextConfig;
