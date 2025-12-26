import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Providers } from '@/components/providers/Providers'

export const metadata: Metadata = {
  title: 'Navbahor ERP - Paxtani Qayta Ishlash Zavodi',
  description: 'Navbahor Tekstil ERP tizimi - Zamonaviy paxtani qayta ishlash zavodi boshqaruv tizimi',
  keywords: ['ERP', 'Navbahor', 'Tekstil', 'Paxta', 'Manufacturing'],
  authors: [{ name: 'Navbahor Tekstil' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0bae4a" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}