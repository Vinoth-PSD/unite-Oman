import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'

export default function HomeNavbar() {
  return (
    <nav className="nav h-[60px] flex items-center border-b border-[var(--line)] bg-white sticky top-0 z-[100]">
      <div className="nav-inner flex items-center justify-between w-full max-w-[var(--max)] mx-auto px-[32px]">
        <Link to="/" className="nav-logo">
          <Logo theme="light" style={{ height: '32px' }} />
        </Link>
        <ul className="nav-links hidden md:flex items-center gap-[28px] list-none">
          <li><Link to="/businesses" className="text-[13px] text-[var(--mid)] font-medium transition-colors hover:text-[var(--ink)]">Services</Link></li>
          <li><Link to="/governorates" className="text-[13px] text-[var(--mid)] font-medium transition-colors hover:text-[var(--ink)]">Directory</Link></li>
          <li><Link to="/businesses" className="text-[13px] text-[var(--mid)] font-medium transition-colors hover:text-[var(--ink)]">Businesses</Link></li>
          <li><Link to="/pricing" className="text-[13px] text-[var(--mid)] font-medium transition-colors hover:text-[var(--ink)]">Pricing</Link></li>
        </ul>
        <div className="nav-r flex items-center gap-[8px]">
          <Link to="/vendor/login" className="btn-text hidden sm:block bg-none text-[var(--mid)] text-[13px] font-medium p-[0_4px] transition-colors hover:text-[var(--ink)]">
            Register as Professional
          </Link>
          <Link to="/admin/login" className="btn-pill-out bg-none border-[1.5px] border-[var(--line)] text-[var(--ink)] text-[13px] font-medium p-[7px_18px] rounded-full transition-all hover:border-[var(--ink)]">
            Log in
          </Link>
          <Link to="/list-business" className="btn-pill bg-[var(--ink)] text-white text-[13px] font-medium p-[8px_18px] rounded-full transition-opacity hover:opacity-[0.85]">
            List Business
          </Link>
        </div>
      </div>
    </nav>
  )
}
