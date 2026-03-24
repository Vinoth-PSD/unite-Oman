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
  const { name_en, slug, category, governorate,
    cover_image_url, logo_url, listing_type, is_verified, plan,
    rating_avg, rating_count, tags: rawTags } = business
  const tags = rawTags || []

  const priceRange = plan === 'enterprise' ? 'OMR 50–200' : plan === 'professional' ? 'OMR 10–80' : null
  const starsFull = Math.round(rating_avg || 0)

  const bgImg = cover_image_url || logo_url;
  const imgSrc = bgImg ? (bgImg.startsWith('/') ? import.meta.env.VITE_API_URL + bgImg : bgImg) : null;

  return (
    <Link to={`/business/${slug}`} className="block">
      <div className="card hover:cursor-pointer">
        <div className="card-img">
          {imgSrc ? (
            <img src={imgSrc} alt={name_en} />
          ) : (
            <div className="card-placeholder">🏢</div>
          )}
          {is_verified && <div className="cv">✓ Verified</div>}
          {listing_type === 'sponsored' && <div className="cp">Sponsored</div>}
          {listing_type === 'featured' && <div className="cf">Featured</div>}
        </div>
        <div className="card-body">
          {category && <div className="card-cat">{category.name_en}</div>}
          <div className="card-name">{name_en}</div>
          
          <div className="card-rating">
            <div className="card-stars">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`star ${n <= starsFull ? 'on' : 'off'}`}>★</span>
              ))}
            </div>
            {rating_count > 0 && <span className="card-rv">{Number(rating_avg).toFixed(1)}</span>}
            <span className="card-rc">({rating_count || 0})</span>
          </div>
          
          {tags.length > 0 && (
            <div className="card-tags">
              {tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
          
          <div className="card-loc">📍 {governorate ? governorate.name_en : 'Oman'} {priceRange && `• ${priceRange}`}</div>
          
          <div className="card-cta">View &amp; Book</div>
        </div>
      </div>
    </Link>
  )
}

// ── CategoryIconCard (flat cards from screenshot 1) ───────────
const CAT_COLORS = ['#FCE8F1','#DBEAFE','#FEF3C7','#D1FAE5','#FEF9C3','#EDE5F7','#CFFAFE','#FEF0EA','#FFE4E6','#E0E7FF','#CCFBF1','#ECFCCB']

export function CategoryIconCard({ category, index = 0 }) {
  const { id, name_en, slug, business_count, has_children } = category
  const Icon = CATEGORY_ICONS[slug] || Briefcase

  // If this category has subcategories, link to the subcategory listing page
  const linkTo = has_children
    ? `/categories?parent_slug=${slug}&name=${encodeURIComponent(name_en)}`
    : `/businesses?category=${slug}`

  return (
    <Link to={linkTo}
      className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 text-ink"
        style={{ background: CAT_COLORS[index % CAT_COLORS.length] }}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-ink text-sm mb-0.5">{name_en}</h3>
      {has_children && <p className="text-[9px] uppercase tracking-widest font-bold text-pink mb-0.5">Explore →</p>}
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
        {business_count || 0} {business_count === 1 ? 'Business' : 'Businesses'}
      </p>
    </Link>
  )
}

// ── CategoryCard (image bg version) ──────────────────────────
export function CategoryCard({ category, large = false }) {
  const { name_en, name_ar, slug, cover_image_url, business_count, has_children } = category
  const Icon = CATEGORY_ICONS[slug] || Briefcase

  const linkTo = has_children
    ? `/categories?parent_slug=${slug}&name=${encodeURIComponent(name_en)}`
    : `/businesses?category=${slug}`

  return (
    <Link to={linkTo}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer block transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${large ? 'min-h-[240px]' : 'aspect-[4/3]'}`}>
      <div className="absolute inset-0 bg-gray-800" 
        style={cover_image_url ? { 
          backgroundImage:`url(${cover_image_url.startsWith('/') ? import.meta.env.VITE_API_URL + cover_image_url : cover_image_url})`,
          backgroundSize:'cover',
          backgroundPosition:'center' 
        } : {}} />
      <div className="absolute inset-0" style={{ background:'linear-gradient(165deg,rgba(10,6,20,.1) 0%,rgba(10,6,20,.72) 100%)' }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:'rgba(232,49,122,.08)' }} />
      <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs group-hover:bg-pink group-hover:border-pink transition-all">↗</button>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className={`bg-white/15 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center mb-2 text-white ${large ? 'w-11 h-11' : 'w-9 h-9'}`}>
          <Icon size={large ? 20 : 16} strokeWidth={1.5} />
        </div>
        <h3 className={`font-bold text-white leading-tight mb-0.5 ${large ? 'text-xl' : 'text-sm'}`}>{name_en}</h3>
        <p className="text-[10px] font-bold text-white/60 tracking-wider">
          {has_children ? 'Browse Subcategories →' : `${business_count || 0} ${business_count === 1 ? 'Shop' : 'Shops'}`}
        </p>
        {name_ar && <p className="text-xs text-white/45 mb-1">{name_ar}</p>}
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
      {name_ar && <p className="text-[10px] text-purple font-bold tracking-tight mb-1 uppercase opacity-60">{name_ar}</p>}
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
        {business_count || 0} {business_count === 1 ? 'Business' : 'Businesses'}
      </p>
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
    <div className="pag">
      <button className="pag-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>
        ← Prev
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} className={`pag-btn ${p === page ? 'on' : ''}`} onClick={() => onPage(p)}>
          {p}
        </button>
      ))}
      <button className="pag-btn" disabled={page === pages} onClick={() => onPage(page + 1)}>
        Next →
      </button>
    </div>
  )
}
