import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePrinters, useOrders } from '../hooks/useOrders'
import StatusBadge from './StatusBadge'
import { Countdown, EndTime } from './Countdown'
import OrderForm from './OrderForm'
import { differenceInDays, format, isPast, isToday, isTomorrow } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  Play, Pause, CheckCircle, XCircle, Copy, Ban, ChevronDown, ChevronUp,
  Printer, Clock, Calendar, Package, Palette, User, Hash
} from 'lucide-react'

function deadlineColor(deadline) {
  if (!deadline) return 'text-slate-500'
  const d = new Date(deadline)
  if (isPast(d) && !isToday(d)) return 'text-red-400'
  if (isToday(d) || isTomorrow(d)) return 'text-amber-400'
  return 'text-emerald-400'
}

function deadlineLabel(deadline) {
  if (!deadline) return null
  const d = new Date(deadline)
  if (isPast(d) && !isToday(d)) return `⚠ Te laat (${format(d, 'd MMM', { locale: nl })})`
  if (isToday(d)) return '⚡ Vandaag'
  if (isTomorrow(d)) return '⏰ Morgen'
  const days = differenceInDays(d, new Date())
  return `${format(d, 'd MMM', { locale: nl })} (${days}d)`
}

export default function OrderCard({ order, onRefresh }) {
  const { user } = useAuth()
  const printers = usePrinters()
  const { orders: allOrders } = useOrders()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busyWarning, setBusyWarning] = useState('')

  const printer = printers.find(p => p.id === order.printer_id)

  const updateStatus = async (status, extra = {}) => {
    setLoading(true)
    setBusyWarning('')
    const update = { status, ...extra }
    if (status === 'printing') {
      // Check if printer is already busy
      if (order.printer_id) {
        const busy = allOrders.find(
          o => o.printer_id === order.printer_id && o.status === 'printing' && o.id !== order.id
        )
        if (busy) {
          setBusyWarning(`⚠ ${printer?.name || 'Printer'} is al bezig met: "${busy.order_name}"`)
          setLoading(false)
          return
        }
      }
      const totalSecs = (order.print_hours * 3600) + (order.print_minutes * 60)
      const endTime = new Date(Date.now() + totalSecs * 1000).toISOString()
      update.started_at = new Date().toISOString()
      update.started_by = user.id
      update.end_time = endTime
    }
    await supabase.from('print_orders').update(update).eq('id', order.id)
    onRefresh?.()
    setLoading(false)
  }

  const duplicate = async () => {
    const { id, created_at, started_at, started_by, end_time, status, ...rest } = order
    await supabase.from('print_orders').insert({ ...rest, status: 'new', created_by: user.id })
    onRefresh?.()
  }

  const isPrinting = order.status === 'printing'
  const isActive = ['new', 'preparing', 'printing'].includes(order.status)

  // Deadline urgency for card border
  let borderClass = 'border-slate-800'
  if (order.deadline) {
    const d = new Date(order.deadline)
    if (isPast(d) && !isToday(d) && isActive) borderClass = 'border-red-800'
    else if ((isToday(d) || isTomorrow(d)) && isActive) borderClass = 'border-amber-700'
  }
  if (isPrinting) borderClass = 'border-brand-600'

  return (
    <>
      {editing && <OrderForm order={order} onClose={() => setEditing(false)} onSaved={onRefresh} />}

      <div className={`bg-slate-900 border ${borderClass} rounded-xl overflow-hidden transition-all`}>
        {/* Card header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={order.status} />
                {order.article_number && (
                  <span className="text-slate-500 text-xs font-mono">{order.article_number}</span>
                )}
              </div>
              <h3 className="text-white font-semibold text-sm leading-snug truncate">{order.order_name}</h3>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Key info row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
            {printer && (
              <span className="flex items-center gap-1">
                <Printer size={11} />
                {printer.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package size={11} />
              {order.quantity}× {order.material}
            </span>
            <span className="flex items-center gap-1">
              <Palette size={11} />
              {order.color}
            </span>
            {order.deadline && (
              <span className={`flex items-center gap-1 ${deadlineColor(order.deadline)}`}>
                <Calendar size={11} />
                {deadlineLabel(order.deadline)}
              </span>
            )}
          </div>

          {/* Timer (active prints) */}
          {isPrinting && order.end_time && (
            <div className="mt-3 bg-slate-800 rounded-lg px-3 py-2 flex items-center justify-between">
              <div>
                <Countdown endTime={order.end_time} />
                <div><EndTime endTime={order.end_time} /></div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-xs">
                  {order.print_hours}u {order.print_minutes}m totaal
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="px-4 pb-3 border-t border-slate-800 pt-3 space-y-2">
            {order.notes && (
              <p className="text-slate-400 text-xs bg-slate-800 rounded-lg px-3 py-2">{order.notes}</p>
            )}
            {order.profiles?.display_name && (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <User size={11} />
                Aangemaakt door {order.profiles.display_name}
              </div>
            )}
            {order.started_at && (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Clock size={11} />
                Gestart om {format(new Date(order.started_at), 'HH:mm d MMM', { locale: nl })}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {isActive && (
          <div className="px-4 pb-4 flex flex-col gap-2">
            {busyWarning && (
              <div className="text-amber-400 text-xs bg-amber-900/20 border border-amber-800/50 rounded-lg px-3 py-2">
                {busyWarning}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {order.status === 'new' && (
                <button onClick={() => updateStatus('preparing')} disabled={loading}
                  className="btn-secondary text-xs">
                  → Voorbereiden
                </button>
              )}
              {order.status === 'preparing' && (
              <button onClick={() => updateStatus('printing')} disabled={loading}
                className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                <Play size={12} />
                Print starten
              </button>
            )}
            {isPrinting && (
              <button onClick={() => updateStatus('done')} disabled={loading}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                <CheckCircle size={12} />
                Klaar melden
              </button>
            )}
            {isPrinting && (
              <button onClick={() => updateStatus('failed')} disabled={loading}
                className="flex items-center gap-1.5 bg-red-900 hover:bg-red-800 text-red-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                <XCircle size={12} />
                Mislukt
              </button>
            )}
            <button onClick={() => setEditing(true)}
              className="btn-secondary text-xs ml-auto">
              Bewerken
            </button>
            <button onClick={duplicate}
              className="btn-secondary text-xs">
              <Copy size={11} />
            </button>
            <button onClick={() => updateStatus('cancelled')} disabled={loading}
              className="text-slate-600 hover:text-red-400 transition-colors">
              <Ban size={14} />
            </button>
            </div>
          </div>
        )}

        {!isActive && (
          <div className="px-4 pb-4 flex gap-2">
            <button onClick={duplicate}
              className="btn-secondary text-xs flex items-center gap-1.5">
              <Copy size={11} />
              Dupliceren
            </button>
          </div>
        )}
      </div>
    </>
  )
}
