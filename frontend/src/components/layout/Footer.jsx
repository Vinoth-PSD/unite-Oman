import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'

export default function Footer() {
  return (
    <footer className="footer bg-[var(--ink)] py-[64px] px-0 pb-[32px] border-t border-[rgba(255,255,255,0.07)] text-white">
      <div className="c">
        <div className="footer-grid grid md:grid-cols-[2.5fr_1fr_1fr_1fr] gap-[48px] mb-[48px]">
          <div className="fl-logo">
            <Link to="/"><Logo theme="dark" style={{ height: '32px', marginBottom: '16px' }} /></Link>
            <div className="fl-tag text-[10px] text-[rgba(255,255,255,0.25)] tracking-[0.1em] uppercase font-bold mb-[12px]">Oman's Premier Business Directory</div>
            <p className="fl-desc text-[13px] text-[rgba(255,255,255,0.4)] leading-[1.8] max-w-[280px]">
              The Sultanate's most trusted platform for connecting verified local businesses with customers across all 11 governorates.
            </p>
          </div>
          
          <div className="fc">
            <h4 className="fc-h text-[11px] font-bold tracking-[0.12em] uppercase text-[rgba(255,255,255,0.3)] mb-[20px]">Explore</h4>
            <ul className="fc-links list-none flex flex-col gap-[10px]">
              <li><Link to="/businesses" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Find Services</Link></li>
              <li><Link to="/categories" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Browse Categories</Link></li>
              <li><Link to="/governorates" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">By Governorate</Link></li>
              <li><Link to="/pricing" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Business Pricing</Link></li>
            </ul>
          </div>

          <div className="fc">
            <h4 className="fc-h text-[11px] font-bold tracking-[0.12em] uppercase text-[rgba(255,255,255,0.3)] mb-[20px]">For Businesses</h4>
            <ul className="fc-links list-none flex flex-col gap-[10px]">
              <li><Link to="/vendor/login" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Vendor Portal</Link></li>
              <li><Link to="/list-business" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Add Your Shop</Link></li>
              <li><Link to="/contact" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Advertising</Link></li>
              <li><Link to="/partner" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Partner Program</Link></li>
            </ul>
          </div>

          <div className="fc">
            <h4 className="fc-h text-[11px] font-bold tracking-[0.12em] uppercase text-[rgba(255,255,255,0.3)] mb-[20px]">Legal & Support</h4>
            <ul className="fc-links list-none flex flex-col gap-[10px]">
              <li><Link to="/about" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Help Center</Link></li>
              <li><Link to="/privacy" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-[13px] text-[rgba(255,255,255,0.45)] transition-colors hover:text-white">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bot flex flex-col md:flex-row items-center justify-between pt-[24px] border-t border-[rgba(255,255,255,0.07)] gap-[16px]">
          <div className="footer-copy text-[12px] text-[rgba(255,255,255,0.25)]">
            © {new Date().getFullYear()} UniteOman. Connecting the Sultanate, one business at a time.
          </div>
          <div className="footer-social flex gap-[20px]">
            <a href="#" className="text-[12px] text-[rgba(255,255,255,0.3)] hover:text-white transition-colors">Instagram</a>
            <a href="#" className="text-[12px] text-[rgba(255,255,255,0.3)] hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-[12px] text-[rgba(255,255,255,0.3)] hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
