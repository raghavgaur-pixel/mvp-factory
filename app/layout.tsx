// REMOVE 'use client' from this file if it exists
// This file MUST remain a Server Component

import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}