import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Building2, ClipboardList, LogOut, ShieldCheck, Users, Star, History } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const adminLinks = [
  { label: 'Overview', to: '/admin?tab=overview', tab: 'overview', icon: LayoutDashboard },
  { label: 'Shops', to: '/admin?tab=businesses', tab: 'businesses', icon: Building2 },
  { label: 'Requests', to: '/admin?tab=requests', tab: 'requests', icon: ClipboardList },
  { label: 'Vendors', to: '/admin?tab=vendors', tab: 'vendors', icon: Users },
  { label: 'Messages', to: '/admin?tab=messages', tab: 'messages', icon: ClipboardList },
  { label: 'Reviews', to: '/admin?tab=reviews', tab: 'reviews', icon: Star },
  { label: 'History', to: '/admin?tab=history', tab: 'history', icon: History },
]

export default function AdminNavbar() {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/admin/login')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
      scrolled ? 'bg-ink/95 backdrop-blur-xl border-b border-white/10' : 'bg-ink/90 backdrop-blur-lg'
    }`}>
      {/* Same brand gradient as public navbar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg,#E8317A,#F05A28,#5B2D8E)' }} />

      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-full">
        {/* Brand */}
        <Link to="/admin" className="flex items-center gap-2.5 select-none flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' }}>
            <ShieldCheck size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide hidden sm:block">UniteOman</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-white/20 text-white/50 hidden sm:block">Admin</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1 list-none">
          {adminLinks.map(({ label, to, tab, icon: Icon }) => (
            <li key={tab}>
              <Link to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentTab === tab
                    ? 'text-white bg-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}>
                <Icon size={14} />
                {label}
                {currentTab === tab && (
                  <span className="absolute bottom-0 h-[2px] w-full rounded-full"
                    style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }} />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop logout */}
        <button onClick={handleLogout}
          className="hidden lg:flex items-center gap-2 border border-white/15 text-white/55 hover:border-white/35 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex-shrink-0">
          <LogOut size={14} />
          Logout
        </button>

        {/* Mobile toggle */}
        <button className="lg:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-ink/98 border-t border-white/10 px-6 py-4 space-y-1">
          {adminLinks.map(({ label, to, tab, icon: Icon }) => (
            <Link key={tab} to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === tab
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            <button onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white/55 hover:text-white hover:bg-white/5 transition-all">
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
