import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import SessionProvider from '@/components/SessionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'TISHOPE - Premium E-Commerce Experience',
  description: 'Discover premium products with TISHOPE - Your ultimate shopping destination featuring the latest trends, quality items, and exceptional customer service.',
  keywords: 'ecommerce, shopping, premium products, online store, fashion, electronics, accessories',
  authors: [{ name: 'TISHOPE Team' }],
  creator: 'TISHOPE',
  publisher: 'TISHOPE',
  metadataBase: new URL('https://tishope.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TISHOPE - Premium E-Commerce Experience',
    description: 'Discover premium products with TISHOPE - Your ultimate shopping destination.',
    url: 'https://tishope.com',
    siteName: 'TISHOPE',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TISHOPE - Premium Shopping Experience',
      },
    ],
    locale: 'en_MW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TISHOPE - Premium E-Commerce Experience',
    description: 'Discover premium products with TISHOPE - Your ultimate shopping destination.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="tishope-theme"
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
            }}
          />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
