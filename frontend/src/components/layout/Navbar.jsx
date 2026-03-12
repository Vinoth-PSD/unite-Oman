import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'Governorates', to: '/governorates' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

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
          <button onClick={() => navigate('/admin/login')}
            className="border border-white/20 text-white/65 hover:border-white/40 hover:text-white text-sm font-semibold px-4 py-2 rounded-md transition-all">
            Log in
          </button>
          <button onClick={() => navigate('/list-business')}
            className="brand-btn text-sm px-5 py-2 rounded-md">
            + List Your Business
          </button>
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
            <button onClick={() => { navigate('/admin/login'); setOpen(false) }}
              className="border border-white/20 text-white/65 text-sm font-semibold px-4 py-2 rounded-md">
              Log in
            </button>
            <button onClick={() => { navigate('/list-business'); setOpen(false) }}
              className="brand-btn text-sm px-5 py-2 rounded-md">
              + List Your Business
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
