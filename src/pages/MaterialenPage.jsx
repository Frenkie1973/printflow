import { useState } from 'react'
import { useFilaments, addFilament, updateFilament, deleteFilament } from '../hooks/useOrders'
import { Package, Plus, Trash2, Search, X } from 'lucide-react'

const MATERIALEN = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC', 'Resin', 'Overig']
const KLEUREN = ['Zwart', 'Wit', 'Grijs', 'Rood', 'Blauw', 'Groen', 'Geel', 'Oranje', 'Transparant', 'Beige', 'Bruin', 'Paars', 'Roze', 'Zilver', 'Goud', 'Overig']
const EMPTY = { article_number: '', brand: '', material: 'PLA', color: 'Zwart', notes: '' }

export default function MaterialenPage() {
  const { filaments } = useFilaments()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [editId, setEditId] = useState(null)

  const filtered = filaments.filter(f =>
    f.article_number?.toLowerCase().includes(search.toLowerCase()) ||
    f.brand?.toLowerCase().includes(search.toLowerCase()) ||
    f.material?.toLowerCase().includes(search.toLowerCase()) ||
    f.color?.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true) }
  const openEdit = (f) => { setForm({ ...f }); setEditId(f.id); setShowForm(true) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    if (editId) await updateFilament(editId, form)
    else await addFilament(form)
    setSaving(false)
    setShowForm(false)
    setForm(EMPTY)
    setEditId(null)
  }

  const remove = async (id) => {
    setDeleting(id)
    await deleteFilament(id)
    setDeleting(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Package size={20} style={{color:'#FF2300'}} />Materialen
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Filament catalogus</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-xl"
          style={{backgroundColor:'#FF2300'}}>
          <Plus size={16} />Toevoegen
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Zoek op artnr, merk, materiaal, kleur…"
          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none text-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Package size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Nog geen materialen — voeg jullie filaments toe</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => (
            <div key={f.id} onClick={() => openEdit(f)}
              className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 cursor-pointer hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-white font-semibold text-sm font-mono">{f.article_number}</span>
                  {f.brand && <span className="text-slate-300 text-sm">{f.brand}</span>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{f.material}</span>
                  <span className="text-xs text-slate-500">{f.color}</span>
                  {f.notes && <span className="text-slate-600 text-xs truncate max-w-xs">{f.notes}</span>}
                </div>
                <button onClick={e => { e.stopPropagation(); remove(f.id) }} disabled={deleting === f.id}
                  className="text-slate-700 hover:text-red-400 transition-colors flex-shrink-0 p-1 disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold">{editId ? 'Filament bewerken' : 'Filament toevoegen'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Artikelnummer *</label>
                  <input required value={form.article_number} onChange={e => setForm({...form, article_number: e.target.value})}
                    placeholder="bijv. FIL-PLA-ZW-001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none font-mono placeholder-slate-600" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Merk</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                    placeholder="bijv. Prusament"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none placeholder-slate-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Materiaal</label>
                  <select value={form.material} onChange={e => setForm({...form, material: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                    {MATERIALEN.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Kleur</label>
                  <select value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                    {KLEUREN.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Notities</label>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="bijv. printtemperatuur, leverancier…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none placeholder-slate-600" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full text-white font-semibold rounded-xl py-2.5 text-sm disabled:opacity-50"
                style={{backgroundColor:'#FF2300'}}>
                {saving ? 'Opslaan…' : editId ? 'Opslaan' : 'Toevoegen'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
