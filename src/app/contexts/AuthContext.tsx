'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { 
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, db } from '../config/firebase'
import { doc, setDoc } from 'firebase/firestore'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<UserCredential>
  register: (email: string, password: string, name: string) => Promise<UserCredential>
  logout: () => Promise<void>
}

interface UserData {
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const register = useCallback(async (email: string, password: string, name: string): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      const userData: UserData = {
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userData)
      return userCredential
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Registration failed')
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Login failed')
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Logout failed')
    }
  }, [])

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}