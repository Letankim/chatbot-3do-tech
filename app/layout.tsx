import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '3Do Tech AI ChatBot Rental',
  description: 'Dịch vụ cho thuê AI ChatBot thông minh, hỗ trợ khách hàng và tự động tư vấn sản phẩm, tối ưu trải nghiệm người dùng.',
  generator: '3Do Tech',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
