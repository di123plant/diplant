'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import BookCard from '../components/BookCard'
import { sortBooks, type SortOrder } from '../utils/search'
import type { Book } from '../types/book'

const BOOKS_PER_PAGE = 12

export default function SearchResults(): JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const currentPage = parseInt(searchParams.get('page') || '1')
  const sortOrder = (searchParams.get('sort') as SortOrder) || 'relevancia'
  
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)

  const fetchBooks = useCallback(async () => {
    if (!searchQuery.trim()) {
      setBooks([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const db = getFirestore()
      const booksRef = collection(db, 'konyv')
      
      // Create an array of queries for different fields
      const queryTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0)
      
      // Get documents that match any of the search terms
      const searchQueries = queryTerms.map(term => {
        const termQueries = [
          where('search_terms', 'array-contains', term)
        ]
        return query(booksRef, ...termQueries)
      })

      // Execute all queries in parallel
      const querySnapshots = await Promise.all(
        searchQueries.map(q => getDocs(q))
      )

      // Combine and deduplicate results
      const results = new Map<string, Book>()
      querySnapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          if (!results.has(doc.id)) {
            results.set(doc.id, {
              id: doc.id,
              ...doc.data()
            } as Book)
          }
        })
      })

      // Convert to array and sort
      let sortedBooks = sortBooks(Array.from(results.values()), sortOrder, searchQuery)
      setTotalResults(sortedBooks.length)

      // Paginate results
      const start = (currentPage - 1) * BOOKS_PER_PAGE
      const paginatedBooks = sortedBooks.slice(start, start + BOOKS_PER_PAGE)
      setBooks(paginatedBooks)

    } catch (err) {
      console.error('Error fetching books:', err)
      setError('Hiba történt a keresés során. Kérjük, próbálja újra később.')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, currentPage, sortOrder])

  useEffect(() => {
    void fetchBooks()
  }, [fetchBooks])

  const handleSortChange = (newOrder: SortOrder) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newOrder)
    params.set('page', '1') // Reset to first page when sorting changes
    router.push(`/kereses?${params.toString()}`)
  }

  const totalPages = Math.ceil(totalResults / BOOKS_PER_PAGE)

  const Pagination = () => {
    if (totalPages <= 1) return null

    return (
      <nav 
        className="flex justify-center space-x-2 mt-8"
        role="navigation"
        aria-label="Lapozás"
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          const params = new URLSearchParams(searchParams.toString())
          params.set('page', page.toString())
          
          return (
            <Link
              key={page}
              href={`/kereses?${params.toString()}`}
              className={`px-4 py-2 rounded-md ${
                page === currentPage
                  ? 'bg-[rgb(var(--primary-color))] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`${page}. oldal`}
            >
              {page}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Keresési eredmények
            </h1>
            <p className="text-gray-600">
              &quot;{searchQuery}&quot; kulcsszóra {totalResults} találat
            </p>
          </div>
          {totalResults > 0 && (
            <div className="mt-4 md:mt-0">
              <select
                className="form-select rounded-md border-gray-300 focus:border-[rgb(var(--primary-color))] focus:ring-[rgb(var(--primary-color))]"
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value as SortOrder)}
                aria-label="Rendezés"
              >
                <option value="relevancia">Relevancia szerint</option>
                <option value="ar-novekvo">Ár szerint növekvő</option>
                <option value="ar-csokkeno">Ár szerint csökkenő</option>
                <option value="abc">ABC szerint</option>
              </select>
            </div>
          )}
        </div>

        {error && (
          <div 
            className="bg-red-50 text-red-700 p-4 rounded-md mb-8"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div 
            className="flex justify-center items-center py-12"
            role="status"
            aria-label="Keresés folyamatban"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary-color))]">
              <span className="sr-only">Betöltés...</span>
            </div>
          </div>
        ) : books.length > 0 ? (
          <>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              role="list"
              aria-label="Keresési eredmények"
            >
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.1, 0.3) }}
                  role="listitem"
                >
                  <BookCard book={book} priority={index < 3} />
                </motion.div>
              ))}
            </div>
            <Pagination />
          </>
        ) : (
          <div 
            className="text-center py-12"
            role="status"
            aria-label="Nincs találat"
          >
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Nincs találat a keresési feltételekre.'
                : 'Kérjük, adjon meg egy keresési kifejezést.'}
            </p>
            <Link
              href="/kategoriak"
              className="text-[rgb(var(--primary-color))] hover:text-[rgb(var(--secondary-color))] font-medium transition-colors"
            >
              Vissza a kategóriákhoz
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}