import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: {
    default: 'AgroPortal — Portal rolniczy dla polskich rolników',
    template: '%s | AgroPortal',
  },
  description:
    'Największy polski portal rolniczy — ogłoszenia maszyn, giełda produktów, baza firm agro, aktualności rolnicze.',
  keywords: ['rolnictwo', 'maszyny rolnicze', 'giełda rolna', 'ogłoszenia rolnicze', 'agro'],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'AgroPortal',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
