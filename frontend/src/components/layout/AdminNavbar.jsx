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

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none' // Prevents pull-to-refresh on mobile
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => { 
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview'

  // Handle safe area insets for modern mobile devices
  const safeAreaTop = 'env(safe-area-inset-top)'
  const safeAreaBottom = 'env(safe-area-inset-bottom)'

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          scrolled ? 'bg-ink/95 backdrop-blur-xl border-b border-white/10' : 'bg-ink/90 backdrop-blur-lg'
        }`}
        style={{ paddingTop: safeAreaTop }}
      >
        {/* Brand gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg,#E8317A,#F05A28,#5B2D8E)' }} />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                    currentTab === tab
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}>
                  <Icon size={14} />
                  {label}
                  {currentTab === tab && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full"
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
          <button
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay menu */}
      {open && (
        <div 
          className="lg:hidden fixed inset-0 z-40 flex flex-col"
          style={{ 
            background: 'rgba(0,0,0,0.97)', 
            paddingTop: `calc(64px + ${safeAreaTop})`,
            paddingBottom: safeAreaBottom
          }}
        >
          {/* Scrollable nav links area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 overscroll-contain">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-4 mb-3">
              Navigation
            </p>
            <div className="space-y-1.5">
              {adminLinks.map(({ label, to, tab, icon: Icon }) => (
                <Link
                  key={tab}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all touch-manipulation ${
                    currentTab === tab
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white active:bg-white/10'
                  }`}
                >
                  {/* Active gradient left border indicator */}
                  {currentTab === tab && (
                    <span className="w-1 h-5 rounded-full flex-shrink-0"
                      style={{ background: 'linear-gradient(180deg,#E8317A,#5B2D8E)' }} />
                  )}
                  {currentTab !== tab && <span className="w-1 flex-shrink-0" />}
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Logout pinned at bottom */}
          <div className="px-4 py-5 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl text-sm font-semibold text-white/60 active:text-white border border-white/10 active:border-white/25 active:bg-white/10 transition-all touch-manipulation"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  )
}