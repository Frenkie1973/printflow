import { useState } from 'react'
import { useOrders, usePrinters, usePrinterStatus } from '../hooks/useOrders'
import { useAuth } from '../hooks/useAuth'
import OrderForm from '../components/OrderForm'
import { Thermometer, Clock, Wifi, WifiOff, Plus, Search, AlertTriangle } from 'lucide-react'
import { isPast, isToday, isTomorrow, format, differenceInDays } from 'date-fns'
import { nl } from 'date-fns/locale'
import { updateOrder } from '../hooks/useOrders'

const STATE_LABELS = {
  PRINTING: 'Aan het printen', IDLE: 'Vrij', FINISHED: 'Klaar',
  ERROR: 'Fout', ATTENTION: 'Aandacht vereist', OFFLINE: 'Offline',
  PAUSED: 'Gepauzeerd', READY: 'Klaar voor gebruik', UNKNOWN: 'Onbekend',
}

function formatTime(s) {
  if (!s || s <= 0) return null
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}u ${m}m` : `${m}m`
}

function deadlineLabel(deadline) {
  if (!deadline) return null
  const d = new Date(deadline)
  if (isPast(d) && !isToday(d)) return { text: 'Te laat', color: 'text-red-400' }
  if (isToday(d)) return { text: 'Vandaag', color: 'text-amber-400' }
  if (isTomorrow(d)) return { text: 'Morgen', color: 'text-amber-400' }
  return { text: format(d, 'd MMM', { locale: nl }), color: 'text-emerald-400' }
}

function PrinterBlock({ printer, liveStatus, orders, onNewOrder, onFailed }) {
  const state = liveStatus?.state || 'OFFLINE'
  const online = liveStatus?.online !== false && liveStatus !== undefined
  const printing = state === 'PRINTING'
  const activeOrder = orders.find(o => o.status === 'printing')
  const queueOrders = orders.filter(o => o.status !== 'printing' && ['new','preparing'].includes(o.status))

  return (
    <div className={`bg-zinc-950 border rounded-xl overflow-hidden ${
      printing ? 'border-[#FF2300]/40' : !online ? 'border-zinc-900 opacity-70' : 'border-zinc-900'
    }`}>
      {/* Printer header met live status */}
      <div className={`px-4 py-3 flex items-center justify-between ${printing ? 'bg-[#FF2300]/5' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            printing ? 'bg-[#FF2300] animate-pulse' :
            ['IDLE','READY','FINISHED'].includes(state) ? 'bg-emerald-400' :
            state === 'OFFLINE' ? 'bg-slate-700' : 'bg-amber-400'
          }`} />
          <span className="text-white font-bold text-base">{printer.name}</span>
          {online ? <Wifi size={11} className="text-slate-700" /> : <WifiOff size={11} className="text-slate-700" />}
        </div>
        <span className={`text-xs font-medium ${
          printing ? 'text-[#FF2300]' :
          ['IDLE','READY','FINISHED'].includes(state) ? 'text-emerald-400' :
          'text-slate-400'
        } text-sm font-medium`}>{STATE_LABELS[state] || state}</span>
      </div>

      {/* Live print voortgang */}
      {printing && liveStatus && (
        <div className="px-4 pb-3 space-y-2 border-b border-zinc-900">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 text-sm truncate max-w-[70%]">
                {liveStatus.filename?.replace(/\.bgcode$|\.gcode$/i, '')}
              </span>
              <span className="text-white text-xs font-mono font-bold">{Math.round(liveStatus.progress || 0)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{width:`${liveStatus.progress||0}%`,backgroundColor:'#FF2300'}} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={10} />{formatTime(liveStatus.time_remaining)} resterend
            </span>
            {liveStatus.time_remaining > 0 && (
              <span className="text-slate-400 font-medium">
                <span className="text-sm font-medium">klaar om {new Date(Date.now() + liveStatus.time_remaining * 1000).toLocaleTimeString('nl-NL', {hour:'2-digit',minute:'2-digit'})}</span>
              </span>
            )}
          </div>
          {(liveStatus.temp_nozzle > 0 || liveStatus.temp_bed > 0) && (
            <div className="flex gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Thermometer size={10} className="text-red-400" />{Math.round(liveStatus.temp_nozzle)}°C</span>
              <span className="flex items-center gap-1"><Thermometer size={10} className="text-amber-400" />{Math.round(liveStatus.temp_bed)}°C bed</span>
            </div>
          )}
        </div>
      )}

      {/* Actieve order */}
      {activeOrder && (
        <div className="px-4 py-3 border-b border-zinc-900">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {activeOrder.article_number && (
                  <span className="text-slate-400 text-xs">{activeOrder.article_number}</span>
                )}
                {(() => { const dl = deadlineLabel(activeOrder.deadline); return dl ? <span className={`text-xs ${dl.color}`}>{dl.text}</span> : null })()}
              </div>
              <div className="text-white font-bold text-base mt-0.5">{activeOrder.order_name}</div>
              <div className="flex gap-3 mt-1 text-sm text-slate-400 flex-wrap">
                {activeOrder.quantity && <span>{activeOrder.quantity}× {activeOrder.material}</span>}
                {activeOrder.color && <span>{activeOrder.color}</span>}
              </div>
            </div>
            <button onClick={() => onFailed(activeOrder.id)}
              className="flex-shrink-0 flex items-center gap-1 text-sm text-red-400 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors">
              Mislukt
            </button>
          </div>
        </div>
      )}

      {/* Wachtrij */}
      {queueOrders.length > 0 && (
        <div className="divide-y divide-zinc-900">
          {queueOrders.slice(0, 3).map((order, idx) => {
            const dl = deadlineLabel(order.deadline)
            return (
              <div key={order.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-slate-500 text-xs w-4">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 text-sm font-medium truncate">{order.order_name}</span>
                    {dl && <span className={`text-xs ${dl.color} flex-shrink-0`}>{dl.text}</span>}
                  </div>
                  <div className="text-slate-400 text-sm">{order.quantity}× {order.material} {order.color && `— ${order.color}`}</div>
                </div>
                <span className="text-slate-400 text-sm flex-shrink-0">{order.print_hours}u{order.print_minutes > 0 ? order.print_minutes + 'm' : ''}</span>
              </div>
            )
          })}
          {queueOrders.length > 3 && (
            <div className="px-4 py-2 text-slate-500 text-xs">+{queueOrders.length - 3} meer in wachtrij</div>
          )}
        </div>
      )}

      {/* Leeg */}
      {!activeOrder && queueOrders.length === 0 && online && (
        <div className="px-4 py-3 text-slate-700 text-xs">Geen orders gepland</div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { orders } = useOrders()
  const printers = usePrinters()
  const printerStatus = usePrinterStatus()
  const [showForm, setShowForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleFailed = async (orderId) => {
    await updateOrder(orderId, { status: 'failed' })
  }

  // Orders per printer
  const ordersPerPrinter = (printerId) =>
    orders.filter(o => o.printer_id === printerId && ['new','preparing','printing'].includes(o.status))
      .sort((a, b) => {
        if (a.status === 'printing') return -1
        if (b.status === 'printing') return 1
        if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline)
        return 0
      })

  // Orders zonder printer
  const unplanned = orders.filter(o => !o.printer_id && ['new','preparing'].includes(o.status))

  // Gefilterde orders voor het overzicht onderaan
  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return o.order_name?.toLowerCase().includes(s) || o.article_number?.toLowerCase().includes(s)
    }
    return true
  })

  const STATUS_FILTERS = [
    { key: 'all', label: 'Alle' },
    { key: 'new', label: 'Nieuw' },
    { key: 'preparing', label: 'Voorbereiden' },
    { key: 'printing', label: 'Aan het printen' },
    { key: 'done', label: 'Klaar' },
    { key: 'failed', label: 'Mislukt' },
    { key: 'cancelled', label: 'Geannuleerd' },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

        {/* Printer blokken */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
            <span className="text-[#FF2300]">↯</span> Printer overzicht
          </p>
          <div className="grid grid-cols-1 gap-3">
            {printers.map(printer => (
              <PrinterBlock
                key={printer.id}
                printer={printer}
                liveStatus={printerStatus.find(p => p.name === printer.name)}
                orders={ordersPerPrinter(printer.id)}
                onFailed={handleFailed}
              />
            ))}
          </div>

          {/* Niet ingepland */}
          {unplanned.length > 0 && (
            <div className="mt-3 bg-zinc-950 border border-amber-900/40 rounded-xl p-3">
              <p className="text-amber-400 text-xs font-medium mb-2 flex items-center gap-1.5">
                <AlertTriangle size={12} /> {unplanned.length} order{unplanned.length > 1 ? 's' : ''} nog in te plannen
              </p>
              <div className="space-y-1">
                {unplanned.map(o => {
                  const dl = deadlineLabel(o.deadline)
                  return (
                    <div key={o.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{o.order_name}</span>
                      {dl && <span className={dl.color}>{dl.text}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Printorders overzicht */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Printorders</p>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{backgroundColor:'#FF2300'}}>
              <Plus size={14} /> Nieuwe order
            </button>
          </div>

          {/* Zoek + filter */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Zoek op naam of artikelnummer..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    statusFilter === f.key ? 'text-white font-medium' : 'text-slate-400 bg-slate-900 hover:text-white'
                  }`}
                  style={statusFilter === f.key ? {backgroundColor:'#FF2300'} : {}}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders lijst */}
          <div className="space-y-2">
            {filteredOrders.length === 0 && (
              <div className="text-center py-10 text-slate-500">Geen orders gevonden</div>
            )}
            {filteredOrders.map(order => {
              const dl = deadlineLabel(order.deadline)
              const printer = printers.find(p => p.id === order.printer_id)
              const STATUS_COLORS = {
                new: 'bg-slate-700 text-slate-200',
                preparing: 'bg-amber-900 text-amber-200',
                printing: 'text-white',
                done: 'bg-emerald-900 text-emerald-200',
                failed: 'bg-red-900 text-red-200',
                cancelled: 'bg-slate-800 text-slate-400',
              }
              const STATUS_NL = { new:'Nieuw', preparing:'Voorbereiden', printing:'Aan het printen', done:'Klaar', failed:'Mislukt', cancelled:'Geannuleerd' }
              return (
                <div key={order.id} className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || ''}`}
                        style={order.status === 'printing' ? {backgroundColor:'#FF2300'} : {}}>
                        {STATUS_NL[order.status] || order.status}
                      </span>
                      {order.article_number && <span className="text-slate-400 text-xs">{order.article_number}</span>}
                      {dl && <span className={`text-xs ${dl.color}`}>{dl.text}</span>}
                    </div>
                    <div className="text-white font-semibold text-base mt-0.5 truncate">{order.order_name}</div>
                    <div className="flex gap-3 mt-0.5 text-sm text-slate-400 flex-wrap">
                      {printer && <span>{printer.name}</span>}
                      {order.quantity && <span>{order.quantity}× {order.material}</span>}
                      {order.color && <span>{order.color}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {order.status === 'printing' && (
                      <button onClick={() => handleFailed(order.id)}
                        className="text-sm text-red-400 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-900/20">
                        Mislukt
                      </button>
                    )}
                    <button onClick={() => setEditingOrder(order)}
                      className="text-sm text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg hover:text-white hover:border-slate-500">
                      Bewerken
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {showForm && <OrderForm onClose={() => setShowForm(false)} />}
      {editingOrder && <OrderForm order={editingOrder} onClose={() => setEditingOrder(null)} />}
    </div>
  )
}
