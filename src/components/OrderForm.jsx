import { useState, useEffect } from 'react'
import { addOrder, updateOrder, upsertArticle, usePrinters, useArticleLibrary } from '../hooks/useOrders'
import { useAuth } from '../hooks/useAuth'
import { MATERIALS, COLORS } from '../lib/constants'
import { X } from 'lucide-react'

const Field = ({ label, children }) => (
  <div>
    <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wide font-medium">{label}</label>
    {children}
  </div>
)
const Input = ({ className = '', ...props }) => (
  <input className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm ${className}`} {...props} />
)
const Select = ({ children, ...props }) => (
  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm" {...props}>{children}</select>
)

export default function OrderForm({ order, onClose }) {
  const { user } = useAuth()
  const printers = usePrinters()
  const { articles } = useArticleLibrary()
  const [form, setForm] = useState({
    order_name: '', article_number: '', quantity: 1,
    material: 'PLA', color: 'Zwart', printer_id: '',
    deadline: '', print_hours: 0, print_minutes: 30, notes: '',
    ...(order || {})
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (form.article_number.length >= 2) {
      setSuggestions(articles.filter(a => a.article_number.toLowerCase().includes(form.article_number.toLowerCase())))
    } else {
      setSuggestions([])
    }
  }, [form.article_number, articles])

  const applyArticle = (a) => {
    setForm(f => ({ ...f, article_number: a.article_number, order_name: a.description || f.order_name, material: a.material || f.material, color: a.color || f.color, print_hours: a.default_print_hours || f.print_hours, print_minutes: a.default_print_minutes || f.print_minutes, notes: a.notes || f.notes }))
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
        quantity: Number(form.quantity), material: form.material, color: form.color,
        printer_id: form.printer_id || null, deadline: form.deadline || null,
        print_hours: Number(form.print_hours), print_minutes: Number(form.print_minutes),
        notes: form.notes, created_by_email: user.email,
      }
      if (order?.id) {
        await updateOrder(order.id, payload)
      } else {
        await addOrder({ ...payload, status: 'new' })
      }
      if (form.article_number) {
        await upsertArticle(form.article_number, {
          article_number: form.article_number, description: form.order_name,
          material: form.material, color: form.color,
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
                      <div className="text-slate-400 text-xs">{a.description} · {a.material} · {a.color}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
          <Field label="Omschrijving / ordernaam">
            <Input value={form.order_name} onChange={e => set('order_name', e.target.value)} required placeholder="bv. Beugel motorsysteem" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Materiaal"><Select value={form.material} onChange={e => set('material', e.target.value)}>{MATERIALS.map(m => <option key={m}>{m}</option>)}</Select></Field>
            <Field label="Kleur"><Select value={form.color} onChange={e => set('color', e.target.value)}>{COLORS.map(c => <option key={c}>{c}</option>)}</Select></Field>
          </div>
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
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Extra instructies…" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm resize-none" />
          </Field>
          {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg py-2.5 text-sm font-medium transition-colors">Annuleren</button>
            <button type="submit" disabled={saving} className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
              {saving ? 'Opslaan…' : order?.id ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
