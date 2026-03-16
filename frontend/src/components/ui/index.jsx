import { Link } from 'react-router-dom'
import { useState } from 'react'
import BookingModal from './BookingModal'
import { 
  Utensils, Car, ShoppingBag, Stethoscope, Building2, Laptop, Briefcase, Wrench, Sparkles, Phone,
  MapPin, Landmark, Palmtree, Mountain, Waves, Compass, CloudRain
} from 'lucide-react'

const CATEGORY_ICONS = {
  'restaurants': Utensils,
  'automotive': Car,
  'retail': ShoppingBag,
  'health': Stethoscope,
  'real-estate': Building2,
  'it-software': Laptop,
  'services': Wrench,
  'beauty': Sparkles,
  'telecom': Phone,
}

const GOVERNORATE_ICONS = {
  'muscat': Building2,
  'dhofar': Palmtree,
  'musandam': Waves,
  'al-buraymi': Landmark,
  'ad-dakhiliyah': Mountain,
  'al-batinah-north': Compass,
  'al-batinah-south': Compass,
  'ash-sharqiyah-north': CloudRain,
  'ash-sharqiyah-south': Waves,
  'adh-dhahirah': Mountain,
  'al-wusta': Palmtree,
}

// ── BusinessCard ──────────────────────────────────────────────
export function BusinessCard({ business }) {
  const [showBooking, setShowBooking] = useState(false)
  const { name_en, slug, category, governorate,
    cover_image_url, listing_type, is_verified, plan,
    rating_avg, rating_count, tags = [] } = business

  const priceRange = plan === 'enterprise' ? 'OMR 50–200' : plan === 'professional' ? 'OMR 10–80' : null
  const starsFull = Math.round(rating_avg || 0)

  return (
    <>
      <div className="group bg-white border-[1.5px] border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-pink/40 hover:shadow-xl flex flex-col">
        <Link to={`/business/${slug}`} className="block">
          <div className="h-44 bg-gray-100 relative overflow-hidden">
            {cover_image_url
              ? <img src={cover_image_url} alt={name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              : <div className="w-full h-full flex items-center justify-center text-ink/20" style={{ background: 'linear-gradient(135deg,#EDE5F7,#FCE8F1)' }}>
                  {(() => {
                    const CatIcon = category ? (CATEGORY_ICONS[category.slug] || Briefcase) : Briefcase;
                    return <CatIcon size={48} strokeWidth={1.5} />
                  })()}
                </div>
            }
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
              {is_verified && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-600/90 text-white">✓ Verified</span>}
              {listing_type !== 'standard' && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: 'linear-gradient(90deg,#E8B84B,#D97706)' }}>
                  ⭐ {listing_type === 'sponsored' ? 'Sponsored' : 'Featured'}
                </span>
              )}
            </div>
            {priceRange && (
              <div className="absolute bottom-2.5 right-2.5 bg-ink/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">{priceRange}</div>
            )}
          </div>
        </Link>
        <div className="p-4 flex flex-col flex-1">
          <Link to={`/business/${slug}`} className="flex-1">
            {category && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase mb-1 brand-text">
                {(() => {
                  const CatIcon = CATEGORY_ICONS[category.slug] || Briefcase;
                  return <CatIcon size={12} strokeWidth={2.5} />
                })()}
                {category.name_en}
              </div>
            )}
            <h3 className="text-base font-bold text-ink mb-1 leading-snug">{name_en}</h3>
            {rating_count > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex">{[1,2,3,4,5].map(n => <span key={n} className={`text-sm ${n <= starsFull ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}</div>
                <span className="text-sm font-bold text-ink">{Number(rating_avg).toFixed(1)}</span>
                <span className="text-xs text-gray-400">({rating_count})</span>
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 3).map(t => <span key={t} className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>)}
              </div>
            )}
            {governorate && <div className="text-xs text-gray-400">📍 {governorate.name_en}</div>}
          </Link>
          <button onClick={() => setShowBooking(true)}
            className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#1B5E3B,#2D7A55)' }}>
            View &amp; Book
          </button>
        </div>
      </div>
      {showBooking && <BookingModal business={business} onClose={() => setShowBooking(false)} />}
    </>
  )
}

// ── CategoryIconCard (flat cards from screenshot 1) ───────────
const CAT_COLORS = ['#FCE8F1','#DBEAFE','#FEF3C7','#D1FAE5','#FEF9C3','#EDE5F7','#CFFAFE','#FEF0EA','#FFE4E6','#E0E7FF','#CCFBF1','#ECFCCB']

export function CategoryIconCard({ category, index = 0 }) {
  const { name_en, slug, business_count } = category
  const Icon = CATEGORY_ICONS[slug] || Briefcase

  return (
    <Link to={`/businesses?category=${slug}`}
      className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 text-ink"
        style={{ background: CAT_COLORS[index % CAT_COLORS.length] }}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-ink text-sm mb-0.5">{name_en}</h3>
      <p className="text-xs text-gray-400 font-medium">{business_count} businesses</p>
    </Link>
  )
}

// ── CategoryCard (image bg version) ──────────────────────────
export function CategoryCard({ category, large = false }) {
  const { name_en, name_ar, slug, cover_image_url, business_count } = category
  const Icon = CATEGORY_ICONS[slug] || Briefcase

  return (
    <Link to={`/businesses?category=${slug}`}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer block transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${large ? 'min-h-[240px]' : 'aspect-[4/3]'}`}>
      <div className="absolute inset-0 bg-gray-800" style={cover_image_url ? { backgroundImage:`url(${cover_image_url})`,backgroundSize:'cover',backgroundPosition:'center' } : {}} />
      <div className="absolute inset-0" style={{ background:'linear-gradient(165deg,rgba(10,6,20,.1) 0%,rgba(10,6,20,.72) 100%)' }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:'rgba(232,49,122,.08)' }} />
      <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs group-hover:bg-pink group-hover:border-pink transition-all">↗</button>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className={`bg-white/15 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center mb-2 text-white ${large ? 'w-11 h-11' : 'w-9 h-9'}`}>
          <Icon size={large ? 20 : 16} strokeWidth={1.5} />
        </div>
        <h3 className={`font-bold text-white leading-tight mb-0.5 ${large ? 'text-xl' : 'text-sm'}`}>{name_en}</h3>
        {name_ar && <p className="text-xs text-white/45 mb-1">{name_ar}</p>}
        <p className="text-xs text-white/60 font-semibold">{business_count}+ businesses</p>
      </div>
    </Link>
  )
}

// ── GovernorateIconCard (for Governorates page) ───────────
export function GovernorateIconCard({ governorate, index = 0 }) {
  const { name_en, name_ar, slug, business_count } = governorate
  const Icon = GOVERNORATE_ICONS[slug] || MapPin

  return (
    <Link to={`/businesses?governorate=${slug}`}
      className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 text-ink"
        style={{ background: CAT_COLORS[index % CAT_COLORS.length] }}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-ink text-sm mb-0.5">{name_en}</h3>
      <p className="text-[10px] text-purple font-bold tracking-tight mb-1 uppercase opacity-60">{name_ar}</p>
      <p className="text-xs text-gray-400 font-medium">{business_count || 0} businesses</p>
    </Link>
  )
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ className = '' }) {
  return <div className={`inline-block w-6 h-6 rounded-full border-2 border-gray-200 border-t-pink animate-spin ${className}`} />
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon = '🔍', title, description, action }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-ink mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button disabled={page === 1} onClick={() => onPage(page - 1)}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-pink/40 transition-all">← Prev</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)}
          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${p === page ? 'text-white' : 'border border-gray-200 hover:border-pink/40'}`}
          style={p === page ? { background:'linear-gradient(90deg,#E8317A,#5B2D8E)' } : {}}>
          {p}
        </button>
      ))}
      <button disabled={page === pages} onClick={() => onPage(page + 1)}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-pink/40 transition-all">Next →</button>
    </div>
  )
}
