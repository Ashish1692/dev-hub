import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ModalPromptProvider } from '@/components/ModalPromptProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevHub - Kanban, Notes & Scripts Manager',
  description: 'A developer productivity hub with GitHub sync',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        <Providers>
          <ModalPromptProvider>
            {children}
          </ModalPromptProvider>
        </Providers>
      </body>
    </html>
  )
}
