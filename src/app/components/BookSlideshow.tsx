'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { useCart } from '../contexts/CartContext'

interface Book {
  id: string
  cim: string
  szerzo: string
  ar: number
  isbn: string
  kiado: string
  kategoria?: string
  nyelv?: string
  leiras?: string
  keszlet?: number
}

export default function BookSlideshow() {
  const [books, setBooks] = useState<Book[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const db = getFirestore()
        const booksRef = collection(db, 'konyv')
        // Get all books
        const snapshot = await getDocs(booksRef)
        const allBooks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[]
        
        // Randomly select 5 books for the slideshow
        const shuffled = allBooks.sort(() => 0.5 - Math.random())
        const selectedBooks = shuffled.slice(0, 5)
        
        if (selectedBooks.length > 0) {
          setBooks(selectedBooks)
        }
      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedBooks()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [books.length])

  const handleAddToCart = (book: Book) => {
    setIsAdding(true)
    addItem({
      id: Number(book.id),
      title: book.cim,
      author: book.szerzo,
      price: book.ar,
      cover: undefined
    })
    setTimeout(() => setIsAdding(false), 300)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]"></div>
      </div>
    )
  }

  return (
    <section className="relative overflow-hidden bg-white py-8">
      <div className="container mx-auto px-4 h-[500px] relative">
        <AnimatePresence mode="wait">
          {books[currentIndex] && (
            <motion.div
              key={books[currentIndex].id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              <div className="relative z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-900 mb-4"
                >
                  {books[currentIndex].cim}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 mb-6"
                >
                  {books[currentIndex].szerzo}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <p className="text-2xl font-bold text-[rgb(var(--primary-color))]">
                    {books[currentIndex].ar.toLocaleString('hu-HU')} Ft
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isAdding ? { scale: [1, 1.2, 1] } : {}}
                    onClick={() => handleAddToCart(books[currentIndex])}
                    className="btn-primary"
                  >
                    Kosárba
                  </motion.button>
                </motion.div>
              </div>
              <div className="hidden md:block">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mx-auto">
                  <img 
                    src="/images/cover.jpeg"
                    alt={`${books[currentIndex].cim} borító`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {books.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-[rgb(var(--primary-color))]'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}