import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { 
  getFirestore, 
  enableIndexedDbPersistence, 
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore'
import { env } from './env'

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase with improved error handling and configuration
function initializeFirebase() {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    
    // Initialize Firestore with enhanced cache settings
    const db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    })

    const auth = getAuth(app)

    // Connect to emulators in development
    if (env.NODE_ENV === 'development') {
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectFirestoreEmulator(db, 'localhost', 8080)
    }

    // Enable Firestore offline persistence with better error handling
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db, {
        synchronizeTabs: true
      }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support persistence.')
        } else {
          console.error('Failed to enable persistence:', err)
        }
      })
    }

    return { app, auth, db }
  } catch (error) {
    console.error('Error initializing Firebase:', error)
    throw new Error('Failed to initialize Firebase. Please check your configuration.')
  }
}

const { app, auth, db } = initializeFirebase()

export { app, auth, db }