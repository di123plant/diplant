'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getFirestore, collection, getDocs, limit, query, orderBy } from 'firebase/firestore'
import { useCart } from '../contexts/CartContext'
import type { Book, CartItem } from '../types/book'

const SLIDE_INTERVAL = 5000
const BOOKS_TO_SHOW = 5

export default function BookSlideshow(): JSX.Element {
  const [books, setBooks] = useState<Book[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()

  const fetchFeaturedBooks = useCallback(async () => {
    try {
      const db = getFirestore()
      const booksRef = collection(db, 'konyv')
      const booksQuery = query(
        booksRef,
        orderBy('ar', 'desc'),
        limit(BOOKS_TO_SHOW)
      )
      
      const snapshot = await getDocs(booksQuery)
      const fetchedBooks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Book))
      
      if (fetchedBooks.length > 0) {
        setBooks(fetchedBooks)
      }
    } catch (error) {
      console.error('Error fetching featured books:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchFeaturedBooks()
  }, [fetchFeaturedBooks])

  useEffect(() => {
    if (books.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length)
    }, SLIDE_INTERVAL)

    return () => clearInterval(timer)
  }, [books.length])

  const handleAddToCart = useCallback((book: Book) => {
    const cartItem: CartItem = {
      id: Number(book.id),
      title: book.cim,
      author: book.szerzo,
      price: book.ar,
      cover: book.cover
    }
    addItem(cartItem)
  }, [addItem])

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]" />
      </div>
    )
  }

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-8">
        <div className="h-[600px] relative bg-white rounded-lg shadow-sm">
          <AnimatePresence mode="wait">
            {books[currentIndex] && (
              <motion.div
                key={books[currentIndex].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col md:flex-row items-center justify-center gap-12 p-8"
              >
                <div className="flex-1 space-y-6 max-w-xl">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-gray-900"
                  >
                    {books[currentIndex].cim}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl text-gray-600"
                  >
                    {books[currentIndex].szerzo}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4"
                  >
                    <p className="text-3xl font-bold text-[rgb(var(--primary-color))] mb-6">
                      {books[currentIndex].ar.toLocaleString('hu-HU')} Ft
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(books[currentIndex])}
                      className="btn-primary text-lg px-8 py-3"
                      aria-label={`Add ${books[currentIndex].cim} to cart`}
                    >
                      Kosárba
                    </motion.button>
                  </motion.div>
                </div>

                <div className="flex-1 h-full max-w-xl flex items-center justify-center">
                  <div className="relative w-[400px] h-[520px]">
                    <Image
                      src={books[currentIndex].cover ?? '/images/cover.jpeg'}
                      alt={`${books[currentIndex].cim} borító`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                      className="object-cover rounded-lg shadow-lg"
                      priority={currentIndex === 0}
                      quality={85}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {books.map((_, index) => (
              <button
                key={`slide-${index}`}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[rgb(var(--primary-color))]'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}