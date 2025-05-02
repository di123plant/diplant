'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react'
import type { Book } from '../types/book'

interface CartItem {
  id: number
  title: string
  author: string
  price: number
  quantity: number
  cover?: string
}

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const CART_STORAGE_KEY = 'diplant-cart'
const MAX_QUANTITY = 99

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + 1, MAX_QUANTITY)
        if (newQuantity === existingItem.quantity) {
          return state // No change needed if already at max
        }
        
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: newQuantity }
            : item
        )
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        }
      }

      const newItem = { ...action.payload, quantity: 1 }
      const updatedItems = [...state.items, newItem]
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity < 0 || quantity > MAX_QUANTITY) {
        return state
      }

      const updatedItems = state.items.map(item =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
      
      // Remove item if quantity is 0
      const filteredItems = quantity === 0 
        ? updatedItems.filter(item => item.id !== id)
        : updatedItems

      return {
        items: filteredItems,
        total: calculateTotal(filteredItems)
      }
    }

    case 'CLEAR_CART':
      return { items: [], total: 0 }

    case 'LOAD_CART':
      return {
        ...action.payload,
        total: calculateTotal(action.payload.items)
      }

    default:
      return state
  }
}

function calculateTotal(items: CartItem[]): number {
  return Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2))
}

function getInitialState(): CartState {
  if (typeof window === 'undefined') {
    return { items: [], total: 0 }
  }

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart) as CartState
      return {
        ...parsedCart,
        total: calculateTotal(parsedCart.items)
      }
    }
  } catch (error) {
    console.error('Failed to parse cart from localStorage:', error)
  }
  
  return { items: [], total: 0 }
}

export function CartProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(cartReducer, null, getInitialState)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }, [])

  const removeItem = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const updateQuantity = useCallback((id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const itemCount = useMemo(() => 
    state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items]
  )

  const value = useMemo(() => ({
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount
  }), [state, addItem, removeItem, updateQuantity, clearCart, itemCount])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}