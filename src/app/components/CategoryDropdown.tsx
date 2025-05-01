'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const categories = [
  { name: 'Irodalom/regény', href: '/kategoriak/irodalom-regeny' },
  { name: 'Könnyített olvasmányok', href: '/kategoriak/konnyitett-olvasmanyok' },
  { name: 'Kiadók', href: '/kategoriak/kiadok' },
  { name: 'Nyelvek', href: '/kategoriak/nyelvek' },
  { name: 'Témakörök', href: '/kategoriak/temakorok' }
]

export default function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <a
        href="/kategoriak"
        className="nav-link flex items-center"
        onMouseEnter={() => setIsOpen(true)}
      >
        Kategóriák
        <svg 
          className={`ml-1 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </a>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50"
            onMouseLeave={() => setIsOpen(false)}
          >
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(var(--primary-color),0.05)] hover:text-[rgb(var(--primary-color))]"
              >
                {category.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}