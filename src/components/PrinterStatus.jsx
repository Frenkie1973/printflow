import { useEffect, useState } from 'react'
import { fetchPrusaPrinters } from '../lib/prusaConnect'
import { Thermometer, Clock, Layers, AlertTriangle, Loader } from 'lucide-react'

const PRUSA_USER = 'frankq-line'
const PRUSA_PASS = 'gYscam-fudbyv-cofke9'

const PRINTER_UUID_MAP = {
  'c0f5aae5-561c-4811-9e73-71979656b828': 'Prusa XL',
  '046d8759-174c-4a69-847c-cc4e3f881200': 'Prusa Core One',
}

const STATE_COLORS = {
  PRINTING: 'text-[#FF2300]', IDLE: 'text-emerald-400',
  FINISHED: 'text-emerald-400', ERROR: 'text-red-400',
  ATTENTION: 'text-amber-400', OFFLINE: 'text-slate-600', PAUSED: 'text-amber-400',
}
const STATE_LABELS = {
  PRINTING: 'Aan het printen', IDLE: 'Vrij', FINISHED: 'Klaar',
  ERROR: 'Fout', ATTENTION: 'Aandacht vereist', OFFLINE: 'Offline', PAUSED: 'Gepauzeerd',
}

function formatTime(s) {
  if (!s) return '-'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}u ${m}m` : `${m}m`
}

function PrinterCard({ printer }) {
  const name = PRINTER_UUID_MAP[printer.uuid] || printer.name || printer.printer_model
  const state = printer.printer_state || 'OFFLINE'
  const job = printer.job_info
  const temp = printer.temp

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            state === 'PRINTING' ? 'bg-[#FF2300] animate-pulse' :
            state === 'IDLE' || state === 'FINISHED' ? 'bg-emerald-400' :
            'bg-amber-400'}`} />
          <span className="text-white font-semibold text-sm">{name}</span>
        </div>
        <span className={`text-xs font-medium ${STATE_COLORS[state] || 'text-slate-500'}`}>
          {STATE_LABELS[state] || state}
        </span>
      </div>

      {job && state === 'PRINTING' && (
        <>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 text-xs truncate max-w-[60%]">
                {job.display_name?.replace(/\.bgcode$/, '').replace(/\.gcode$/, '')}
              </span>
              <span className="text-white text-xs font-mono">{job.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{width: `${job.progress}%`, backgroundColor:'#FF2300'}} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={10} />{formatTime(job.time_remaining)} resterend
            </span>
            {job.model_weight && (
              <span className="flex items-center gap-1">
                <Layers size={10} />{Math.round(job.weight_remaining || 0)}g resterend
              </span>
            )}
          </div>
        </>
      )}

      {temp && (temp.temp_nozzle > 0 || temp.temp_bed > 0) && (
        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-zinc-900 pt-2">
          <span className="flex items-center gap-1">
            <Thermometer size={10} className="text-red-400" />
            Nozzle: <span className="text-slate-300">{temp.temp_nozzle}°C</span>
          </span>
          <span className="flex items-center gap-1">
            <Thermometer size={10} className="text-amber-400" />
            Bed: <span className="text-slate-300">{temp.temp_bed}°C</span>
          </span>
        </div>
      )}
    </div>
  )
}

export default function PrinterStatusLive() {
  const [printers, setPrinters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const load = async () => {
    try {
      const data = await fetchPrusaPrinters(PRUSA_USER, PRUSA_PASS)
      setPrinters(data.printers || [])
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-600 text-sm py-2">
      <Loader size={14} className="animate-spin" />Printers ophalen…
    </div>
  )
  if (error) return (
    <div className="text-amber-500 text-xs flex items-center gap-1.5 py-2">
      <AlertTriangle size={12} />Prusa Connect: {error}
    </div>
  )

  return (
    <div className="space-y-2">
      {printers.map(p => <PrinterCard key={p.uuid} printer={p} />)}
      {lastUpdate && (
        <p className="text-slate-700 text-xs text-right">
          Bijgewerkt: {lastUpdate.toLocaleTimeString('nl-NL')}
        </p>
      )}
    </div>
  )
}
