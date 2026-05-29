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

export function useFilaments() {
  const [filaments, setFilaments] = useState([])
  useEffect(() => {
    const q = query(collection(db, 'filaments'), orderBy('article_number'))
    const unsub = onSnapshot(q, (snap) => {
      setFilaments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])
  return { filaments }
}

export const addFilament = (data) => addDoc(collection(db, 'filaments'), {
  ...data,
  created_at: new Date().toISOString()
})
export const updateFilament = (id, data) => updateDoc(doc(db, 'filaments', id), data)
export const deleteFilament = (id) => deleteDoc(doc(db, 'filaments', id))

export const deleteOrder = (id) => deleteDoc(doc(db, 'print_orders', id))
