import { useState, useMemo } from 'react'
import { useOrders } from '../hooks/useOrders'
import { useAuth } from '../hooks/useAuth'
import OrderCard from '../components/OrderCard'
import OrderForm from '../components/OrderForm'
import PrinterStatusLive from '../components/PrinterStatus'
import { usePrinterStatus } from '../hooks/useOrders'
import Filters from '../components/Filters'
import { Plus, Printer, Activity } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { orders, loading, refresh } = useOrders()
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({})

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (filters.status && o.status !== filters.status) return false
      if (filters.material && o.material !== filters.material) return false
      if (filters.printer_id && o.printer_id !== filters.printer_id) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!o.order_name?.toLowerCase().includes(q) && !o.article_number?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [orders, filters])

  const activeOrders = filtered.filter(o => ['new', 'preparing', 'printing'].includes(o.status))
  const doneOrders = filtered.filter(o => ['done', 'failed', 'cancelled'].includes(o.status))

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Printer status */}
      <section>
        <h2 className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-3 flex items-center gap-2">
          <Activity size={12} />
          Printer overzicht
        </h2>
        <PrinterStatusLive orders={orders} />
      </section>

      {/* Header + filters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-500 text-xs uppercase tracking-widest font-medium">Printorders</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-brand-500/20"
          >
            <Plus size={15} />
            Nieuwe order
          </button>
        </div>
        <Filters filters={filters} onChange={setFilters} />
      </section>

      {/* Orders */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Orders laden…</p>
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <section className="space-y-3">
              {activeOrders.map(order => (
                <OrderCard key={order.id} order={order} onRefresh={refresh} />
              ))}
            </section>
          )}

          {activeOrders.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              <Printer size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm mb-1">Geen actieve printorders</p>
              <p className="text-xs text-slate-700 mb-4">Maak een nieuwe order aan om te beginnen</p>
              <button onClick={() => setShowForm(true)}
                className="text-brand-500 hover:text-brand-400 text-sm font-medium transition-colors">
                + Nieuwe printorder
              </button>
            </div>
          )}

          {doneOrders.length > 0 && (
            <section>
              <h3 className="text-slate-700 text-xs uppercase tracking-widest font-medium mb-3 pt-2 border-t border-slate-900">
                Afgerond / Geannuleerd ({doneOrders.length})
              </h3>
              <div className="space-y-2">
                {doneOrders.slice(0, 20).map(order => (
                  <OrderCard key={order.id} order={order} onRefresh={refresh} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {showForm && <OrderForm onClose={() => setShowForm(false)} onSaved={refresh} />}
    </div>
  )
}
