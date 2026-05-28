export const STATUSES = {
  new:       { label: 'Nieuw',          color: 'bg-slate-700 text-slate-200',   dot: 'bg-slate-400' },
  preparing: { label: 'Voorbereiden',   color: 'bg-blue-900 text-blue-200',     dot: 'bg-blue-400' },
  printing:  { label: 'Aan het printen',color: 'bg-brand-600 text-orange-100',  dot: 'bg-brand-400 animate-pulse' },
  done:      { label: 'Klaar',          color: 'bg-emerald-900 text-emerald-200',dot: 'bg-emerald-400' },
  failed:    { label: 'Mislukt',        color: 'bg-red-900 text-red-200',       dot: 'bg-red-400' },
  cancelled: { label: 'Geannuleerd',    color: 'bg-zinc-800 text-zinc-400',     dot: 'bg-zinc-500' },
}

export const MATERIALS = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'NYLON', 'PC', 'Resin', 'Overig']

export const COLORS = [
  'Zwart', 'Wit', 'Grijs', 'Rood', 'Blauw', 'Groen', 'Geel', 'Oranje',
  'Transparant', 'Beige', 'Bruin', 'Paars', 'Roze', 'Zilver', 'Goud', 'Overig'
]
