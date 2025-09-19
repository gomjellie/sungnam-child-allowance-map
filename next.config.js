/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  // GitHub Pages에서는 이미지 최적화가 지원되지 않으므로 비활성화
  images: {
    unoptimized: true,
    domains: ['dapi.kakao.com'],
  },
};

module.exports = nextConfig;
