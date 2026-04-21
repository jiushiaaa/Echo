import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Echo · 广告是剧集的回声',
  description: 'Echo 是视频平台的"品味守门人"——让广告从撕毁沉浸契约的入侵者，变成延展剧集叙事的回声。腾讯 PCG 校园 AI 创意大赛作品。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-background text-text">{children}</div>
      </body>
    </html>
  );
}
