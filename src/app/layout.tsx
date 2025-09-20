import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://gomjellie.github.io/sungnam-child-allowance-map'),
  title: {
    default: '성남시 아동수당 가맹점 지도 | 신한카드 아동수당 사용처 찾기',
    template: '%s | 성남시 아동수당 가맹점 지도',
  },
  description: '성남시 아동수당을 사용할 수 있는 가맹점을 지도에서 쉽게 찾아보세요. 카테고리별 검색, 위치 기반 검색으로 편리하게 이용하세요.',
  keywords: [
    '성남시 아동수당',
    '아동수당 가맹점',
    '신한카드',
    '성남시 지도',
    '아동수당 사용처',
    '가맹점 찾기',
    '카카오맵',
    '성남 맛집',
    '성남 쇼핑',
    '분당',
    '수정구',
    '중원구',
  ],
  authors: [{ name: 'gomjellie' }],
  creator: 'gomjellie',
  publisher: 'gomjellie',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://gomjellie.github.io/sungnam-child-allowance-map',
    siteName: '성남시 아동수당 가맹점 지도',
    title: '성남시 아동수당 가맹점 지도',
    description: '성남시 아동수당을 사용할 수 있는 가맹점을 지도에서 쉽게 찾아보세요',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '성남시 아동수당 가맹점 지도',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '성남시 아동수당 가맹점 지도',
    description: '성남시 아동수당을 사용할 수 있는 가맹점을 지도에서 쉽게 찾아보세요',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '아동수당 가맹점 지도',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2d64bc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="text/javascript"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer,drawing`}
        ></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '성남시 아동수당 가맹점 지도',
              description: '성남시 아동수당을 사용할 수 있는 가맹점을 지도에서 쉽게 찾아보세요',
              url: 'https://gomjellie.github.io/sungnam-child-allowance-map/',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web Browser',
              author: {
                '@type': 'Person',
                name: 'gomjellie',
              },
              publisher: {
                '@type': 'Person',
                name: 'gomjellie',
              },
              inLanguage: 'ko-KR',
              keywords: '성남시 아동수당, 가맹점, 지도, 신한카드',
              image: 'https://gomjellie.github.io/sungnam-child-allowance-map/og-image.png',
              screenshot: 'https://gomjellie.github.io/sungnam-child-allowance-map/screen_shot.png',
              featureList: [
                '성남시 아동수당 가맹점 검색',
                '카테고리별 필터링',
                '지도 기반 위치 검색',
                '가맹점 정보 제공',
              ],
              serviceArea: {
                '@type': 'City',
                name: '성남시',
                containedInPlace: {
                  '@type': 'AdministrativeArea',
                  name: '경기도',
                  containedInPlace: {
                    '@type': 'Country',
                    name: '대한민국',
                  },
                },
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
