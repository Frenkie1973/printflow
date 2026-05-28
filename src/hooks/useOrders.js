import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('print_orders')
      .select('*, printers(name), profiles(display_name)')
      .order('created_at', { ascending: false })
    if (!error) setOrders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('print_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'print_orders' }, fetchOrders)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchOrders])

  return { orders, loading, refresh: fetchOrders }
}

export function usePrinters() {
  const [printers, setPrinters] = useState([])
  useEffect(() => {
    supabase.from('printers').select('*').order('name').then(({ data }) => setPrinters(data || []))
  }, [])
  return printers
}

export function useArticleLibrary() {
  const [articles, setArticles] = useState([])
  const fetchArticles = useCallback(async () => {
    const { data } = await supabase.from('article_library').select('*').order('article_number')
    setArticles(data || [])
  }, [])
  useEffect(() => { fetchArticles() }, [fetchArticles])
  return { articles, refresh: fetchArticles }
}
