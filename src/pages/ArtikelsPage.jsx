import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useArticleLibrary } from '../hooks/useOrders'
import { Library, Trash2, Search, Package } from 'lucide-react'

export default function ArtikelsPage() {
  const { articles, refresh } = useArticleLibrary()
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  const filtered = articles.filter(a =>
    a.article_number.toLowerCase().includes(search.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const remove = async (id) => {
    setDeleting(id)
    await supabase.from('article_library').delete().eq('id', id)
    await refresh()
    setDeleting(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
        <Library size={20} className="text-brand-500" />
        Artikelbibliotheek
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Artikelen worden automatisch opgeslagen als je een printorder aanmaakt met een artikelnummer.
      </p>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Zoek op artikelnummer of omschrijving…"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          <Package size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nog geen artikelen in de bibliotheek</p>
          <p className="text-xs mt-1 text-slate-700">Maak een printorder aan met een artikelnummer om te beginnen</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm font-mono">{a.article_number}</span>
                  <span className="text-slate-500 text-xs bg-slate-800 px-2 py-0.5 rounded-full">{a.material}</span>
                  <span className="text-slate-500 text-xs">{a.color}</span>
                </div>
                {a.description && <p className="text-slate-400 text-sm">{a.description}</p>}
                <div className="flex gap-4 mt-1.5 text-slate-600 text-xs">
                  <span>⏱ {a.default_print_hours}u {a.default_print_minutes}m</span>
                  {a.notes && <span className="truncate">📝 {a.notes}</span>}
                </div>
              </div>
              <button
                onClick={() => remove(a.id)}
                disabled={deleting === a.id}
                className="text-slate-700 hover:text-red-400 transition-colors flex-shrink-0 p-1 disabled:opacity-50"
                title="Verwijderen uit bibliotheek"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
