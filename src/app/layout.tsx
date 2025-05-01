'use client'

import { Inter } from 'next/font/google'
import { useState } from 'react'
import './globals.css'
import SearchBar from './components/SearchBar'
import LoginModal from './components/LoginModal'
import CategoryDropdown from './components/CategoryDropdown'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { useAuth } from './contexts/AuthContext'
import { useCart } from './contexts/CartContext'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

function MainLayout({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const { user, logout } = useAuth()
  const { state } = useCart()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div>
      <nav className={`border-b transition-colors duration-300 ${user ? 'bg-[rgb(var(--primary-color))]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <span className={`text-xl font-semibold ${user ? 'text-white' : 'text-[rgb(var(--primary-color))]'}`}>
                  Di-Plant
                </span>
                <span className={user ? 'text-white' : 'text-[rgb(var(--secondary-color))]'}>
                  Nyelvkönyvbolt
                </span>
              </a>
              <div className="hidden sm:ml-6 sm:flex space-x-4">
                <CategoryDropdown />
                <a href="/ujdonsagok" className={`nav-link ${user ? 'text-white hover:text-gray-200' : ''}`}>Újdonságok</a>
                <a href="/akciok" className={`nav-link ${user ? 'text-white hover:text-gray-200' : ''}`}>Akciók</a>
                <a href="/rolunk" className={`nav-link ${user ? 'text-white hover:text-gray-200' : ''}`}>Rólunk</a>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <SearchBar />
              <div className="flex items-center ml-8">
                <a href="/kosar" className={`flex items-center relative ${user ? 'text-white hover:text-gray-200' : ''}`}>
                  <div className="flex items-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="ml-2">Kosár</span>
                  </div>
                  {state.items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[rgb(var(--secondary-color))] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {state.items.length}
                    </span>
                  )}
                </a>
              </div>
              {user ? (
                <>
                  <button
                    onClick={handleLogout}
                    className={`nav-link flex items-center ${user ? 'text-white hover:text-gray-200' : ''}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="ml-2">Kijelentkezés</span>
                  </button>
                  <a href="/admin" className={`nav-link flex items-center ${user ? 'text-white hover:text-gray-200' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="ml-2">Admin</span>
                  </a>
                  <a href="/profil" className={`nav-link flex items-center ${user ? 'text-white hover:text-gray-200' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="ml-2">Profil</span>
                  </a>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="nav-link flex items-center ml-6"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="ml-2">Belépés</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-[rgba(var(--accent-light),0.1)] border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-semibold text-[rgb(var(--primary-color))]">Di-Plant</span>
                <span className="text-[rgb(var(--secondary-color))]">Nyelvkönyvbolt</span>
              </div>
              <p className="text-gray-600 mb-4">
                Több mint 30 éve segítjük a nyelvtanulókat céljaik elérésében. Szakértő csapatunk 
                gondosan válogatott nyelvkönyvekkel és személyre szabott tanácsadással áll rendelkezésére.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Információk</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="/szallitas" className="text-gray-600 hover:text-[rgb(var(--primary-color))]">
                    Szállítási információk
                  </a>
                </li>
                <li>
                  <a href="/fizetesi-modok" className="text-gray-600 hover:text-[rgb(var(--primary-color))]">
                    Fizetési módok
                  </a>
                </li>
                <li>
                  <a href="/aszf" className="text-gray-600 hover:text-[rgb(var(--primary-color))]">
                    ÁSZF
                  </a>
                </li>
                <li>
                  <a href="/adatvedelem" className="text-gray-600 hover:text-[rgb(var(--primary-color))]">
                    Adatvédelem
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Kapcsolat</h3>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2 text-[rgb(var(--primary-color))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  1053 Budapest, Példa utca 1.
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2 text-[rgb(var(--primary-color))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@diplant.hu
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2 text-[rgb(var(--primary-color))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +36 1 234 5678
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Di-Plant Nyelvkönyvbolt. Minden jog fenntartva.</p>
          </div>
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <MainLayout>{children}</MainLayout>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
