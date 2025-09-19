/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA 기능을 위한 설정
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  // 카카오맵 API를 위한 이미지 도메인 설정
  images: {
    domains: ['dapi.kakao.com'],
  },
};

module.exports = nextConfig;
