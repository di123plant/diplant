'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
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

export default function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      try {
        const db = getFirestore()
        const booksRef = collection(db, 'konyv')
        const snapshot = await getDocs(booksRef)
        const allBooks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[]

        // Simple search implementation
        const filteredBooks = allBooks.filter(book => 
          book.cim.toLowerCase().includes(query.toLowerCase()) ||
          book.szerzo.toLowerCase().includes(query.toLowerCase()) ||
          (book.kategoria && book.kategoria.toLowerCase().includes(query.toLowerCase())) ||
          (book.nyelv && book.nyelv.toLowerCase().includes(query.toLowerCase()))
        )
        setBooks(filteredBooks)
      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [query])

  const BookCard = ({ book, index }: { book: Book; index: number }) => {
    const [isAdding, setIsAdding] = useState(false)
    const [quantity, setQuantity] = useState(1)

    const handleAddToCart = (book: Book) => {
      setIsAdding(true)
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: Number(book.id),
          title: book.cim,
          author: book.szerzo,
          price: book.ar,
          cover: undefined
        })
      }
      setQuantity(1) // Reset quantity after adding
      setTimeout(() => setIsAdding(false), 300)
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-[rgba(var(--primary-color),0.1)]"
      >
        <div className="relative">
          <div className="aspect-[3/4] bg-gray-100 rounded-md mb-4">
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Borító
            </div>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900">{book.cim}</h3>
        <p className="mt-1 text-sm text-gray-600">{book.szerzo}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-[rgb(var(--primary-color))] font-semibold">
            {book.ar.toLocaleString('hu-HU')} Ft
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-[rgb(var(--primary-color))] focus:border-[rgb(var(--primary-color))]"
            />
            <button
              onClick={() => handleAddToCart(book)}
              className="px-3 py-1 bg-[rgb(var(--primary-color))] text-white rounded hover:bg-[rgb(var(--secondary-color))] transition-colors text-sm"
            >
              Kosárba
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Keresési eredmények</h1>
        <p className="text-gray-600 mb-8">"{query}" kulcsszóra</p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]"></div>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nincs találat a keresési feltételekre.</p>
            <a href="/kategoriak" className="text-[rgb(var(--primary-color))] hover:text-[rgb(var(--secondary-color))] font-medium">
              Vissza a kategóriákhoz
            </a>
          </div>
        )}
      </div>
    </div>
  )
}