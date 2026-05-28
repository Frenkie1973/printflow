import { useEffect, useState } from 'react'
import { differenceInSeconds, format } from 'date-fns'

function pad(n) { return String(n).padStart(2, '0') }

export function Countdown({ endTime }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const calc = () => {
      const secs = differenceInSeconds(new Date(endTime), new Date())
      setRemaining(Math.max(0, secs))
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [endTime])

  if (remaining <= 0) return <span className="text-emerald-400 font-mono text-sm font-semibold">Klaar!</span>

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60

  const pct = remaining > 0 ? remaining : 0

  return (
    <span className="font-mono text-sm font-semibold text-brand-400">
      {h > 0 ? `${pad(h)}:` : ''}{pad(m)}:{pad(s)}
    </span>
  )
}

export function EndTime({ endTime }) {
  return (
    <span className="text-slate-400 text-xs">
      Klaar om {format(new Date(endTime), 'HH:mm')}
    </span>
  )
}
