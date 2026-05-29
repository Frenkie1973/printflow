import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      console.error('Login fout:', err.code, err.message)
      const msgs = {
        'auth/user-not-found': 'Geen account gevonden met dit e-mailadres.',
        'auth/wrong-password': 'Verkeerd wachtwoord.',
        'auth/invalid-credential': 'E-mailadres of wachtwoord klopt niet.',
        'auth/invalid-email': 'Ongeldig e-mailadres.',
        'auth/too-many-requests': 'Te veel pogingen. Probeer later opnieuw.',
        'auth/network-request-failed': 'Geen internetverbinding.',
      }
      setError(msgs[err.code] || `Fout: ${err.code || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10 gap-4">
          <img src="/qline-logo.png" alt="Q-Line" className="h-20 w-auto" />
          <div className="text-center">
            <div className="text-white font-black text-2xl uppercase tracking-widest" style={{fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'}}>Q-Line</div>
            <div className="font-bold text-3xl tracking-tight" style={{fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', color:'#FF2300'}}>PrintFlow</div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-5">Inloggen</h2>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none text-sm"
                placeholder="naam@q-line.com"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full disabled:opacity-50 text-white font-bold rounded-lg py-2.5 text-sm transition-colors"
              style={{backgroundColor: '#FF2300'}}
            >
              {loading ? 'Bezig…' : 'Inloggen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
