import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Building2, Star, LogOut, Zap } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'

const vendorLinks = [
  { label: 'Overview', to: '/vendor/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'My Shops', to: '/vendor/dashboard/shops', icon: Building2, exact: false },
  { label: 'Services', to: '/vendor/dashboard/services', icon: Zap, exact: false },
  { label: 'Reviews', to: '/vendor/dashboard/reviews', icon: Star, exact: false },
]

export default function VendorNavbar() {
  const { vendorLogout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    vendorLogout()
    setOpen(false)
    navigate('/vendor/login')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
      scrolled ? 'bg-ink/95 backdrop-blur-xl border-b border-white/10' : 'bg-ink/90 backdrop-blur-lg'
    }`}>
      {/* Same brand gradient as public navbar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg,#E8317A,#F05A28,#5B2D8E)' }} />

      <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between h-full">
        {/* Brand — same logo as public site */}
        <Link to="/vendor/dashboard" className="flex items-center gap-2.5 select-none flex-shrink-0">
          <Logo />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-white/20 text-white/50 hidden sm:block">Vendor</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1 list-none">
          {vendorLinks.map(({ label, to, icon: Icon, exact }) => (
            <li key={to}>
              <Link to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative group ${
                  isActive(to, exact)
                    ? 'text-white bg-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}>
                <Icon size={14} />
                {label}
                {isActive(to, exact) && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }} />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop logout */}
        <button onClick={handleLogout}
          className="hidden md:flex items-center gap-2 border border-white/15 text-white/55 hover:border-white/35 hover:text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex-shrink-0">
          <LogOut size={14} />
          Logout
        </button>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-ink/98 border-t border-white/10 px-6 py-4 space-y-1">
          {vendorLinks.map(({ label, to, icon: Icon, exact }) => (
            <Link key={to} to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive(to, exact)
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
