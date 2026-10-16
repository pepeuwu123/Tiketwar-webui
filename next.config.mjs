/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",   // required for the slim Docker image
  reactStrictMode: true,
};
export default nextConfig;
