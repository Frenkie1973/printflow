import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Printer } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else {
        const { error } = await signUp(email, password)
        if (error) setError(error.message)
        else setSuccess('Check je e-mail voor een bevestigingslink.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Printer size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight">PrintFlow</div>
            <div className="text-slate-500 text-xs font-mono">3D Print Manager</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-5">
            {mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
          </h2>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                placeholder="naam@bedrijf.nl"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-emerald-400 text-sm bg-emerald-900/20 rounded-lg px-3 py-2">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
            >
              {loading ? 'Bezig…' : mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
            className="w-full mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            {mode === 'login' ? 'Nog geen account? Registreren' : 'Terug naar inloggen'}
          </button>
        </div>
      </div>
    </div>
  )
}
