import { useState } from 'react'
import { addPrinter, updatePrinter, usePrinters } from '../hooks/useOrders'
import { Plus, Pencil, Check, X, Printer } from 'lucide-react'

export default function PrintersPage() {
  const printers = usePrinters()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [loading, setLoading] = useState(false)

  const add = async () => {
    if (!newName.trim()) return
    setLoading(true)
    await addPrinter({ name: newName.trim(), description: newDesc.trim(), active: true })
    setNewName(''); setNewDesc('')
    setLoading(false)
  }

  const save = async (id) => {
    await updatePrinter(id, { name: editName, description: editDesc })
    setEditId(null)
  }

  const toggle = (p) => updatePrinter(p.id, { active: !p.active })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
        <Printer size={20} className="text-brand-500" />Printers beheren
      </h1>
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 mb-6">
        <h2 className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-3">Printer toevoegen</h2>
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Naam (bv. Prusa XL – Hal 2)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Omschrijving (optioneel)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm" />
          <button onClick={add} disabled={loading || !newName.trim()} className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {printers.map(p => (
          <div key={p.id} className={`bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center gap-3 ${!p.active && 'opacity-50'}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            {editId === p.id ? (
              <div className="flex-1 flex gap-2">
                <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-brand-500" />
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium">{p.name}</div>
                {p.description && <div className="text-slate-500 text-xs">{p.description}</div>}
              </div>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              {editId === p.id ? (
                <>
                  <button onClick={() => save(p.id)} className="text-emerald-400 hover:text-emerald-300 p-1 transition-colors"><Check size={15} /></button>
                  <button onClick={() => setEditId(null)} className="text-slate-500 hover:text-slate-300 p-1 transition-colors"><X size={15} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditId(p.id); setEditName(p.name); setEditDesc(p.description || '') }} className="text-slate-500 hover:text-slate-300 p-1 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => toggle(p)} className={`text-xs px-2 py-1 rounded-lg transition-colors ${p.active ? 'text-slate-500 hover:text-amber-400' : 'text-slate-600 hover:text-emerald-400'}`}>
                    {p.active ? 'Uit' : 'Aan'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
