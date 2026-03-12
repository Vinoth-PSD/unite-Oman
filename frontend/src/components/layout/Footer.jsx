import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'

const cols = [
  { head: 'Directory', links: [['All Categories','/categories'],['Governorates','/governorates'],['Featured Listings','/businesses?listing_type=featured'],['Recently Added','/businesses?sort=newest'],['Top Rated','/businesses?sort=rating']] },
  { head: 'Business', links: [['List Your Business','/list-business'],['Pricing Plans','/pricing'],['Claim a Listing','/claim'],['Advertise With Us','/advertise']] },
  { head: 'Company', links: [['About Us','/about'],['Contact','/contact'],['Privacy Policy','/privacy'],['Terms of Use','/terms']] },
]

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-white/5 pt-12 pb-6">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-10">
          <div>
            <Logo />
            <p className="text-[11px] text-white/20 tracking-widest uppercase font-semibold mt-2 mb-3">Connecting Businesses</p>
            <p className="text-sm text-white/35 leading-relaxed max-w-[260px]">
              Oman's most trusted business directory — connecting customers with verified businesses across all 11 governorates.
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              {['#C8102E','#fff','#009150'].map(c => (
                <div key={c} className="h-[5px] w-[18px] rounded-sm" style={{ background: c }} />
              ))}
              <span className="text-[11px] text-white/20 font-semibold tracking-widest ml-2">PROUDLY OMANI 🇴🇲</span>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.head}>
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/30 mb-4">{col.head}</p>
              <ul className="space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-white/40 hover:text-white/80 transition-colors font-medium">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-5 border-t border-white/5">
          <p className="text-xs text-white/20 font-medium">© 2026 UniteOman. All rights reserved.</p>
          <div className="flex gap-2">
            {['in','f','𝕏','▶'].map(s => (
              <a key={s} href="#"
                className="w-8 h-8 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-white/30 hover:bg-pink/20 hover:text-pink/80 hover:border-pink/30 text-xs font-bold transition-all">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
