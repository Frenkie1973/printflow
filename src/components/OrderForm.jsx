import { useState, useEffect } from 'react'
import { addOrder, updateOrder, upsertArticle, usePrinters, useArticleLibrary, useFilaments } from '../hooks/useOrders'
import { useAuth } from '../hooks/useAuth'
import { COLORS } from '../lib/constants'
import { X, ChevronDown } from 'lucide-react'

const Field = ({ label, children }) => (
  <div>
    <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wide font-medium">{label}</label>
    {children}
  </div>
)
const Input = ({ className = '', ...props }) => (
  <input className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none text-sm ${className}`} {...props} />
)
const Select = ({ children, ...props }) => (
  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none text-sm" {...props}>{children}</select>
)

function MaterialMultiSelect({ selected, onChange, filaments }) {
  const [open, setOpen] = useState(false)
  // Unieke materiaal+kleur combinaties uit filament catalogus
  const options = filaments.map(f => ({ id: f.id, label: `${f.material} – ${f.color}`, material: f.material, color: f.color, article_number: f.article_number }))
  // Als geen filaments: fallback op handmatige invoer tonen
  const toggle = (opt) => {
    const exists = selected.find(s => s.article_number === opt.article_number)
    if (exists) onChange(selected.filter(s => s.article_number !== opt.article_number))
    else onChange([...selected, opt])
  }
  const label = selected.length === 0 ? 'Selecteer materiaal…' : selected.map(s => `${s.material} ${s.color}`).join(', ')
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-left text-sm flex items-center justify-between"
        style={{color: selected.length ? 'white' : '#6b7280'}}>
        <span className="truncate">{label}</span>
        <ChevronDown size={14} className="text-slate-500 flex-shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg z-20 shadow-xl max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-3 text-slate-500 text-xs">Voeg eerst materialen toe via de Materialen pagina</div>
          ) : (
            options.map(opt => {
              const active = !!selected.find(s => s.article_number === opt.article_number)
              return (
                <button key={opt.id} type="button" onClick={() => toggle(opt)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-700 flex items-center gap-2.5 transition-colors">
                  <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${active ? 'border-transparent' : 'border-slate-600'}`}
                    style={active ? {backgroundColor: '#FF2300'} : {}}>
                    {active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                  <div>
                    <div className="text-white text-sm">{opt.material} – {opt.color}</div>
                    <div className="text-slate-500 text-xs font-mono">{opt.article_number}</div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function OrderForm({ order, onClose }) {
  const { user } = useAuth()
  const printers = usePrinters()
  const { articles } = useArticleLibrary()
  const { filaments } = useFilaments()
  const [form, setForm] = useState({
    order_name: '', article_number: '', quantity: 1,
    materials: [], color: 'Zwart', printer_id: '',
    deadline: '', print_hours: 0, print_minutes: 30, notes: '',
    ...(order ? { ...order, materials: order.materials || (order.material ? [{ material: order.material, color: order.color, article_number: '' }] : []) } : {})
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (form.article_number.length >= 2) {
      setSuggestions(articles.filter(a => a.article_number.toLowerCase().includes(form.article_number.toLowerCase())))
    } else setSuggestions([])
  }, [form.article_number, articles])

  const applyArticle = (a) => {
    setForm(f => ({ ...f, article_number: a.article_number, order_name: a.description || f.order_name,
      print_hours: a.default_print_hours || f.print_hours, print_minutes: a.default_print_minutes || f.print_minutes, notes: a.notes || f.notes }))
    setSuggestions([])
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        order_name: form.order_name, article_number: form.article_number,
        quantity: Number(form.quantity),
        materials: form.materials,
        material: form.materials.map(m => m.material).join(', ') || '',
        color: form.materials.map(m => m.color).join(', ') || '',
        printer_id: form.printer_id || null, deadline: form.deadline || null,
        print_hours: Number(form.print_hours), print_minutes: Number(form.print_minutes),
        notes: form.notes, created_by_email: user.email,
      }
      if (order?.id) await updateOrder(order.id, payload)
      else await addOrder({ ...payload, status: 'new' })
      if (form.article_number) {
        await upsertArticle(form.article_number, {
          article_number: form.article_number, description: form.order_name,
          materials: form.materials,
          default_print_hours: Number(form.print_hours), default_print_minutes: Number(form.print_minutes),
          notes: form.notes,
        })
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-white font-semibold">{order?.id ? 'Order bewerken' : 'Nieuwe printorder'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Artikelnummer">
            <div className="relative">
              <Input value={form.article_number} onChange={e => set('article_number', e.target.value)} placeholder="bv. PRT-001" />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden z-20 shadow-xl">
                  {suggestions.map(a => (
                    <button key={a.id} type="button" onClick={() => applyArticle(a)} className="w-full text-left px-3 py-2.5 hover:bg-slate-700 transition-colors">
                      <div className="text-white text-sm font-medium">{a.article_number}</div>
                      <div className="text-slate-400 text-xs">{a.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
          <Field label="Omschrijving / ordernaam">
            <Input value={form.order_name} onChange={e => set('order_name', e.target.value)} required placeholder="bv. Beugel motorsysteem" />
          </Field>
          <Field label="Materiaal (meerdere mogelijk)">
            <MaterialMultiSelect
              selected={form.materials}
              onChange={v => set('materials', v)}
              filaments={filaments}
            />
            {form.materials.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.materials.map(m => (
                  <span key={m.article_number} className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
                    {m.material} {m.color}
                    <button type="button" onClick={() => set('materials', form.materials.filter(x => x.article_number !== m.article_number))}
                      className="text-slate-500 hover:text-white ml-0.5"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Aantal stuks"><Input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} /></Field>
            <Field label="Deadline"><Input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></Field>
          </div>
          <Field label="Printer">
            <Select value={form.printer_id} onChange={e => set('printer_id', e.target.value)}>
              <option value="">— Nog niet toegewezen —</option>
              {printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Geschatte printtijd">
            <div className="flex gap-2 items-center">
              <Input type="number" min="0" value={form.print_hours} onChange={e => set('print_hours', e.target.value)} className="text-center" placeholder="0" />
              <span className="text-slate-400 text-sm flex-shrink-0">uur</span>
              <Input type="number" min="0" max="59" value={form.print_minutes} onChange={e => set('print_minutes', e.target.value)} className="text-center" placeholder="30" />
              <span className="text-slate-400 text-sm flex-shrink-0">min</span>
            </div>
          </Field>
          <Field label="Opmerkingen">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Extra instructies…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" />
          </Field>
          {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg py-2.5 text-sm font-medium transition-colors">Annuleren</button>
            <button type="submit" disabled={saving} className="flex-1 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={{backgroundColor:'#FF2300'}}>
              {saving ? 'Opslaan…' : order?.id ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
