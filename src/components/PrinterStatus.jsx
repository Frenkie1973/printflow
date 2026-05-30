import { useEffect, useState } from 'react'
import { Thermometer, Clock, Layers, AlertTriangle, Loader, Wifi, WifiOff } from 'lucide-react'

const PRINTERS = [
  { name: 'Prusa XL',      ip: '192.168.47.43', key: 'BTnPBZ2zZf9ENHJ' },
  { name: 'Prusa Core One', ip: '192.168.47.72', key: '2QxgXZaeN3NjVGJ' },
]

const STATE_LABELS = {
  PRINTING: 'Aan het printen', IDLE: 'Vrij', FINISHED: 'Klaar',
  ERROR: 'Fout', ATTENTION: 'Aandacht vereist', OFFLINE: 'Offline',
  PAUSED: 'Gepauzeerd', READY: 'Klaar voor gebruik',
}

function formatTime(s) {
  if (!s) return null
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}u ${m}m` : `${m}m`
}

async function fetchPrinter(printer) {
  const base = `http://${printer.ip}`
  const headers = { 'X-Api-Key': printer.key }
  const [statusRes, jobRes] = await Promise.all([
    fetch(`${base}/api/v1/status`, { headers }),
    fetch(`${base}/api/v1/job`, { headers }),
  ])
  const status = await statusRes.json()
  const job = jobRes.ok ? await jobRes.json() : null
  return { status, job }
}

function PrinterCard({ printer }) {
  const [data, setData] = useState(null)
  const [offline, setOffline] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const d = await fetchPrinter(printer)
      setData(d)
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  const state = data?.status?.printer?.state || (offline ? 'OFFLINE' : 'IDLE')
  const printing = state === 'PRINTING'
  const job = data?.job
  const temp = data?.status?.printer

  return (
    <div className={`bg-zinc-950 border rounded-xl p-4 space-y-3 transition-colors ${
      printing ? 'border-[#FF2300]/40' : offline ? 'border-zinc-800 opacity-60' : 'border-zinc-900'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            printing ? 'bg-[#FF2300] animate-pulse' :
            state === 'FINISHED' || state === 'IDLE' || state === 'READY' ? 'bg-emerald-400' :
            state === 'OFFLINE' ? 'bg-slate-600' : 'bg-amber-400'
          }`} />
          <span className="text-white font-semibold text-sm">{printer.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {offline ? <WifiOff size={12} className="text-slate-600" /> : <Wifi size={12} className="text-slate-600" />}
          <span className={`text-xs font-medium ${
            printing ? 'text-[#FF2300]' :
            state === 'FINISHED' || state === 'IDLE' || state === 'READY' ? 'text-emerald-400' :
            state === 'OFFLINE' ? 'text-slate-600' : 'text-amber-400'
          }`}>
            {loading ? '...' : STATE_LABELS[state] || state}
          </span>
        </div>
      </div>

      {printing && job && (
        <>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 text-xs truncate max-w-[60%]">
                {job.file?.display_name || job.file?.name || 'Bezig...'}
              </span>
              <span className="text-white text-xs font-mono font-bold">
                {Math.round(job.progress || 0)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{width:`${job.progress||0}%`,backgroundColor:'#FF2300'}} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {job.time_remaining != null && (
              <span className="flex items-center gap-1">
                <Clock size={10} />{formatTime(job.time_remaining)} resterend
              </span>
            )}
          </div>
        </>
      )}

      {temp && (temp.temp_nozzle > 0 || temp.temp_bed > 0) && (
        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-zinc-900 pt-2">
          <span className="flex items-center gap-1">
            <Thermometer size={10} className="text-red-400" />
            Nozzle: <span className="text-slate-300">{Math.round(temp.temp_nozzle)}°C</span>
          </span>
          <span className="flex items-center gap-1">
            <Thermometer size={10} className="text-amber-400" />
            Bed: <span className="text-slate-300">{Math.round(temp.temp_bed)}°C</span>
          </span>
        </div>
      )}
    </div>
  )
}

export default function PrinterStatusLive() {
  return (
    <div className="space-y-2">
      {PRINTERS.map(p => <PrinterCard key={p.ip} printer={p} />)}
    </div>
  )
}
