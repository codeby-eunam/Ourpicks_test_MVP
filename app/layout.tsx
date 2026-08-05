import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '오늘 뭐 먹지? | Picks',
  description: '1:1 토너먼트로 오늘의 맛집을 30초 안에 결정하세요.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAFAFA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-surface text-ink">
        <div className="mx-auto min-h-screen w-full max-w-[480px] bg-surface">
          {children}
        </div>
      </body>
    </html>
  );
}
