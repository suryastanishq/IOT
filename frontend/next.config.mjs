/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: [
        "**/.git/**",
        "**/.next/**",
        "**/node_modules/**",
        "**/.venv/**",
        "../backend/.venv/**",
      ],
    };
    return config;
  },
};

export default nextConfig;
