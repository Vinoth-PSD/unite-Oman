import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronDown, Sparkles, X, Utensils, Car, ShoppingBag, Stethoscope, Building2, Laptop, Briefcase, Wrench, Phone } from 'lucide-react'
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
}

// ── AI Pick feature ───────────────────────────────────────────
function AiPickModal({ businesses, onClose }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!businesses?.length) { toast.error('No businesses to analyse'); return }
    setLoading(true)
    try {
      const list = businesses.slice(0, 5).map(b =>
        `- ${b.name_en}: rating ${b.rating_avg || 'N/A'}, ${b.rating_count || 0} reviews, plan: ${b.plan}, verified: ${b.is_verified}`
      ).join('\n')

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a helpful Oman business directory assistant. Based on these businesses, recommend the single best pick and explain why in 2–3 sentences. Be direct and helpful.\n\nBusinesses:\n${list}\n\nGive your top pick and a brief reason. Format: "**[Business Name]** — [reason]"`
          }]
        })
      })
      const data = await res.json()
      setResult(data.content?.find(b => b.type === 'text')?.text || 'Unable to generate recommendation.')
    } catch {
      setResult('Unable to generate AI recommendation at this time.')
    } finally {
      setLoading(false)
    }
  }

  useState(() => { generate() }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,10,26,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg,#EDE5F7,#FCE8F1)' }}>🤖</div>
            <h3 className="font-display text-lg font-normal text-ink">AI Pick</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><X size={13} /></button>
        </div>
        {loading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple/30 border-t-purple animate-spin" />
            <p className="text-sm text-gray-400">Analysing businesses…</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-ink">$1</strong>') }} />
            <button onClick={generate} className="mt-4 text-xs text-gray-400 hover:text-gray-500 underline">Regenerate</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BusinessListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showAiPick, setShowAiPick] = useState(false)

  const q           = searchParams.get('q') || ''
  const category    = searchParams.get('category') || ''
  const governorate = searchParams.get('governorate') || ''
  const sort        = searchParams.get('sort') || 'featured'
  const page        = parseInt(searchParams.get('page') || '1')

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.set('page', '1')
    setSearchParams(p)
  }

  const { data: cats = [] }  = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })
  const { data: govs = [] }  = useQuery({ queryKey: ['governorates'], queryFn: governorateApi.list })
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['businesses', q, category, governorate, sort, page],
    queryFn: () => businessApi.list({ q, category, governorate, sort, page, per_page: 12 }),
    keepPreviousData: true
  })

  const businesses = data?.items || []
  const total      = data?.total || 0
  const pages      = data?.pages || 1

  const activeCategory = cats.find(c => c.slug === category)

  return (
    <div className="min-h-screen pt-16" style={{ background: '#F5F2EC' }}>
      {/* Search + filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input defaultValue={q}
                onKeyDown={e => { if (e.key === 'Enter') setParam('q', e.target.value) }}
                placeholder="Search businesses..."
                className="flex-1 border-none outline-none text-sm text-ink bg-transparent placeholder-gray-400" />
            </div>

            {/* Category dropdown */}
            <div className="relative">
              <select value={category} onChange={e => setParam('category', e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm font-semibold text-ink cursor-pointer hover:border-gray-300 transition-all outline-none">
                <option value="">All Categories</option>
                {cats.map(c => <option key={c.id} value={c.slug}>{c.name_en}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Governorate dropdown */}
            <div className="relative">
              <select value={governorate} onChange={e => setParam('governorate', e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm font-semibold text-ink cursor-pointer hover:border-gray-300 transition-all outline-none">
                <option value="">All Oman</option>
                {govs.map(g => <option key={g.id} value={g.slug}>{g.name_en}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select value={sort} onChange={e => setParam('sort', e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm font-semibold text-ink cursor-pointer hover:border-gray-300 transition-all outline-none">
                <option value="featured">Sort: Featured</option>
                <option value="rating">Sort: Rating</option>
                <option value="newest">Sort: Newest</option>
                <option value="name">Sort: A–Z</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* AI Pick button */}
            <button onClick={() => setShowAiPick(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#C5963A,#E8B84B)' }}>
              🤖 AI Pick
            </button>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setParam('category', '')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !category ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
              style={!category ? { background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' } : {}}>
              All
            </button>
            {cats.map(c => (
              <button key={c.id} onClick={() => setParam('category', c.slug)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  category === c.slug ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
                style={category === c.slug ? { background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' } : {}}>
                {(() => { const Icon = CATEGORY_ICONS[c.slug] || Briefcase; return <Icon size={14} strokeWidth={2} /> })()} {c.name_en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1240px] mx-auto px-6 py-6">
        {/* Result count */}
        <div className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-1.5 flex-wrap">
          {isLoading ? 'Searching…' : `${total.toLocaleString()} result${total !== 1 ? 's' : ''} found`}
          {activeCategory && <span className="text-ink font-bold flex items-center gap-1"> in {(() => { const Icon = CATEGORY_ICONS[activeCategory.slug] || Briefcase; return <Icon size={16} strokeWidth={2} /> })()} {activeCategory.name_en}</span>}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
        ) : businesses.length === 0 ? (
          <EmptyState icon="🔍" title="No businesses found"
            description="Try adjusting your search or filters"
            action={
              <button onClick={() => setSearchParams({})}
                className="brand-btn px-6 py-2.5 rounded-xl text-sm font-bold">
                Clear Filters
              </button>
            } />
        ) : (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              {businesses.map(b => <BusinessCard key={b.id} business={b} />)}
            </div>
            <Pagination page={page} pages={pages} onPage={p => setParam('page', p)} />
          </>
        )}
      </div>

      {/* AI Pick modal */}
      {showAiPick && <AiPickModal businesses={businesses} onClose={() => setShowAiPick(false)} />}
    </div>
  )
}
