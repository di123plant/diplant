'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore'

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

interface BookData {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
  isbn: string;
  publisher?: string;
  publicationYear?: number;
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
      setMessage('') // Clear any previous messages
    }
  }

  const processExcelData = (worksheet: XLSX.WorkSheet): BookData[] => {
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    return jsonData.map((row: any) => ({
      id: row.ISBN?.toString() || generateId(),
      title: row.Title || '',
      author: row.Author || '',
      price: Number(row.Price) || 0,
      category: row.Category || '',
      description: row.Description || '',
      imageUrl: row.ImageUrl || '',
      stock: Number(row.Stock) || 0,
      isbn: row.ISBN?.toString() || ''
    }));
  };

  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const processedData = processExcelData(worksheet);
        
        await uploadBooksToFirebase(processedData);
        alert('Books uploaded successfully!');
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please check the console for details.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const uploadBooksToFirebase = async (books: BookData[]): Promise<void> => {
    const db = getFirestore();
    const batch = writeBatch(db);
    
    books.forEach((book) => {
      const bookRef = doc(collection(db, 'books'), book.id);
      batch.set(bookRef, book);
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error uploading to Firebase:', error);
      throw error;
    }
  };

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
            onChange={handleFileUpload}
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
            onClick={() => document.getElementById('fileInput')?.click()}
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