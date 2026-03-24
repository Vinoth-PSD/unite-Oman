import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'

export default function HomeFooter() {
  return (
    <footer className="footer bg-[var(--ink)] py-[48px] px-0 pb-[24px] border-t border-[rgba(255,255,255,0.07)] text-white">
      <div className="c">
        <div className="footer-grid grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-[40px] mb-[32px]">
          <div className="fl-logo">
            <Link to="/"><Logo theme="dark" style={{ height: '30px', marginBottom: '10px' }} /></Link>
            <div className="fl-tag text-[10px] text-[rgba(255,255,255,0.22)] tracking-[0.08em] uppercase font-semibold mb-[8px]">Oman's Local Directory</div>
            <div className="fl-desc text-[12px] text-[rgba(255,255,255,0.3)] leading-[1.7] max-w-[220px] mb-[12px]">
              Connecting the best service professionals with customers across all 11 governorates of Oman.
            </div>
          </div>
          <div className="fc">
            <div className="fc-h text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.22)] mb-[12px]">PLATFORM</div>
            <ul className="fc-links list-none flex flex-col gap-[8px]">
              <li><Link to="/businesses" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">All Services</Link></li>
              <li><Link to="/categories" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Categories</Link></li>
              <li><Link to="/governorates" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Governorates</Link></li>
              <li><Link to="/pricing" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Pricing</Link></li>
            </ul>
          </div>
          <div className="fc">
            <div className="fc-h text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.22)] mb-[12px]">BUSINESS</div>
            <ul className="fc-links list-none flex flex-col gap-[8px]">
              <li><Link to="/vendor/login" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Register Pro</Link></li>
              <li><Link to="/list-business" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">List Business</Link></li>
              <li><Link to="/contact" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Advertising</Link></li>
              <li><Link to="/contact" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Support</Link></li>
            </ul>
          </div>
          <div className="fc">
            <div className="fc-h text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.22)] mb-[12px]">LEGAL</div>
            <ul className="fc-links list-none flex flex-col gap-[8px]">
              <li><Link to="#" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Privacy Policy</Link></li>
              <li><Link to="#" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Terms of Service</Link></li>
              <li><Link to="#" className="text-[12px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-[rgba(255,255,255,0.75)]">Cookie Settings</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bot flex items-center justify-between pt-[20px] border-t border-[rgba(255,255,255,0.07)]">
          <div className="footer-copy text-[11px] text-[rgba(255,255,255,0.2)]">
            © {new Date().getFullYear()} UniteOman. Managed with care in Muscat.
          </div>
        </div>
      </div>
    </footer>
  )
}
