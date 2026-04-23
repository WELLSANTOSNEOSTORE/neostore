import type { Metadata, Viewport } from 'next'
import { Syne, Inter } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Neostore Credenciamento',
  description: 'Sistema profissional de credenciamento para eventos',
}

export const viewport: Viewport = {
  themeColor: '#0d0520',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
