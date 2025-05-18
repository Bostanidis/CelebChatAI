import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { CharacterProvider } from '@/contexts/CharacterContext'
import { ChatProvider } from '@/contexts/ChatContext.jsx'
import CharacterList from '@/components/sidebar/CharacterList'
import { NavigationIcons } from '@/components/NavigationIcons'
import Link from 'next/link'
import { PanelLeftClose } from 'lucide-react'
import LayoutWrapper from '@/components/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CelebChat AI',
  description: 'Chat with AI-powered celebrity characters',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SubscriptionProvider>
              <CharacterProvider>
                <ChatProvider>
                  <div className="flex h-screen bg-background">
                    <LayoutWrapper>
                      {/* Main Content */}
                      <main className="flex-1 flex flex-col">
                        {children}
                      </main>
                    </LayoutWrapper>
                  </div>
                </ChatProvider>
              </CharacterProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
