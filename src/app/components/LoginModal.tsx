'use client'

import { useState, FormEvent, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { FirebaseError } from 'firebase/app'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps): React.ReactElement {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuth()

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        if (!name.trim()) {
          throw new Error('A név megadása kötelező')
        }
        await register(email, password, name)
      }
      onClose()
    } catch (err) {
      const error = err as FirebaseError | Error
      setError(
        error instanceof FirebaseError ? 
          error.code === 'auth/wrong-password' ? 'Hibás jelszó' :
          error.code === 'auth/user-not-found' ? 'Nem található felhasználó ezzel az email címmel' :
          error.code === 'auth/email-already-in-use' ? 'Ez az email cím már regisztrálva van' :
          error.code === 'auth/weak-password' ? 'A jelszónak legalább 6 karakterből kell állnia' :
          error.message :
        error.message || 'Hiba történt a bejelentkezés során'
      )
    } finally {
      setLoading(false)
    }
  }, [isLogin, email, password, name, login, register, onClose])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }, [])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Reset form when closing
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setName('')
      setError('')
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
            role="presentation"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 id="modal-title" className="text-2xl font-semibold text-gray-900">
                  {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Bezárás"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div 
                  className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Név
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={handleNameChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(var(--primary-color))] focus:border-[rgb(var(--primary-color))]"
                      required
                      aria-required="true"
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email cím
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(var(--primary-color))] focus:border-[rgb(var(--primary-color))]"
                    required
                    aria-required="true"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Jelszó
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(var(--primary-color))] focus:border-[rgb(var(--primary-color))]"
                    required
                    aria-required="true"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-busy={loading}
                >
                  {loading ? 'Folyamatban...' : (isLogin ? 'Bejelentkezés' : 'Regisztráció')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                  }}
                  className="text-[rgb(var(--primary-color))] hover:text-[rgb(var(--secondary-color))] text-sm transition-colors"
                  type="button"
                >
                  {isLogin ? 'Még nem regisztrált? Regisztráció' : 'Már regisztrált? Bejelentkezés'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}