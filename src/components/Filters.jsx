import { MATERIALS, STATUSES } from '../lib/constants'
import { usePrinters } from '../hooks/useOrders'
import { X } from 'lucide-react'

const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
      active ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
    }`}
  >
    {children}
  </button>
)

export default function Filters({ filters, onChange }) {
  const printers = usePrinters()
  const setFilter = (k, v) => onChange({ ...filters, [k]: v })
  const hasFilters = filters.status || filters.material || filters.printer_id || filters.search

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        value={filters.search || ''}
        onChange={e => setFilter('search', e.target.value)}
        placeholder="Zoek op naam of artikelnummer…"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
      />

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Chip active={!filters.status} onClick={() => setFilter('status', '')}>Alle</Chip>
        {Object.entries(STATUSES).map(([k, v]) => (
          <Chip key={k} active={filters.status === k} onClick={() => setFilter('status', k)}>
            {v.label}
          </Chip>
        ))}
      </div>

      {/* Material + Printer */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {printers.map(p => (
          <Chip key={p.id} active={filters.printer_id === p.id} onClick={() => setFilter('printer_id', filters.printer_id === p.id ? '' : p.id)}>
            {p.name}
          </Chip>
        ))}
        {MATERIALS.map(m => (
          <Chip key={m} active={filters.material === m} onClick={() => setFilter('material', filters.material === m ? '' : m)}>
            {m}
          </Chip>
        ))}
      </div>

      {hasFilters && (
        <button onClick={() => onChange({})} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors">
          <X size={12} /> Filters wissen
        </button>
      )}
    </div>
  )
}
