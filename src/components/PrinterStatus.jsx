import { usePrinters } from '../hooks/useOrders'
import { Countdown } from './Countdown'
import { Printer, CheckCircle } from 'lucide-react'

export default function PrinterStatus({ orders }) {
  const printers = usePrinters()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {printers.map(printer => {
        const active = orders.find(o => o.printer_id === printer.id && o.status === 'printing')
        return (
          <div key={printer.id}
            className={`rounded-xl border p-3 ${active ? 'bg-brand-600/10 border-brand-600/40' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${active ? 'bg-brand-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-white text-xs font-semibold truncate">{printer.name}</span>
            </div>
            {active ? (
              <div>
                <p className="text-slate-300 text-xs truncate mb-1">{active.order_name}</p>
                <Countdown endTime={active.end_time} />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <CheckCircle size={11} />
                Vrij
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
