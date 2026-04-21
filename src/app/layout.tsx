import type { Metadata } from 'next';
import { Instrument_Serif, Barlow } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Echo · 广告是剧集的回声',
  description:
    'Echo 是视频平台的「品味守门人」——让广告从撕毁沉浸契约的入侵者，变成延展剧集叙事的回声。腾讯 PCG 校园 AI 创意大赛作品。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${instrumentSerif.variable} ${barlow.variable}`}
    >
      <body className="font-body antialiased">
        <div className="min-h-screen bg-background text-text">{children}</div>
      </body>
    </html>
  );
}
