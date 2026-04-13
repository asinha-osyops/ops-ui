import type { Metadata } from 'next'
import { Montserrat, Saira } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'

const montserrat = Montserrat({ subsets: ['latin'] })
const saira = Saira({
  subsets: ['latin'],
  variable: '--font-saira',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'OSY Operations',
  description: 'Operations management and SOP portal',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${montserrat.className} ${saira.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
