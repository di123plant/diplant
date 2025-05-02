'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  className?: string
  placeholder?: string
}

export default function SearchBar({ 
  className = 'w-64',
  placeholder = 'Keresés...'
}: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      router.push(`/kereses?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }, [query, router])

  return (
    <form 
      onSubmit={handleSubmit} 
      className={className}
      role="search"
    >
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-color))] focus:border-transparent"
          aria-label="Search books"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[rgb(var(--primary-color))] transition-colors"
          aria-label="Submit search"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </button>
      </div>
    </form>
  )
}