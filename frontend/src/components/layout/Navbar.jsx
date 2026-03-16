import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Building2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'Governorates', to: '/governorates' },  { label: 'Pricing', to: '/pricing' },{ label: 'Contact', to: '/contact' },]

export default function Navbar() {
  const { isAdmin, isVendor, logout, vendorLogout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    vendorLogout()
    setOpen(false)
    navigate('/')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
      scrolled ? 'bg-ink/95 backdrop-blur-xl border-b border-white/10' : 'bg-ink/90 backdrop-blur-lg'
    }`}>
      {/* Brand gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg,#E8317A,#F05A28,#5B2D8E)' }} />

      <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between h-full">
        <Link to="/"><Logo /></Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {links.map(l => (
            <li key={l.to}>
              <Link to={l.to}
                className="text-white/55 text-sm font-semibold tracking-wide hover:text-white transition-colors duration-200 relative group">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                  style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }} />
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {isAdmin ? (
            <Link to="/admin" className="brand-btn px-6 py-2 rounded-md text-sm font-bold">
              Admin Panel
            </Link>
          ) : isVendor ? (
            <div className="flex items-center gap-4">
              <Link to="/vendor/dashboard" className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="border border-white/20 text-white/65 hover:border-white/40 hover:text-white text-sm font-semibold px-4 py-2 rounded-md transition-all">
                Log Out
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/admin/login')}
                className="border border-white/20 text-white/65 hover:border-white/40 hover:text-white text-sm font-semibold px-4 py-2 rounded-md transition-all">
                Log in
              </button>
              <Link to="/vendor/login" className="brand-btn px-5 py-2 rounded-md text-sm flex items-center gap-2">
                <Building2 size={16} />
                List Your Business
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-ink/98 border-t border-white/10 px-6 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-white text-sm font-semibold py-2 transition-colors">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            {isAdmin ? (
              <Link to="/admin" onClick={() => setOpen(false)} className="brand-btn px-6 py-2 rounded-md text-sm font-bold text-center">
                Admin Panel
              </Link>
            ) : isVendor ? (
              <>
                <Link to="/vendor/dashboard" onClick={() => setOpen(false)} className="text-sm font-bold text-white/70 hover:text-white transition-colors py-2 text-center">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="border border-white/20 text-white/65 hover:border-white/40 hover:text-white text-sm font-semibold px-4 py-2 rounded-md transition-all">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('/admin/login'); setOpen(false) }}
                  className="border border-white/20 text-white/65 text-sm font-semibold px-4 py-2 rounded-md">
                  Log in
                </button>
                <button onClick={() => { navigate('/vendor/login'); setOpen(false) }}
                  className="brand-btn text-sm px-5 py-2 rounded-md">
                  + List Your Business
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
