export interface Book {
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
  cover?: string | null
}

export interface CartItem {
  id: number
  title: string
  author: string
  price: number
  cover: string
  quantity: number
}