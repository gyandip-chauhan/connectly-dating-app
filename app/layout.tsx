// app/layout.tsx
import './globals.css'
import { Manrope, Playfair_Display } from 'next/font/google'
import { getServerSession } from '@/lib/supabase/server'
import { getSupabaseWarning, isSupabaseConfigured } from '@/lib/supabase/config'
import Navigation from '@/components/layout/Navigation'
import Header from '@/components/layout/Header'
import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import AuthProvider from '@/components/providers/AuthProvider'
import ToastProvider from '@/components/providers/ToastProvider'

const bodyFont = Manrope({ subsets: ['latin'], variable: '--font-body' })
const headingFont = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' })

export const metadata = {
  title: 'Connectly - Meaningful Connections',
  description: 'Find meaningful connections based on personality and interests',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session } = await getServerSession()
  const supabaseConfigured = isSupabaseConfigured()
  const supabaseWarning = getSupabaseWarning()

  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body className={`${bodyFont.className} antialiased text-white overflow-x-hidden selection:bg-pink-500/30`}>
        <div className="grain-overlay" />

        {!supabaseConfigured && supabaseWarning && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-400/90 text-black text-center text-xs font-bold px-4 py-1.5 backdrop-blur-md">
            {supabaseWarning}
          </div>
        )}

        <ToastProvider>
          <AuthProvider>
            {session ? (
              <div className="relative min-h-screen flex flex-col">
                {/* Global Background Elements */}
                <div className="fixed inset-0 pointer-events-none z-0">
                  <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full animate-float"></div>
                  <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Navigation />
                </div>
              </div>
            ) : (
              <div className="relative min-h-screen">
                <div className="fixed inset-0 pointer-events-none z-0">
                  <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-pink-500/15 blur-[140px] rounded-full"></div>
                  <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-500/10 blur-[140px] rounded-full"></div>
                </div>

                <div className="relative z-10">
                  <PublicHeader />
                  <main>{children}</main>
                  <Footer />
                </div>
              </div>
            )}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
