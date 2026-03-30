import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="pl">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
