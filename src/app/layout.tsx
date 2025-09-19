import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '성남시 아동수당 가맹점 지도',
  description: '성남시 아동수당 가맹점의 위치를 지도에서 쉽게 찾아보세요',
  manifest: '/manifest.json',
  themeColor: '#2d64bc',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
