import { 
  ShieldCheck, 
  Zap, 
  Globe, 
  Star, 
  Sparkles, 
  Wrench, 
  HeartPulse, 
  Brush, 
  Monitor, 
  Package, 
  PartyPopper, 
  GraduationCap,
  Utensils,
  Briefcase,
  Stethoscope,
  Pill,
  Key,
  Store,
  Smartphone,
  Building2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'

const CATEGORY_ICONS = {
  restaurants: Utensils,
  cleaning: Brush,
  repairing: Wrench,
  health: HeartPulse,
  beauty: Sparkles,
  technical: Monitor,
  moving: Package,
  events: PartyPopper,
  education: GraduationCap,
  clinic: Stethoscope,
  pharmacy: Pill,
  'car-rental': Key,
  'car-repair': Wrench,
  supermarket: Store,
  electronic: Smartphone,
  'it-company': Briefcase
}

export function CategoryGrid() {
  const navigate = useNavigate()

  // Fetch only top-level categories (parent_id = 0 means null parent)
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'top-level'],
    queryFn: () => categoryApi.list(null, 0, null)
  })

  return (
    <section className="cats py-[88px]">
      <div className="c">
        <h2 className="font-['Bricolage_Grotesque'] text-[32px] font-bold text-center mb-[12px]">Browse by Category</h2>
        <div className="cats-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[16px] mt-[48px]">
          {categories.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.slug] || Briefcase
            const linkTo = cat.has_children
              ? `/categories?parent_slug=${cat.slug}&name=${encodeURIComponent(cat.name_en)}`
              : `/businesses?category=${cat.slug}`

            return (
              <div key={cat.id}
                onClick={() => navigate(linkTo)}
                className="cat border-[1.5px] border-[var(--line)] rounded-[var(--r)] p-[24px_14px] text-center cursor-pointer tr bg-white hover:border-[var(--brand)] hover-lift group">
                <div className="cat-ico w-[56px] h-[56px] rounded-[16px] flex items-center justify-center mx-auto mb-[14px] tr group-hover:scale-[1.15] bg-[var(--bg)] text-[var(--brand)]">
                  <Icon size={28} strokeWidth={2.2} />
                </div>
                <div className="cat-name text-[14px] font-bold text-[var(--ink)] mb-[3px] tr group-hover:text-[var(--brand)]">{cat.name_en}</div>
                <div className="cat-cnt text-[12px] text-[var(--dim)] font-bold uppercase tracking-wider">
                  {cat.has_children ? 'Browse →' : `${cat.business_count || 0} listings`}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function WhySection() {
  const items = [
    { ico: ShieldCheck, t: 'Verified Pros', d: 'Every business is manually checked for quality and reliability.' },
    { ico: Zap, t: 'Instant Booking', d: 'Connect directly via WhatsApp and get quotes in minutes.' },
    { ico: Globe, t: 'Oman Wide', d: 'Services available across all governorates, from Muscat to Salalah.' },
    { ico: Star, t: 'Top Rated', d: 'Read genuine reviews from thousands of happy customers.' }
  ]

  return (
    <section className="why py-[100px] bg-[#F9F9F8] rv">
      <div className="c grid md:grid-cols-2 gap-[40px] md:gap-[100px] items-center">
        <div>
          <div className="why-label text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--brand)] mb-[16px]">Why choose UniteOman</div>
          <h2 className="why-h font-['Bricolage_Grotesque',sans-serif] text-[clamp(32px,4.5vw,52px)] font-bold text-[var(--ink)] leading-[1.0] tracking-[-0.04em] mb-[24px]">
            The smarter way <br />to <em className="not-italic text-[var(--brand)]">hire locally.</em>
          </h2>
          <p className="why-sub text-[16px] text-[var(--mid)] font-medium leading-[1.8] mb-[32px] max-w-[480px]">
            We bridge the gap between skilled professionals and homeowners across the Sultanate. No more searching through random, unverified directories.
          </p>
        </div>
        <div className="why-items grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
          {items.map((item, i) => {
            const Icon = item.ico;
            return (
              <div key={i} className={`why-item p-[24px] bg-white rounded-[var(--r)] border border-[var(--line)] shadow-sm hover:shadow-md tr hover-lift rv d${(i + 1) * 2}`}>
                <div className="why-item-ico text-[var(--brand)] mb-[12px] tr group-hover:scale-110">
                  <Icon size={26} strokeWidth={2.5} />
                </div>
                <div className="why-item-t text-[15px] font-bold text-[var(--ink)] mb-[6px]">{item.t}</div>
                <div className="why-item-d text-[13px] text-[var(--mid)] leading-[1.7] font-medium">{item.d}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Testimonials() {
  const row1 = [
    { name: 'Fatma Al Hashmi', loc: 'Muscat', text: '“Found a great AC technician within minutes. The WhatsApp integration is so convenient!”' },
    { name: 'Ahmed Al Balushi', loc: 'Sohar', text: '“The deep cleaning service I booked was professional and very thorough. Highly recommend!”' },
    { name: 'Sara Bin Salim', loc: 'Salalah', text: '“Excellent directory for finding reliable workers. Saved me a lot of time.”' },
    { name: 'Mohammed Ali', loc: 'Nizwa', text: '“Super fast and easy to navigate. I found a mechanic in my area instantly.”' },
    { name: 'Aisha Al Kiyumi', loc: 'Seeb', text: '“Love the user interface and how simple it is to filter out exactly what I need!”' },
  ]

  const row2 = [
    { name: 'Khaled Al Busaidi', loc: 'Sur', text: '“A game-changer for finding home services. Everything is verified and trustworthy.”' },
    { name: 'Muna Al Hosni', loc: 'Rustaq', text: '“I needed an emergency plumber and found someone within 10 minutes. Fantastic app!”' },
    { name: 'Tariq Al Zadjali', loc: 'Muscat', text: '“The best place to discover local Omani businesses. Great job on the design.”' },
    { name: 'Zainab Al Abri', loc: 'Ibra', text: '“Booking a spa appointment was incredibly easy. Will use this platform again!”' },
    { name: 'Said Al Ghafri', loc: 'Ibri', text: '“Very helpful for finding IT support for my small business. Five stars!”' },
  ]

  const renderCard = (t, idx) => (
    <div key={idx} className="w-[320px] md:w-[400px] shrink-0 p-[28px] border border-[var(--line)] rounded-[var(--r)] bg-white text-left shadow-sm hover:border-[var(--brand)] transition-colors duration-300 mx-[10px]">
      <div className="text-[#F59E0B] text-[14px] tracking-[2px] mb-[12px]">★★★★★</div>
      <p className="text-[14px] text-[var(--mid)] font-medium leading-[1.7] italic mb-[20px]">
        {t.text}
      </p>
      <div className="flex items-center gap-[12px]">
        <div className="w-[36px] h-[36px] rounded-full bg-[var(--grad)] flex items-center justify-center text-[13px] font-bold text-white shadow-sm">
          {t.name[0]}
        </div>
        <div>
          <div className="text-[13px] font-bold text-[var(--ink)]">{t.name}</div>
          <div className="text-[10px] text-[var(--dim)] font-black uppercase tracking-widest">{t.loc}</div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="testi py-[100px] bg-[#FDFDFD] overflow-hidden">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left { animation: marquee-left 40s linear infinite; }
        .animate-scroll-right { animation: marquee-right 40s linear infinite; }
        .marquee-container:hover .animate-scroll-left,
        .marquee-container:hover .animate-scroll-right {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="text-center mb-[64px] px-4 flex flex-col items-center">
        <div className="inline-flex items-center justify-center gap-[8px] bg-pink/10 text-pink text-[12px] font-bold px-[16px] py-[8px] rounded-full tracking-widest uppercase mb-[20px]">
          <Star size={14} fill="currentColor" /> Highly Rated
        </div>
        <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(36px,5vw,56px)] font-black text-[var(--ink)] tracking-[-0.04em] leading-[1.1]">
          Over <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8317A] to-[#8E2DE2]">1,000+</span>
          <br /> trusted customers
        </h2>
        <p className="text-[16px] text-[var(--mid)] font-medium mt-[16px] max-w-[450px]">
          See why thousands of homeowners and businesses across Oman love using our platform every day.
        </p>
      </div>

      <div className="marquee-container flex flex-col gap-[20px] relative w-full left-0">
        {/* Gradients for smooth fade-in / fade-out on the edges */}
        <div className="absolute inset-y-0 left-0 w-[100px] lg:w-[200px] bg-gradient-to-r from-[#FDFDFD] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-[100px] lg:w-[200px] bg-gradient-to-l from-[#FDFDFD] to-transparent z-10 pointer-events-none"></div>

        {/* Row 1 (Moving Left) */}
        <div className="flex w-max animate-scroll-left">
          {[...row1, ...row1].map((t, i) => renderCard(t, `r1-${i}`))}
        </div>

        {/* Row 2 (Moving Right) */}
        <div className="flex w-max animate-scroll-right">
          {[...row2, ...row2].map((t, i) => renderCard(t, `r2-${i}`))}
        </div>
      </div>
    </section>
  )
}

export function CTABand() {
  return (
    <section className="cta bg-[var(--ink)] py-[100px] text-center border-t border-[rgba(255,255,255,0.05)] overflow-hidden">
      <div className="c rv">
        <div className="cta-label text-[12px] font-bold tracking-[0.3em] uppercase text-[rgba(255,255,255,0.35)] mb-[24px]">Grow your business</div>
        <h2 className="cta-h font-['Bricolage_Grotesque',sans-serif] text-[clamp(36px,5vw,64px)] font-bold text-white leading-[1.0] tracking-[-0.05em] mb-[20px]">
          Are you a professional <br />providing <em className="not-italic text-[var(--brand)]">expert services?</em>
        </h2>
        <p className="cta-sub text-[18px] text-[rgba(255,255,255,0.45)] font-medium mb-[48px] max-w-[640px] mx-auto leading-[1.6]">
          Join 10,000+ businesses and reach more customers in your governorate today.
        </p>
        <div className="cta-acts flex gap-[16px] justify-center flex-wrap">
          <button className="cta-btn-w bg-white text-[var(--ink)] py-[16px] px-[40px] rounded-full text-[15px] font-bold tr hover:scale-[1.05] active:scale-[0.98] shadow-xl hover:shadow-white/10 animate-[pulse-subtle_3s_infinite_ease-in-out]">Register as Professional</button>
          <button className="cta-btn-o bg-transparent text-white border-[1.5px] border-[rgba(255,255,255,0.15)] py-[16px] px-[40px] rounded-full text-[15px] font-bold tr hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.4)] active:scale-[0.98]">Advertising Pricing</button>
        </div>
      </div>
    </section>
  )
}
