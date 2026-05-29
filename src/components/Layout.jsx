import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import { LayoutDashboard, Layers, Library, Package2, LogOut } from 'lucide-react'

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink to={to} className={({ isActive }) =>
    `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative
     ${isActive ? 'text-[#FF2300]' : 'text-slate-500 hover:text-slate-300'}`
  }>
    <div className="relative">
      <Icon size={20} />
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#FF2300] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
)

export default function Layout({ children }) {
  const { signOut } = useAuth()
  const { orders } = useOrders()
  const printingCount = orders.filter(o => o.status === 'printing').length
  const newCount = orders.filter(o => o.status === 'new').length

  return (
    <div className="min-h-screen bg-black pb-20 sm:pb-0">
      {/* Desktop top nav */}
      <header className="hidden sm:flex bg-black/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <img src="/qline-logo.png" alt="Q-Line" className="h-8 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="text-white font-black tracking-tight text-sm uppercase" style={{fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', letterSpacing: '0.05em'}}>Q-Line</span>
              <span className="text-[#FF2300] font-bold text-lg tracking-tight" style={{fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'}}>PrintFlow</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
              Dashboard
            </NavLink>
            <NavLink to="/printers" className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
              Printers
            </NavLink>
            <NavLink to="/artikelen" className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
              Artikelen
            </NavLink>
            <NavLink to="/materialen" className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
              Materialen
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {printingCount > 0 && (
              <span className="flex items-center gap-1.5 bg-[#FF2300]/20 text-[#FF2300] text-xs px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#FF2300] rounded-full animate-pulse" />
                {printingCount} actief
              </span>
            )}
            <button onClick={signOut} className="text-slate-500 hover:text-slate-300 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sm:hidden bg-black/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/qline-logo.png" alt="Q-Line" className="h-7 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-xs uppercase" style={{fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'}}>Q-Line</span>
              <span className="text-[#FF2300] font-bold text-base" style={{fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'}}>PrintFlow</span>
            </div>
          </div>
          {printingCount > 0 && (
            <span className="flex items-center gap-1.5 bg-[#FF2300]/20 text-[#FF2300] text-xs px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#FF2300] rounded-full animate-pulse" />
              {printingCount}
            </span>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-4xl mx-auto">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-black/95 backdrop-blur border-t border-slate-800 z-40 pb-safe">
        <div className="flex justify-around py-2">
          <NavItem to="/" icon={LayoutDashboard} label="Orders" badge={newCount} />
          <NavItem to="/printers" icon={Layers} label="Printers" badge={printingCount} />
          <NavItem to="/artikelen" icon={Library} label="Artikelen" />
          <NavItem to="/materialen" icon={Package2} label="Materialen" />
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium">Uitloggen</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
