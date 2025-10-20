// REMOVE 'use client' from this file if it exists
// This file MUST remain a Server Component

import type { Metadata } from 'next'
import './globals.css'
import 'aos/dist/aos.css'
import { ClientThemeProvider } from './components/ClientThemeProvider'

export const metadata: Metadata = {
  title: 'Bookmark SaaS - Save & Share Links',
  description: 'Your description here',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ClientThemeProvider>
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  )
}