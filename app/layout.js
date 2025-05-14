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
                    {/* Sidebar */}
                    <div className="w-64 border-r border-neutral-200/50 dark:border-neutral-800/50 bg-card">
                      <div className="flex flex-col h-full">

                        {/* Top Section of SideBar */}
                        <div className="flex flex-col items-center justify-between gap-4 p-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
                          <div className='w-full flex justify-between items-center'>
                            <Link href="/" className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer p-2">
                              CelebChat AI
                            </Link>

                            <button className='text-neutral-700 dark:text-neutral-200 hover:text-primary p-2 transition-colors duration-200'>
                              <PanelLeftClose className='h-6 w-6'/>
                            </button>
                          </div>
                          
                          <div className="flex items-center w-full">
                            <NavigationIcons />
                          </div>
                        </div>


                        {/* Middle Section of Sidebar */}
                        <div className="flex-1 overflow-hidden">
                          <CharacterList />
                        </div>

                      </div>
                    </div>
                    {/* Main Content */}
                    <main className="flex-1 overflow-auto">
                      {children}
                    </main>
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
