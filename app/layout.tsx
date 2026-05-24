import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Content Copilot - AI 写作助手',
  description: '辅助写作的本地工具，支持微信公众号、小红书等多平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="h-screen overflow-hidden bg-[#f5f5f5]">{children}</body>
    </html>
  )
}
