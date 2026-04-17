import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronDown, Sparkles, X, Utensils, Car, ShoppingBag, Stethoscope, Building2, Laptop, Briefcase, Wrench, Phone, Pill, Key, Store, Smartphone } from 'lucide-react'
import { businessApi, categoryApi, governorateApi } from '@/lib/api'
import { BusinessCard, Spinner, EmptyState, Pagination } from '@/components/ui'
import toast from 'react-hot-toast'

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
  'clinic': Stethoscope,
  'pharmacy': Pill,
  'car-rental': Key,
  'car-repair': Wrench,
  'supermarket': Store,
  'electronic': Smartphone,
  'it-company': Building2
}

// ── AI Pick feature ───────────────────────────────────────────
function AiPickModal({ businesses, onClose }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!businesses?.length) { toast.error('No businesses to analyse'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai-search/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businesses: businesses.slice(0, 5) })
      })
      const data = await res.json()
      setResult(data.recommendation || 'Unable to generate recommendation.')
    } catch {
      setResult('Unable to generate AI recommendation at this time.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generate() }, [])

  return (
    <div className="modal-bg open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">✨ AI Pick</div>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="ai-dots">
              <div className="ai-dot"></div><div className="ai-dot"></div><div className="ai-dot"></div>
            </div>
          ) : (
            <>
              <div dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--ink)">$1</strong>') }} />
              <button className="regen-btn" onClick={generate}>Regenerate</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BusinessListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showAiPick, setShowAiPick] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  const q           = searchParams.get('q') || ''
  const category    = searchParams.get('category') || ''
  const governorate = searchParams.get('governorate') || ''
  const sort        = searchParams.get('sort') || 'featured'
  const page        = parseInt(searchParams.get('page') || '1')

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    if (key !== 'page') p.set('page', '1')
    setSearchParams(p)
  }

  const { data: cats = [] }  = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
    staleTime: 5 * 60 * 1000,   // categories don't change — cache 5 min
  })
  const { data: govs = [] }  = useQuery({
    queryKey: ['governorates'],
    queryFn: governorateApi.list,
    staleTime: 10 * 60 * 1000,  // governorates never change — cache 10 min
  })
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['businesses', q, category, governorate, sort, page],
    queryFn: () => businessApi.list({ q, category, governorate, sort, page, per_page: 12 }),
    placeholderData: (prev) => prev,  // React Query v5: keep previous page while fetching next
    staleTime: 30_000,                // 30s — avoids refetch on quick back-navigation
  })

  const businesses = data?.items || []
  const total      = data?.total || 0
  const pages      = data?.pages || 1

  const activeCategory = cats.find(c => c.slug === category)
  const subcategories = category ? cats.filter(c => c.parent_id === activeCategory?.id) : []

  const handleCategoryClick = (cat) => {
    if (cat.has_children) {
      navigate(`/categories?parent_slug=${cat.slug}&name=${encodeURIComponent(cat.name_en)}`)
    } else {
      setParam('category', cat.slug)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: '60px' }}>
      {/* ── FILTER BAR ── */}
      <div className="fbar">
        <div className="fbar-inner">
          <div className="search-box">
            <Search className="search-icon" size={15} />
            <input 
              className="search-inp" 
              defaultValue={q}
              onKeyDown={e => { if (e.key === 'Enter') setParam('q', e.target.value) }}
              placeholder="Search businesses..." 
            />
            {q && (
              <button className="search-x show" onClick={() => setParam('q', '')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="dd-wrap hide-mobile">
            <select className="dd" value={governorate} onChange={e => setParam('governorate', e.target.value)}>
              <option value="">All Oman</option>
              {govs.map(g => <option key={g.id} value={g.slug}>{g.name_en}</option>)}
            </select>
            <ChevronDown className="dd-arr" size={13} />
          </div>

          <div className="dd-wrap hide-mobile">
            <select className="dd" value={sort} onChange={e => setParam('sort', e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="rating">Sort: Rating</option>
              <option value="newest">Sort: Newest</option>
              <option value="name">Sort: A–Z</option>
            </select>
            <ChevronDown className="dd-arr" size={13} />
          </div>
          
          <button className="ai-btn md:hidden flex" onClick={() => setShowDrawer(true)}>
            <Wrench size={14} /> <span className="label">Filters</span>
          </button>

          <button className="ai-btn" onClick={() => setShowAiPick(true)}>
            <span className="sp">✨</span> <span className="label">AI Pick</span>
          </button>
        </div>
      </div>

      {/* ── PILLS BAR ── */}
      <div className="pbar">
        <div className="pbar-inner">
          <button className={`pill ${!category ? 'on' : ''}`} onClick={() => setParam('category', '')}>
            All
          </button>
          {cats.filter(c => !c.parent_id).map(c => (
            <button key={c.id} className={`pill ${category === c.slug ? 'on' : ''}`} onClick={() => handleCategoryClick(c)}>
              {c.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="content">
        <div className="rhead">
          <div className="flex-1">
            <h1 className="r-title">{activeCategory ? activeCategory.name_en : 'All Services'}</h1>
            <p className="r-sub">{total.toLocaleString()} {total === 1 ? 'business' : 'businesses'} in Oman</p>
            
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {subcategories.map(sub => (
                  <button 
                    key={sub.id} 
                    onClick={() => setParam('category', sub.slug)}
                    className="px-4 py-2 rounded-full border border-[var(--line)] bg-white text-[13px] font-bold text-[var(--mid)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-all flex items-center gap-2"
                  >
                    {sub.name_en}
                    <span className="text-[10px] bg-[var(--bg)] px-1.5 py-0.5 rounded-md text-[var(--dim)]">{sub.business_count || 0}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {(q || category || governorate || sort !== 'featured') && (
            <button className="r-clear" onClick={() => setSearchParams({})}>
              Clear filters
            </button>
          )}
        </div>

        <div className="biz-grid" style={{ opacity: isFetching && !isLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="skel-card">
                <div className="skel skel-img"></div>
                <div className="skel-body">
                  <div className="skel skel-line w80"></div>
                  <div className="skel skel-line w60"></div>
                  <div className="skel skel-btn"></div>
                </div>
              </div>
            ))
          ) : businesses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="empty">
                <div className="empty-ico">🔍</div>
                <h3 className="empty-title">No businesses found</h3>
                <p className="empty-sub">Try adjusting your search or filters.</p>
                <button className="empty-btn" onClick={() => setSearchParams({})}>Clear Filters</button>
              </div>
            </div>
          ) : (
            businesses.map(b => <BusinessCard key={b.id} business={b} />)
          )}
        </div>

        {!isLoading && businesses.length > 0 && (
          <Pagination page={page} pages={pages} onPage={p => setParam('page', p)} />
        )}
      </div>

      {showAiPick && <AiPickModal businesses={businesses} onClose={() => setShowAiPick(false)} />}

      {/* ── MOBILE DRAWER ── */}
      <div className={`drawer ${showDrawer ? 'open' : ''}`}>
        <div className="drawer-bg" onClick={() => setShowDrawer(false)}></div>
        <div className="drawer-panel" style={{ transform: showDrawer ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div className="drawer-handle"></div>
          <h3 className="drawer-title">Filters</h3>
          
          <div className="drawer-label">Location</div>
          <select className="drawer-dd" value={governorate} onChange={e => setParam('governorate', e.target.value)}>
            <option value="">All Oman</option>
            {govs.map(g => <option key={g.id} value={g.slug}>{g.name_en}</option>)}
          </select>

          <div className="drawer-label">Sort By</div>
          <select className="drawer-dd" value={sort} onChange={e => setParam('sort', e.target.value)}>
            <option value="featured">Featured</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="name">A-Z</option>
          </select>

          <button className="drawer-apply" onClick={() => setShowDrawer(false)}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

