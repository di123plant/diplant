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
      <div className="flex justify-center items-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]"></div>
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
                      animate={isAdding ? { scale: [1, 1.2, 1] } : {}}
                      onClick={() => handleAddToCart(books[currentIndex])}
                      className="btn-primary text-lg px-8 py-3"
                    >
                      Kosárba
                    </motion.button>
                  </motion.div>
                </div>

                <div className="flex-1 h-full max-w-xl flex items-center justify-center">
                  <div className="w-[400px] h-[520px] relative">
                    <img 
                      src="/images/cover.jpeg"
                      alt={`${books[currentIndex].cim} borító`}
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {books.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[rgb(var(--primary-color))]'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}