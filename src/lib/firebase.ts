import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

export const firebaseConfig = {
  apiKey: 'AIzaSyBDcOCQ0OrAaxr-yhhD5iVHqegwvhpjZaE',
  authDomain: 'listacompra-6d0b3.firebaseapp.com',
  databaseURL: 'https://listacompra-6d0b3-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'listacompra-6d0b3',
  storageBucket: 'listacompra-6d0b3.firebasestorage.app',
  messagingSenderId: '175496423309',
  appId: '1:175496423309:web:509b2eb64961245536bfc4',
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const database = getDatabase(firebaseApp)
