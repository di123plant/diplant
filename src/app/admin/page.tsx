'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, Firestore } from 'firebase/firestore'

type FirebaseError = {
  message: string;
  code: string;
};

interface Book {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  language: string;
  price: number;
}

export default function AdminPage() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!currentUser?.email?.endsWith('@diplant.hu')) {
      router.push('/')
    }
  }, [currentUser, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage('') // Clear any previous messages
    }
  }

  const clearExistingBooks = async (db: Firestore) => {
    try {
      const booksCollection = collection(db, 'konyv')
      const snapshot = await getDocs(booksCollection)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      return true
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      console.error('Hiba a könyvek törlésekor:', firebaseError.message)
      throw new Error('Nem sikerült törölni a meglévő könyveket.')
    }
  }

  const readExcelFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            throw new Error('Nem sikerült beolvasni a fájl tartalmát.')
          }
          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'binary' })
          if (!workbook.SheetNames.length) {
            throw new Error('Az Excel fájl nem tartalmaz munkalapot.')
          }
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          if (!worksheet) {
            throw new Error('A munkalapon nem található adat.')
          }
          resolve(worksheet)
        } catch (error: unknown) {
          const firebaseError = error as FirebaseError;
          reject(firebaseError.message || 'Az Excel fájl feldolgozása sikertelen.')
        }
      }
      reader.onerror = (error: unknown) => {
        const firebaseError = error as FirebaseError;
        console.error('FileReader hiba:', firebaseError.message)
        reject(new Error('A fájl beolvasása sikertelen. Kérjük, ellenőrizze, hogy a fájl nem sérült-e.'))
      }
      reader.readAsBinaryString(file)
    })
  }

  const convertToCSV = (worksheet: XLSX.WorkSheet) => {
    const csvOptions = { header: 1, blankrows: false }
    return XLSX.utils.sheet_to_csv(worksheet, csvOptions)
  }

  const parseCSVToJSON = (csv: string): Book[] => {
    const rows = csv.split('\n').filter(row => row.trim().length > 0)
    if (rows.length < 2) throw new Error('Az Excel fájl üres vagy nem tartalmaz adatsorokat.')

    const expectedHeaders = ['ISBN_szám', 'Cím', 'Szerző', 'Kiadó', 'Téma', 'Nyelv', 'Ár']
    const headers = rows[0].split(',').map(h => h.trim())

    // Validate headers
    for (let i = 0; i < expectedHeaders.length; i++) {
      if (!headers[i] || headers[i].toLowerCase() !== expectedHeaders[i].toLowerCase()) {
        throw new Error(`Hibás oszlopfejléc: ${headers[i] || 'hiányzó oszlop'}. Várt: ${expectedHeaders[i]}`)
      }
    }

    return rows.slice(1).map((row, index) => {
      const fields = row.split(',').map(field => field.trim())
      
      // Ensure we have the correct number of fields
      if (fields.length !== expectedHeaders.length) {
        throw new Error(`Hibás adatszerkezet a(z) ${index + 2}. sorban: ${expectedHeaders.length} oszlop helyett ${fields.length} található`)
      }

      const [isbn, title, author, publisher, category, language, price] = fields
      
      // Validate required fields
      if (!isbn || !title || !author || !publisher || !category || !language || !price) {
        throw new Error(`Hiányzó kötelező mező a(z) ${index + 2}. sorban`)
      }

      // Price validation and conversion
      // Remove any currency symbols and whitespace
      const cleanedPrice = price.replace(/[^0-9,.-]/g, '').replace(',', '.')
      const numericPrice = parseFloat(cleanedPrice)
      
      if (isNaN(numericPrice)) {
        throw new Error(`Érvénytelen ár a(z) ${index + 2}. sorban: "${price}". Az árnak számnak kell lennie.`)
      }

      if (numericPrice < 0) {
        throw new Error(`Érvénytelen ár a(z) ${index + 2}. sorban: "${price}". Az ár nem lehet negatív.`)
      }

      return {
        isbn,
        title,
        author,
        publisher,
        category,
        language,
        price: numericPrice
      }
    })
  }

  const uploadBooks = async (books: Book[], db: Firestore) => {
    try {
      const booksCollection = collection(db, 'konyv')
      const addPromises = books.map(book => 
        addDoc(booksCollection, {
          isbn: book.isbn,
          cim: book.title,
          szerzo: book.author,
          kiado: book.publisher,
          tema: book.category,
          nyelv: book.language,
          ar: book.price,
          created_at: new Date(),
          updated_at: new Date()
        })
      )
      await Promise.all(addPromises)
      return true
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      console.error('Hiba a könyvek feltöltésekor:', firebaseError.message)
      throw new Error('Nem sikerült feltölteni a könyveket.')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsLoading(true)
    setMessage('')

    try {
      // Step 1: Read Excel file
      
      const worksheet = await readExcelFile(file)
      
      // Step 2: Convert to CSV and parse to JSON
      const csvData = convertToCSV(worksheet)
      const jsonData = parseCSVToJSON(csvData)

      // Step 3: Get Firestore instance
      const db = getFirestore()

      // Step 4: Clear existing books
      await clearExistingBooks(db)

      // Step 5: Upload new books
      await uploadBooks(jsonData, db)

      setMessage(`Sikeres művelet: ${jsonData.length} könyv feltöltve`)
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      console.error('Hiba:', firebaseError.message)
      setMessage(firebaseError.message || 'Ismeretlen hiba történt a feltöltés során')
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUser?.email?.endsWith('@diplant.hu')) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Könyvlista feltöltése</h1>
      <p className="mb-4">
        Töltsön fel egy Excel fájlt a könyvek adataival. Az oszlopoknak a következő sorrendben kell lenniük:
      </p>
      <ul className="list-disc pl-5 mb-6">
        <li>ISBN_szám</li>
        <li>Cím</li>
        <li>Szerző</li>
        <li>Kiadó</li>
        <li>Téma</li>
        <li>Nyelv</li>
        <li>Ár</li>
      </ul>
      <p className="mb-4 text-red-600 font-semibold">
        Figyelem: Az új könyvlista feltöltése előtt minden meglévő könyv törlődni fog!
      </p>
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <button
            onClick={() => document.getElementById('fileInput')?.click()}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-300"
            disabled={isLoading}
          >
            {file ? file.name : 'Fájl kiválasztása'}
          </button>
          <button
            onClick={handleUpload}
            className="py-2 px-4 bg-[rgb(var(--primary-color))] text-white rounded-md text-sm font-semibold hover:bg-opacity-90"
            disabled={!file || isLoading}
          >
            {isLoading ? 'Feltöltés folyamatban...' : 'Feltöltés'}
          </button>
        </div>
        {message && (
          <div className={`p-4 rounded-md ${message.includes('Sikeres') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}