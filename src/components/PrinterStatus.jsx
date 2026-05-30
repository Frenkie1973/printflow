import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Thermometer, Clock, Wifi, WifiOff } from 'lucide-react'

const STATE_LABELS = {
  PRINTING: 'Aan het printen', IDLE: 'Vrij', FINISHED: 'Klaar',
  ERROR: 'Fout', ATTENTION: 'Aandacht vereist', OFFLINE: 'Offline',
  PAUSED: 'Gepauzeerd', READY: 'Klaar voor gebruik', UNKNOWN: 'Onbekend',
}

function formatTime(s) {
  if (!s) return null
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}u ${m}m` : `${m}m`
}

function PrinterCard({ printer }) {
  const state = printer.state || 'OFFLINE'
  const online = printer.online !== false
  const printing = state === 'PRINTING'

  return (
    <div className={`bg-zinc-950 border rounded-xl p-4 space-y-3 transition-colors ${
      printing ? 'border-[#FF2300]/40' : !online ? 'border-zinc-800 opacity-60' : 'border-zinc-900'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            printing ? 'bg-[#FF2300] animate-pulse' :
            ['FINISHED','IDLE','READY','UNKNOWN'].includes(state) ? 'bg-emerald-400' :
            state === 'OFFLINE' ? 'bg-slate-600' : 'bg-amber-400'
          }`} />
          <span className="text-white font-semibold text-sm">{printer.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {online ? <Wifi size={11} className="text-slate-600" /> : <WifiOff size={11} className="text-slate-600" />}
          <span className={`text-xs font-medium ${
            printing ? 'text-[#FF2300]' :
            ['FINISHED','IDLE','READY','UNKNOWN'].includes(state) ? 'text-emerald-400' :
            state === 'OFFLINE' ? 'text-slate-600' : 'text-amber-400'
          }`}>
            {STATE_LABELS[state] || state}
          </span>
        </div>
      </div>

      {printing && printer.filename && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 text-xs truncate max-w-[60%]">{printer.filename}</span>
            <span className="text-white text-xs font-mono font-bold">{Math.round(printer.progress || 0)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all" style={{width:`${printer.progress||0}%`,backgroundColor:'#FF2300'}} />
          </div>
          {printer.time_remaining && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
              <Clock size={10} />{formatTime(printer.time_remaining)} resterend
            </div>
          )}
        </div>
      )}

      {(printer.temp_nozzle > 0 || printer.temp_bed > 0) && (
        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-zinc-900 pt-2">
          <span className="flex items-center gap-1">
            <Thermometer size={10} className="text-red-400" />
            Nozzle: <span className="text-slate-300">{Math.round(printer.temp_nozzle)}°C</span>
          </span>
          <span className="flex items-center gap-1">
            <Thermometer size={10} className="text-amber-400" />
            Bed: <span className="text-slate-300">{Math.round(printer.temp_bed)}°C</span>
          </span>
        </div>
      )}
    </div>
  )
}

export default function PrinterStatusLive() {
  const [printers, setPrinters] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'printer_status'), snap => {
      setPrinters(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.name?.localeCompare(b.name)))
    })
    return unsub
  }, [])

  if (printers.length === 0) return (
    <div className="text-slate-600 text-xs py-2">Bridge niet actief — start printflow-bridge.py op kantoor</div>
  )

  return (
    <div className="space-y-2">
      {printers.map(p => <PrinterCard key={p.id} printer={p} />)}
    </div>
  )
}
