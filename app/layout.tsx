import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'North',
    template: '%s — North',
  },
  description: 'Calm, collaborative planning for focused teams.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('north_theme');
              if (!t) {
                t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              if (t && t !== 'light') document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })()
        `}} />
      </head>
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  )
}
