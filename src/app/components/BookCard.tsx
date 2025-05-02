'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '../contexts/CartContext'
import type { Book, CartItem } from '../types/book'

interface BookCardProps {
  book: Book
  priority?: boolean
}

export default function BookCard({ book, priority = false }: BookCardProps): JSX.Element {
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    setIsAdding(true)
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: Number(book.id),
      title: book.cim,
      author: book.szerzo,
      price: book.ar,
      cover: book.cover || null
    }
    addItem(cartItem)
    setQuantity(1)
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
      <div className="relative aspect-[3/4] bg-gray-100 rounded-md mb-4">
        <Image
          src={book.cover ?? '/images/cover.jpeg'}
          alt={`${book.cim} borító`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-md"
          priority={priority}
        />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2" title={book.cim}>
        {book.cim}
      </h3>
      <p className="text-gray-600 text-sm mb-2 line-clamp-1" title={book.szerzo}>
        {book.szerzo}
      </p>
      <div className="flex justify-between items-center">
        <p className="text-[rgb(var(--primary-color))] font-semibold">
          {book.ar.toLocaleString('hu-HU')} Ft
        </p>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
            className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-[rgb(var(--primary-color))] focus:border-[rgb(var(--primary-color))]"
            aria-label="Mennyiség"
          />
          <button
            onClick={handleAddToCart}
            className="px-3 py-1 bg-[rgb(var(--primary-color))] text-white rounded hover:bg-[rgb(var(--secondary-color))] transition-colors text-sm"
            aria-label={`${book.cim} kosárba helyezése`}
          >
            Kosárba
          </button>
        </div>
      </div>
    </motion.div>
  )
}