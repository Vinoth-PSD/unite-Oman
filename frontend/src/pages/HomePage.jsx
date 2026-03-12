import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, ChevronRight } from 'lucide-react'
import { businessApi, categoryApi, governorateApi } from '@/lib/api'
import { BusinessCard, CategoryCard, CategoryIconCard, Spinner } from '@/components/ui'

// ── Hero ──────────────────────────────────────────────────────
function Hero() {
  const [query, setQuery] = useState('')
  const [governorate, setGovernorate] = useState('All Oman')
  const navigate = useNavigate()
  const { data: govs = [] } = useQuery({ queryKey: ['governorates'], queryFn: governorateApi.list })

  const handleSearch = e => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (governorate !== 'All Oman') params.set('governorate', govs.find(g => g.name_en === governorate)?.slug || '')
    navigate(`/businesses?${params}`)
  }

  const quickTags = ['Construction','Healthcare','Legal','Real Estate','IT & Tech','Education']

  return (
    <section className="relative min-h-[92vh] flex items-center pt-16 overflow-hidden" style={{ background: '#0A0614' }}>
      {/* Mesh gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 70% 60% at 15% 60%, rgba(232,49,122,.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 85% 30%, rgba(91,45,142,.22) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 90%, rgba(240,90,40,.10) 0%, transparent 50%)`
      }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-60" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }} />

      <div className="max-w-[1240px] mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-14 items-center py-16">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-pink/10 border border-pink/25 rounded-full px-4 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse" />
              <span className="text-[11px] font-bold text-pink/80 tracking-[.12em] uppercase">Oman's No.1 Business Directory</span>
            </div>

            <h1 className="font-display text-[clamp(38px,5.5vw,64px)] font-normal leading-[1.08] text-white tracking-tight mb-3">
              Find the Right<br />
              Business, <em className="italic brand-text not-italic">Fast.</em>
            </h1>

            <p className="text-[15px] text-white/50 leading-relaxed max-w-[480px] mb-7">
              Discover and connect with 10,000+ verified businesses across all 11 governorates of Oman — from Muscat to Salalah.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex bg-white rounded-xl overflow-hidden shadow-2xl mb-3" style={{ boxShadow: '0 24px 64px rgba(91,45,142,.2)' }}>
              <div className="flex-1 flex items-center gap-2.5 px-4 border-r border-gray-200">
                <Search size={16} className="text-pink flex-shrink-0" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search businesses, services…"
                  className="flex-1 border-none outline-none text-sm text-ink py-3.5 bg-transparent placeholder-gray-400" />
              </div>
              <div className="flex items-center gap-2 px-3 min-w-[160px]">
                <MapPin size={14} className="text-purple flex-shrink-0" />
                <select value={governorate} onChange={e => setGovernorate(e.target.value)}
                  className="border-none outline-none bg-transparent text-sm text-ink font-semibold cursor-pointer py-3.5 flex-1">
                  <option>All Oman</option>
                  {govs.map(g => <option key={g.id}>{g.name_en}</option>)}
                </select>
              </div>
              <button type="submit" className="brand-btn px-7 text-sm font-bold tracking-wide">Search</button>
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-white/30 font-bold tracking-widest uppercase">Popular:</span>
              {quickTags.map(t => (
                <button key={t} onClick={() => navigate(`/businesses?q=${t}`)}
                  className="text-xs text-white/50 bg-white/7 border border-white/10 rounded-full px-3 py-1 font-semibold hover:bg-pink/15 hover:border-pink/35 hover:text-pink/80 transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Right — stats panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl overflow-hidden relative hidden lg:block">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#E8317A,#F05A28,#5B2D8E)' }} />
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
              <span className="text-xs font-bold text-white">Directory Overview</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/12 border border-emerald-400/25 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/5 m-px">
              {[['10K+','Businesses'],['11','Governorates'],['48','Categories'],['100%','Verified']].map(([n,l]) => (
                <div key={l} className="bg-[rgba(10,6,20,.4)] p-3.5 text-center">
                  <div className="font-display text-[26px] font-normal leading-none mb-1 brand-text">{n}</div>
                  <div className="text-[9px] font-bold tracking-widest uppercase text-white/40">{l}</div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3.5 space-y-2.5">
              {[['✅','Manually verified listings only'],['💬','WhatsApp direct contact'],['🌐','Arabic & English bilingual'],['📍','All 11 governorates covered']].map(([icon,text]) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-white/6 border border-white/9 flex items-center justify-center text-xs flex-shrink-0">{icon}</div>
                  <span className="text-xs text-white/60 font-medium">{text}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => navigate('/list-business')}
                className="w-full brand-btn py-2.5 rounded-lg text-sm font-bold">
                + List Your Business Free →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Trust Bar ─────────────────────────────────────────────────
function TrustBar() {
  const items = [['🏆','Oman\'s #1','business directory'],['✅','100%','verified listings'],['💬','WhatsApp','direct connect'],['📍','All 11','governorates covered'],['🌐','Arabic & English','support']]
  return (
    <div className="bg-[#1A1427] border-y border-white/5 py-4">
      <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-center gap-10 flex-wrap">
        {items.map(([icon, strong, rest], i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-sm text-white/45 font-medium"><strong className="text-white/80">{strong}</strong> {rest}</span>
            {i < items.length - 1 && <div className="hidden md:block w-px h-4 bg-white/10 ml-8" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stats ─────────────────────────────────────────────────────
function Stats() {
  return (
    <section className="py-12">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
          {[['10,000+','Verified Businesses Listed'],['11','Governorates Covered'],['48','Business Categories'],['50K+','Monthly Active Users']].map(([num, label]) => (
            <div key={label} className="bg-white px-6 py-7 text-center hover:bg-gray-50 transition-colors">
              <div className="font-display text-4xl font-normal mb-1.5 brand-text">{num}</div>
              <div className="text-sm text-gray-500 font-semibold">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Categories Grid ───────────────────────────────────────────
function CategoriesSection() {
  const { data: cats = [], isLoading } = useQuery({ queryKey: ['categories', true], queryFn: () => categoryApi.list(true) })
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="section-label mb-2">Browse by Industry</p>
            <h2 className="font-display text-[clamp(26px,3vw,38px)] font-normal text-ink tracking-tight">
              Explore <em className="italic text-purple">Every</em> Category
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">Trusted service providers across every major industry in Oman</p>
          </div>
          <a href="/categories" className="text-sm font-bold brand-text hidden md:flex items-center gap-1.5 hover:gap-3 transition-all">View all →</a>
        </div>

        {isLoading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cats.map((c, i) => <CategoryIconCard key={c.id} category={c} index={i} />)}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Why Section ───────────────────────────────────────────────
function WhySection() {
  const features = [
    ['✅','100% Verified Listings','Every business is manually reviewed and confirmed by our local Oman team before going live.'],
    ['💬','WhatsApp Direct Connect','Reach any business instantly via WhatsApp — the preferred communication channel across Oman.'],
    ['🌐','Arabic & English Bilingual','Full bilingual support. Search, browse and list in Arabic or English.'],
    ['📍','All 11 Governorates','From Muscat to Dhofar — complete coverage across every region of the Sultanate.'],
    ['⭐','Real Reviews & Ratings','Authentic customer reviews linked to verified accounts.'],
    ['🗺️','Map View & Directions','Find businesses near you with integrated maps and navigation.'],
  ]
  return (
    <section className="py-12">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="mb-7">
          <p className="section-label mb-2">Why UniteOman</p>
          <h2 className="font-display text-[clamp(26px,3vw,38px)] font-normal text-ink tracking-tight">
            Built for <em className="italic text-purple">Oman's</em> Market
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {features.map(([icon, title, desc]) => (
            <div key={title} className="group bg-white border-[1.5px] border-gray-100 rounded-2xl p-6 hover:-translate-y-1 hover:border-pink/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3.5 border border-pink/15" style={{ background: 'linear-gradient(135deg,#FCE8F1,#EDE5F7)' }}>{icon}</div>
              <h3 className="text-base font-bold text-ink mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Governorates ──────────────────────────────────────────────
function GovernoratesSection() {
  const { data: govs = [] } = useQuery({ queryKey: ['governorates'], queryFn: governorateApi.list })
  const navigate = useNavigate()
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="section-label mb-2">Browse by Location</p>
            <h2 className="font-display text-[clamp(26px,3vw,38px)] font-normal text-ink tracking-tight">
              All <em className="italic text-purple">11</em> Governorates
            </h2>
          </div>
          <a href="/governorates" className="text-sm font-bold brand-text hidden md:flex items-center gap-1.5 hover:gap-3 transition-all">View all →</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {govs.map(g => (
            <button key={g.id} onClick={() => navigate(`/businesses?governorate=${g.slug}`)}
              className="group bg-white border-[1.5px] border-gray-100 rounded-2xl p-5 text-center hover:-translate-y-1 hover:border-pink hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }} />
              <span className="text-2xl mb-2 block">{g.emoji}</span>
              <div className="text-sm font-bold text-ink mb-0.5">{g.name_en}</div>
              <div className="text-xs font-semibold text-purple mb-1">{g.name_ar}</div>
              <div className="text-[11px] text-gray-400 font-semibold">{g.business_count?.toLocaleString()}+ businesses</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Featured Listings ─────────────────────────────────────────
function FeaturedListings() {
  const { data: businesses = [], isLoading } = useQuery({ queryKey: ['featured'], queryFn: () => businessApi.featured(3) })
  return (
    <section className="py-12">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="section-label mb-2">Sponsored</p>
            <h2 className="font-display text-[clamp(26px,3vw,38px)] font-normal text-ink tracking-tight">
              Featured <em className="italic text-purple">Businesses</em>
            </h2>
          </div>
          <a href="/businesses?listing_type=sponsored" className="text-sm font-bold brand-text hidden md:flex items-center gap-1.5 hover:gap-3 transition-all">Browse all →</a>
        </div>
        {isLoading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {businesses.map(b => <BusinessCard key={b.id} business={b} />)}
          </div>
        )}
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    ['🔍','Search or Browse','Enter a service name or browse by category. Use the governorate filter to find what you need.'],
    ['📋','Compare & Decide','Read verified reviews, check ratings, view hours and contact details side by side.'],
    ['💬','Connect Directly','Call, email or tap WhatsApp to reach the business instantly — no middlemen.'],
  ]
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="mb-7">
          <p className="section-label mb-2">Simple Process</p>
          <h2 className="font-display text-[clamp(26px,3vw,38px)] font-normal text-ink tracking-tight">
            How It <em className="italic text-purple">Works</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
          <div className="hidden md:block absolute top-7 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-gray-200 z-0" />
          {steps.map(([icon, title, desc], i) => (
            <div key={title} className="bg-white border-[1.5px] border-gray-100 rounded-2xl p-6 relative z-10 hover:border-pink/30 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-display text-lg font-normal mb-4" style={{ background: 'linear-gradient(135deg,#E8317A,#5B2D8E)', boxShadow: '0 4px 16px rgba(232,49,122,.3)' }}>{i + 1}</div>
              <h3 className="text-base font-bold text-ink mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────
function Pricing() {
  const plans = [
    { name:'Basic', price:'0', desc:'Get your business found with a verified listing.', features:['Basic business listing','1 photo upload','Phone & WhatsApp contact','Listed in 1 category'], off:['Featured placement','Analytics dashboard','Priority support'], cta:'Get Started Free', featured: false },
    { name:'Professional', price:'15', desc:'Grow faster with featured placement and full analytics.', features:['Featured listing placement','Up to 10 photos','Phone, WhatsApp & Email','Up to 3 categories','Analytics dashboard','Review management'], off:['Priority support'], cta:'Start 14-Day Free Trial', featured: true },
    { name:'Enterprise', price:'45', desc:'Maximum visibility for established businesses.', features:['Top-of-results placement','Unlimited photos','All contact channels','Unlimited categories','Advanced analytics','Review management','Dedicated account manager'], off:[], cta:'Contact Sales', featured: false },
  ]
  return (
    <section className="py-12">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="mb-7">
          <p className="section-label mb-2">For Business Owners</p>
          <h2 className="font-display text-[clamp(26px,3vw,38px)] font-normal text-ink tracking-tight">
            Simple, Transparent <em className="italic text-purple">Pricing</em>
          </h2>
          <p className="text-sm text-gray-500 mt-1.5">Choose a plan that fits your business. Upgrade or cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-2xl p-6 relative transition-all hover:-translate-y-1 ${
              plan.featured
                ? 'shadow-xl hover:shadow-2xl'
                : 'bg-white border-[1.5px] border-gray-100 hover:shadow-lg'
            }`}
            style={plan.featured ? {
              background: 'white',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg,#E8317A,#5B2D8E)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 0 0 4px rgba(232,49,122,.08)'
            } : {}}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white px-4 py-1 rounded-full tracking-widest uppercase whitespace-nowrap" style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }}>Most Popular</div>
              )}
              {plan.featured && <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }} />}
              <p className="text-[11px] font-bold tracking-widest uppercase mb-2 brand-text">{plan.name}</p>
              <div className="font-display text-[38px] font-normal text-ink leading-none mb-1">
                <sup className="text-lg text-gray-400 align-top mt-2 inline-block">OMR</sup>{plan.price}
                <sub className="text-xs text-gray-400 font-sans font-medium">/mo</sub>
              </div>
              <p className="text-sm text-gray-500 mt-2 mb-4 leading-relaxed">{plan.desc}</p>
              <div className="h-px bg-gray-100 mb-4" />
              <ul className="space-y-2 mb-5">
                {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-gray-600 font-medium"><span className="text-xs font-bold brand-text">✓</span>{f}</li>)}
                {plan.off.map(f => <li key={f} className="flex items-center gap-2 text-sm text-gray-300 font-medium"><span className="text-xs text-gray-300">–</span>{f}</li>)}
              </ul>
              <button className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                plan.featured ? 'brand-btn' : 'border-[1.5px] border-gray-200 text-ink hover:border-pink/40 hover:text-pink'
              }`}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA Strip ─────────────────────────────────────────────────
function CtaStrip() {
  const navigate = useNavigate()
  return (
    <section className="py-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#3D1C63,#2A1050,#1A1427)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(232,49,122,.12) 0%,transparent 60%)' }} />
      <div className="max-w-[1240px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-pink/80 mb-2">For Business Owners</p>
          <h2 className="font-display text-[clamp(26px,3.5vw,42px)] font-normal text-white leading-tight">
            Ready to Grow Your<br/>Business <em className="italic brand-text">Across Oman?</em>
          </h2>
          <p className="text-sm text-white/40 mt-2">Join 10,000+ verified businesses already on UniteOman.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={() => navigate('/list-business')} className="bg-white text-purple-dark font-bold text-sm px-7 py-3 rounded-xl hover:bg-pink-light transition-all whitespace-nowrap">+ List Your Business Free</button>
          <button onClick={() => navigate('/pricing')} className="border-[1.5px] border-white/20 text-white/70 hover:border-white/50 hover:text-white font-bold text-sm px-7 py-3 rounded-xl transition-all whitespace-nowrap">View Pricing</button>
        </div>
      </div>
    </section>
  )
}

// ── Homepage ─────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Stats />
      <CategoriesSection />
      <WhySection />
      <GovernoratesSection />
      <FeaturedListings />
      <HowItWorks />
      <Pricing />
      <CtaStrip />
    </>
  )
}
