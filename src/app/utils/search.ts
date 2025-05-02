import type { Book } from '../types/book'

export type SortOrder = 'relevancia' | 'ar-novekvo' | 'ar-csokkeno' | 'abc'

export function sortBooks(books: Book[], order: SortOrder, searchQuery?: string): Book[] {
  const sortedBooks = [...books]

  switch (order) {
    case 'ar-novekvo':
      return sortedBooks.sort((a, b) => a.ar - b.ar)
    
    case 'ar-csokkeno':
      return sortedBooks.sort((a, b) => b.ar - a.ar)
    
    case 'abc':
      return sortedBooks.sort((a, b) => a.cim.localeCompare(b.cim, 'hu'))
    
    case 'relevancia':
    default:
      if (!searchQuery) return sortedBooks

      return sortedBooks.sort((a, b) => {
        // Exact title match gets highest priority
        const aExactTitleMatch = a.cim.toLowerCase() === searchQuery.toLowerCase()
        const bExactTitleMatch = b.cim.toLowerCase() === searchQuery.toLowerCase()
        if (aExactTitleMatch && !bExactTitleMatch) return -1
        if (!aExactTitleMatch && bExactTitleMatch) return 1

        // Partial title match gets second priority
        const aTitleMatch = a.cim.toLowerCase().includes(searchQuery.toLowerCase())
        const bTitleMatch = b.cim.toLowerCase().includes(searchQuery.toLowerCase())
        if (aTitleMatch && !bTitleMatch) return -1
        if (!aTitleMatch && bTitleMatch) return 1

        // Author match gets third priority
        const aAuthorMatch = a.szerzo.toLowerCase().includes(searchQuery.toLowerCase())
        const bAuthorMatch = b.szerzo.toLowerCase().includes(searchQuery.toLowerCase())
        if (aAuthorMatch && !bAuthorMatch) return -1
        if (!aAuthorMatch && bAuthorMatch) return 1

        // Category match gets fourth priority
        const aCategoryMatch = a.kategoria?.toLowerCase().includes(searchQuery.toLowerCase())
        const bCategoryMatch = b.kategoria?.toLowerCase().includes(searchQuery.toLowerCase())
        if (aCategoryMatch && !bCategoryMatch) return -1
        if (!aCategoryMatch && bCategoryMatch) return 1

        return 0
      })
  }
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export function generateSearchIndices(book: Book): {
  cim_lower: string
  szerzo_lower: string
  kategoria_lower?: string
  nyelv_lower?: string
  search_terms: string[]
} {
  const searchTerms = [
    book.cim,
    book.szerzo,
    book.kategoria,
    book.nyelv,
    book.kiado,
    book.isbn
  ].filter((term): term is string => !!term)
    .flatMap(term => term.toLowerCase().split(/\s+/))
    .filter((term, index, array) => array.indexOf(term) === index)

  return {
    cim_lower: book.cim.toLowerCase(),
    szerzo_lower: book.szerzo.toLowerCase(),
    kategoria_lower: book.kategoria?.toLowerCase(),
    nyelv_lower: book.nyelv?.toLowerCase(),
    search_terms: searchTerms
  }
}