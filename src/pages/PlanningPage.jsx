import { useMemo } from 'react'
import { useOrders } from '../hooks/useOrders'
import { usePrinters } from '../hooks/useOrders'
import { usePrinterStatus } from '../hooks/useOrders'
import { format, addHours, startOfDay, differenceInMinutes, addMinutes } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Clock, AlertTriangle } from 'lucide-react'

const STATUS_COLORS = {
  printing: 'bg-[#FF2300] border-[#FF2300]',
  preparing: 'bg-amber-600 border-amber-500',
  new: 'bg-slate-600 border-slate-500',
}

function formatDuur(h, m) {
  const totM = (h || 0) * 60 + (m || 0)
  if (totM < 60) return `${totM}m`
  return `${Math.floor(totM/60)}u${totM%60 > 0 ? ' ' + totM%60 + 'm' : ''}`
}

export default function PlanningPage() {
  const { orders } = useOrders()
  const printers = usePrinters()
  const printerStatus = usePrinterStatus()

  // Alleen actieve orders (niet klaar/mislukt/geannuleerd)
  const activeOrders = orders.filter(o => ['new','preparing','printing'].includes(o.status))

  // Orders zonder printer
  const unplanned = activeOrders.filter(o => !o.printer_id)

  // Per printer de orders sorteren op deadline
  const printerPlanning = useMemo(() => {
    return printers.map(printer => {
      const printerOrders = activeOrders
        .filter(o => o.printer_id === printer.id)
        .sort((a, b) => {
          if (a.status === 'printing') return -1
          if (b.status === 'printing') return 1
          if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline)
          if (a.deadline) return -1
          if (b.deadline) return 1
          return 0
        })

      // Bereken starttijden op basis van volgorde en geschatte printtijd
      let cursor = new Date()
      const liveStatus = printerStatus.find(p => p.name === printer.name)

      const withTimes = printerOrders.map((order, idx) => {
        const duurMin = (order.print_hours || 0) * 60 + (order.print_minutes || 0)
        let start, end

        if (order.status === 'printing') {
          start = order.started_at ? new Date(order.started_at) : new Date()
          // Gebruik echte resterende tijd van printer als beschikbaar
          const remaining = liveStatus?.time_remaining
          end = remaining > 0
            ? new Date(Date.now() + remaining * 1000)
            : new Date(Date.now() + duurMin * 60 * 1000)
          cursor = end
        } else {
          start = new Date(cursor)
          end = addMinutes(start, duurMin)
          cursor = end
        }

        return { ...order, _start: start, _end: end, _duurMin: duurMin }
      })

      return { printer, orders: withTimes, liveStatus }
    })
  }, [printers, activeOrders, printerStatus])

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Planning</h1>
        <span className="text-slate-500 text-sm">{format(new Date(), 'EEEE d MMMM', { locale: nl })}</span>
      </div>

      {/* Per printer */}
      <div className="space-y-4">
        {printerPlanning.map(({ printer, orders: pOrders, liveStatus }) => (
          <div key={printer.id} className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
            {/* Printer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  liveStatus?.state === 'PRINTING' ? 'bg-[#FF2300] animate-pulse' :
                  liveStatus?.online ? 'bg-emerald-400' : 'bg-slate-600'
                }`} />
                <span className="font-semibold text-sm">{printer.name}</span>
                {liveStatus?.state === 'PRINTING' && (
                  <span className="text-xs text-[#FF2300]">
                    {Math.round(liveStatus.progress || 0)}% — klaar om {new Date(Date.now() + liveStatus.time_remaining * 1000).toLocaleTimeString('nl-NL', {hour:'2-digit',minute:'2-digit'})}
                  </span>
                )}
              </div>
              <span className="text-slate-500 text-xs">{pOrders.length} order{pOrders.length !== 1 ? 's' : ''}</span>
            </div>

            {pOrders.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-600 text-sm">Geen orders gepland</div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {pOrders.map((order, idx) => {
                  const isPrinting = order.status === 'printing'
                  const isLate = order.deadline && new Date(order.deadline) < order._end
                  return (
                    <div key={order.id} className={`px-4 py-3 flex items-center gap-3 ${isPrinting ? 'bg-[#FF2300]/5' : ''}`}>
                      {/* Volgorde */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isPrinting ? 'bg-[#FF2300] text-white' : 'bg-zinc-800 text-slate-400'
                      }`}>
                        {isPrinting ? '▶' : idx + 1}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium truncate">{order.order_name}</span>
                          {order.article_number && (
                            <span className="text-slate-500 text-xs">{order.article_number}</span>
                          )}
                          {isLate && <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatDuur(order.print_hours, order.print_minutes)}
                          </span>
                          <span>
                            {format(order._start, 'HH:mm', { locale: nl })} → {format(order._end, 'HH:mm', { locale: nl })}
                            {order._end.getDate() !== new Date().getDate() && (
                              <span className="ml-1 text-slate-600">({format(order._end, 'EEE d MMM', { locale: nl })})</span>
                            )}
                          </span>
                          {order.deadline && (
                            <span className={isLate ? 'text-red-400' : 'text-emerald-400'}>
                              deadline {format(new Date(order.deadline), 'd MMM', { locale: nl })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Materiaal */}
                      <div className="text-xs text-slate-500 text-right flex-shrink-0">
                        {order.material && <div>{order.material}</div>}
                        {order.color && <div className="text-slate-600">{order.color}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Niet ingepland */}
      {unplanned.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-900">
            <span className="font-semibold text-sm text-amber-400">Nog in te plannen ({unplanned.length})</span>
          </div>
          <div className="divide-y divide-zinc-900">
            {unplanned.map(order => (
              <div key={order.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-900/50 border border-amber-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 text-xs">?</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{order.order_name}</div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />{formatDuur(order.print_hours, order.print_minutes)}
                    </span>
                    {order.deadline && (
                      <span className={new Date(order.deadline) < new Date() ? 'text-red-400' : 'text-amber-400'}>
                        deadline {format(new Date(order.deadline), 'd MMM', { locale: nl })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500">{order.material}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
