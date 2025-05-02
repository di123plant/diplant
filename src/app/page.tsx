'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import BookSlideshow from './components/BookSlideshow'
import BookCard from './components/BookCard'
import type { Book } from './types/book'

const SECTIONS = {
  TOP: 'top',
  PROMOTIONS: 'promotions',
  BESTSELLERS: 'bestsellers',
  LATEST: 'latest'
} as const

interface SectionLoadingState {
  [SECTIONS.TOP]: boolean
  [SECTIONS.PROMOTIONS]: boolean
  [SECTIONS.BESTSELLERS]: boolean
  [SECTIONS.LATEST]: boolean
}

export default function Home(): React.ReactElement {
  const [books, setBooks] = useState<{
    [SECTIONS.TOP]: Book[]
    [SECTIONS.PROMOTIONS]: Book[]
    [SECTIONS.BESTSELLERS]: Book[]
    [SECTIONS.LATEST]: Book[]
  }>({
    [SECTIONS.TOP]: [],
    [SECTIONS.PROMOTIONS]: [],
    [SECTIONS.BESTSELLERS]: [],
    [SECTIONS.LATEST]: []
  })

  const [loading, setLoading] = useState<SectionLoadingState>({
    [SECTIONS.TOP]: true,
    [SECTIONS.PROMOTIONS]: true,
    [SECTIONS.BESTSELLERS]: true,
    [SECTIONS.LATEST]: true
  })

  const [error, setError] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    const db = getFirestore()
    const booksRef = collection(db, 'konyv')

    try {
      // Fetch latest books
      const latestQuery = query(
        booksRef,
        orderBy('created_at', 'desc'),
        limit(4)
      )
      const latestSnapshot = await getDocs(latestQuery)
      const latestBooks = latestSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[]
      setBooks(prev => ({ ...prev, [SECTIONS.LATEST]: latestBooks }))
      setLoading(prev => ({ ...prev, [SECTIONS.LATEST]: false }))

      // Fetch promotional books
      const promoQuery = query(
        booksRef,
        where('isPromotion', '==', true),
        limit(4)
      )
      const promoSnapshot = await getDocs(promoQuery)
      const promoBooks = promoSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[]
      setBooks(prev => ({ ...prev, [SECTIONS.PROMOTIONS]: promoBooks }))
      setLoading(prev => ({ ...prev, [SECTIONS.PROMOTIONS]: false }))

      // Fetch bestsellers (assuming we have a sales field)
      const bestsellerQuery = query(
        booksRef,
        orderBy('sales', 'desc'),
        limit(5)
      )
      const bestsellerSnapshot = await getDocs(bestsellerQuery)
      const bestsellerBooks = bestsellerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[]
      setBooks(prev => ({ ...prev, [SECTIONS.BESTSELLERS]: bestsellerBooks }))
      setLoading(prev => ({ ...prev, [SECTIONS.BESTSELLERS]: false }))

      // Fetch top rated books (assuming we have a rating field)
      const topQuery = query(
        booksRef,
        orderBy('rating', 'desc'),
        limit(5)
      )
      const topSnapshot = await getDocs(topQuery)
      const topBooks = topSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[]
      setBooks(prev => ({ ...prev, [SECTIONS.TOP]: topBooks }))
      setLoading(prev => ({ ...prev, [SECTIONS.TOP]: false }))

    } catch (err) {
      console.error('Error fetching books:', err)
      setError('Hiba történt a könyvek betöltése közben. Kérjük, próbálja újra később.')
      setLoading({
        [SECTIONS.TOP]: false,
        [SECTIONS.PROMOTIONS]: false,
        [SECTIONS.BESTSELLERS]: false,
        [SECTIONS.LATEST]: false
      })
    }
  }, [])

  useEffect(() => {
    void fetchBooks()
  }, [fetchBooks])

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div 
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]"
        role="status"
      >
        <span className="sr-only">Betöltés...</span>
      </div>
    </div>
  )

  const ErrorMessage = () => error ? (
    <div 
      className="bg-red-50 text-red-700 p-4 rounded-md text-center mx-auto max-w-2xl"
      role="alert"
    >
      {error}
    </div>
  ) : null

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

      <ErrorMessage />

      {/* Top 10 Books Section */}
      <section className="py-16 bg-[rgba(var(--primary-color),0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">Top 10 Nyelvkönyv</h2>
          {loading[SECTIONS.TOP] ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {books[SECTIONS.TOP].map((book, index) => (
                <BookCard key={book.id} book={book} priority={index < 2} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Current Promotions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">Aktuális akcióink</h2>
          {loading[SECTIONS.PROMOTIONS] ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books[SECTIONS.PROMOTIONS].map((book) => (
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
          {loading[SECTIONS.BESTSELLERS] ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {books[SECTIONS.BESTSELLERS].map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Books Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">Legújabb könyveink</h2>
          {loading[SECTIONS.LATEST] ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books[SECTIONS.LATEST].map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
