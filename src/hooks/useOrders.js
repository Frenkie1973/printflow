import { useEffect, useState, useCallback } from 'react'
import { 
  collection, query, orderBy, onSnapshot, 
  getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'print_orders'), orderBy('created_at', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  return { orders, loading }
}

export function usePrinters() {
  const [printers, setPrinters] = useState([])
  useEffect(() => {
    const q = query(collection(db, 'printers'), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setPrinters(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])
  return printers
}

export function useArticleLibrary() {
  const [articles, setArticles] = useState([])
  useEffect(() => {
    const q = query(collection(db, 'article_library'), orderBy('article_number'))
    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])
  return { articles }
}

// Helper functions
export const addOrder = (data) => addDoc(collection(db, 'print_orders'), {
  ...data, 
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})

export const updateOrder = (id, data) => updateDoc(doc(db, 'print_orders', id), {
  ...data,
  updated_at: new Date().toISOString()
})

export const upsertArticle = (articleNumber, data) => 
  setDoc(doc(db, 'article_library', articleNumber), data, { merge: true })

export const addPrinter = (data) => addDoc(collection(db, 'printers'), data)
export const updatePrinter = (id, data) => updateDoc(doc(db, 'printers', id), data)
export const deleteArticle = (id) => deleteDoc(doc(db, 'article_library', id))
