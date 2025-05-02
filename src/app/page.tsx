'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import BookSlideshow from './components/BookSlideshow'
import { useCart } from './contexts/CartContext'

interface Book {
  id: string;
  cim: string;
  szerzo: string;
  ar: number;
  isbn: string;
  kiado: string;
  kategoria?: string;
  nyelv?: string;
  leiras?: string;
  keszlet?: number;
  isPromotion?: boolean;
  created_at?: { toMillis: () => number };
}

export default function Home() {
  const [latestBooks, setLatestBooks] = useState<Book[]>([])
  const [topBooks, setTopBooks] = useState<Book[]>([])
  const [promotions, setPromotions] = useState<Book[]>([])
  const [bestSellers, setBestSellers] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const db = getFirestore()
        const booksRef = collection(db, 'konyv')

        // Fetch all books first
        const allBooksSnapshot = await getDocs(booksRef)
        const allBooks = allBooksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[]

        // Randomly select books for each section if no specific criteria is available
        const shuffled = [...allBooks].sort(() => 0.5 - Math.random())
        
        // Set top 10 books (randomly for now, can be updated when rating system is implemented)
        setTopBooks(shuffled.slice(0, 10))

        // Set promotional books (books marked with isPromotion flag)
        const promos = allBooks.filter(book => book.isPromotion === true)
        setPromotions(promos.length > 0 ? promos : shuffled.slice(10, 14))

        // Set bestsellers (randomly for now, can be updated when sales tracking is implemented)
        setBestSellers(shuffled.slice(14, 19))

        // Set latest books (using most recently added)
        const sortedByDate = [...allBooks].sort((a, b) => {
          return (b.created_at?.toMillis() || 0) - (a.created_at?.toMillis() || 0)
        })
        setLatestBooks(sortedByDate.slice(0, 4))

      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllBooks()
  }, [])

  const BookCard = ({ book }: { book: Book }) => {
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
          cover: '/images/cover.jpeg'
        })
      }
      setQuantity(1) // Reset quantity after adding
      setTimeout(() => setIsAdding(false), 300)
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        animate={{ scale: isAdding ? 1.02 : 1 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true }}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-[rgba(var(--primary-color),0.1)]"
      >
        <div className="aspect-[3/4] bg-gray-100 rounded-md mb-4">
          <img
            src="/images/cover.jpeg"
            alt={`${book.cim} borító`}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{book.cim}</h3>
        <p className="text-gray-600 text-sm mb-2">{book.szerzo}</p>
        <div className="flex justify-between items-center">
          <p className="text-[rgb(var(--primary-color))] font-semibold">{book.ar.toLocaleString('hu-HU')} Ft</p>
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
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[rgba(var(--primary-color),0.05)] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Nyelvkönyvek széles választéka</span>
              <span className="block text-[rgb(var(--primary-color))]">egy helyen</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Fedezze fel nyelvkönyv kínálatunkat és találja meg a tökéletes tananyagot nyelvtanulási céljaihoz.
            </p>
          </div>
        </div>
      </section>

      {/* Book Slideshow */}
      <BookSlideshow />

      {/* Top 10 Books Section */}
      <section className="py-16 bg-[rgba(var(--primary-color),0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">Top 10 Nyelvkönyv</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {topBooks.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Current Promotions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">Aktuális akcióink</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotions.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bestseller List */}
      <section className="py-16 bg-[rgba(var(--primary-color),0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">Sikerlista</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {bestSellers.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Books Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">Legújabb könyveink</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {latestBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
