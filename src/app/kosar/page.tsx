'use client'

import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export default function Cart() {
  const { state, removeItem, updateQuantity } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    // Force a re-render of cart items when the component mounts
    const cartItems = localStorage.getItem('diplant-cart')
    if (cartItems) {
      try {
        const parsedCart = JSON.parse(cartItems)
        if (parsedCart.items && parsedCart.items.length > 0) {
          // The CartContext will handle loading the items
          console.log('Cart loaded from storage')
        }
      } catch (error) {
        console.error('Error parsing cart:', error)
      }
    }
  }, [])

  const handleQuantityChange = (id: number, value: number) => {
    if (value > 0) {
      updateQuantity(id, value)
    }
  }

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login with return URL
      window.location.href = `/login?returnUrl=${encodeURIComponent('/kosar')}`
      return
    }
    // Handle checkout for logged in users
    // ... checkout logic ...
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Kosár</h1>

        {state.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">A kosár jelenleg üres.</p>
            <a href="/kategoriak" className="btn-primary">
              Vásárlás folytatása
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200">
                <AnimatePresence>
                  {state.items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-24 h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src="/images/cover.jpeg"
                            alt={`${item.title} borító`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-6 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                              <p className="mt-1 text-sm text-gray-600">{item.author}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-[rgb(var(--primary-color))]"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <label htmlFor={`quantity-${item.id}`} className="mr-3 text-sm text-gray-700">
                                Mennyiség:
                              </label>
                              <input
                                type="number"
                                id={`quantity-${item.id}`}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                min="1"
                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-[rgb(var(--primary-color))] focus:border-[rgb(var(--primary-color))]"
                              />
                            </div>
                            <p className="text-lg font-medium text-[rgb(var(--primary-color))]">
                              {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            <div className="bg-[rgba(var(--primary-color),0.03)] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xl font-semibold text-gray-900">Összesen:</p>
                <p className="text-2xl font-bold text-[rgb(var(--primary-color))]">
                  {state.total.toLocaleString('hu-HU')} Ft
                </p>
              </div>

              <div className="space-y-4">
                {!user ? (
                  <div className="bg-[rgba(var(--accent-light),0.1)] p-4 rounded-md mb-4">
                    <p className="text-gray-600 text-sm mb-4">
                      A vásárlás befejezéséhez kérjük, jelentkezzen be vagy regisztráljon.
                    </p>
                    <a
                      href={`/login?returnUrl=${encodeURIComponent('/kosar')}`}
                      className="w-full btn-primary block text-center"
                    >
                      Bejelentkezés a vásárláshoz
                    </a>
                  </div>
                ) : (
                  <button onClick={handleCheckout} className="w-full btn-primary">
                    Tovább a pénztárhoz
                  </button>
                )}
                <a
                  href="/kategoriak"
                  className="block text-center text-[rgb(var(--primary-color))] hover:text-[rgb(var(--secondary-color))]"
                >
                  Vásárlás folytatása
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}