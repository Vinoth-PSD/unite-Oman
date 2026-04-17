import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { businessApi, governorateApi } from '@/lib/api'
import { Search, Building2, Utensils, Store, Smartphone, Briefcase, ChevronRight, Monitor, Star, BadgeCheck } from 'lucide-react'

const SUGGESTION_ICONS = {
  category: {
    restaurants: Utensils,
    retail: Store,
    electronic: Smartphone,
    'it-software': Monitor,
    technical: Monitor,
  },
  business: Building2
}

function AnimatedText({ text, delayOffset = 0 }) {
  return text.split('').map((char, i) => (
    <span
      key={i}
      className="letter"
      style={{ animationDelay: `${delayOffset + i * 0.03}s` }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))
}

function AiResultCard({ biz, index }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/business/${biz.slug}`)}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--bg)] cursor-pointer transition-colors group"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--bg)] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--line)]">
        {biz.logo_url
          ? <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
          : <Building2 size={18} className="text-[var(--dim)]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-bold text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors truncate">
            {biz.name}
          </span>
          {biz.is_verified && <BadgeCheck size={13} className="text-blue-500 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {biz.category && (
            <span className="text-[10px] font-bold text-[var(--dim)] uppercase tracking-wider">{biz.category}</span>
          )}
          {biz.governorate && (
            <span className="text-[10px] text-[var(--dim)]">· {biz.governorate}</span>
          )}
          {biz.rating && (
            <span className="text-[10px] text-[var(--dim)] flex items-center gap-0.5">
              · <Star size={9} className="fill-amber-400 text-amber-400" /> {biz.rating.toFixed(1)}
            </span>
          )}
        </div>
        {biz.reason && (
          <p className="text-[11px] text-[var(--mid)] mt-0.5 leading-tight">{biz.reason}</p>
        )}
      </div>
      <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 flex-shrink-0 mt-1" />
    </div>
  )
}

export default function HomeHero() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('cl')
  const [aiState, setAiState] = useState('idle')
  const [thinkingTxt, setThinkingTxt] = useState('Understanding your request…')
  const [aiResults, setAiResults] = useState(null)
  const [query, setQuery] = useState('')
  const [quickQuery, setQuickQuery] = useState('')
  const [quickLocation, setQuickLocation] = useState('')
  // governorates is now managed by React Query below (removed useState)
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  const resultRef = useRef(null)
  const formRef = useRef(null)      // anchors the portal position
  const portalRef = useRef(null)    // the portal div itself (for click-outside)

  // Load governorates — cached 10 min by React Query
  const { data: governorates = [] } = useQuery({
    queryKey: ['governorates'],
    queryFn: governorateApi.list,
    staleTime: 10 * 60 * 1000,
  })

  // Pre-fetch featured businesses — cached 5 min, used by the dropdown on focus
  const { data: featuredBusinesses } = useQuery({
    queryKey: ['featured', 6],
    queryFn: () => businessApi.featured(6),
    staleTime: 5 * 60 * 1000,
  })

  // Close dropdown on outside click — check both the form and the portal div
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inForm   = formRef.current?.contains(e.target)
      const inPortal = portalRef.current?.contains(e.target)
      if (!inForm && !inPortal) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Recalculate portal position whenever dropdown opens or viewport changes
  useEffect(() => {
    if (!showDropdown || !formRef.current) return
    const update = () => {
      const r = formRef.current?.getBoundingClientRect()
      if (!r) return
      const isMd  = window.innerWidth >= 768
      const maxW  = isMd ? 860 : window.innerWidth - 32
      const cx    = r.left + r.width / 2
      const left  = Math.max(16, cx - maxW / 2)
      const width = Math.min(maxW, window.innerWidth - 32)
      setDropdownPos({ top: r.bottom + 10, left, width })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [showDropdown])

  // Fetch results whenever query or dropdown visibility changes
  useEffect(() => {
    if (!showDropdown) return

    if (!quickQuery.trim()) {
      setIsSearching(false)
      // Use prefetched featured data from React Query cache
      if (featuredBusinesses) {
        const mapped = featuredBusinesses.map(b => ({
          id: b.id,
          name: b.name_en,
          type: 'business',
          slug: b.slug,
          rating: b.rating_avg,
          category: b.category?.name_en,
          governorate: b.governorate?.name_en,
          is_verified: b.is_verified,
          logo_url: b.logo_url
        }))
        setSuggestions(mapped)
      } else {
        setIsSearching(true)
        businessApi.featured(6).then(res => {
          const mapped = res.map(b => ({
            id: b.id,
            name: b.name_en,
            type: 'business',
            slug: b.slug,
            rating: b.rating_avg,
            category: b.category?.name_en,
            governorate: b.governorate?.name_en,
            is_verified: b.is_verified,
            logo_url: b.logo_url
          }))
          setSuggestions(mapped)
        }).catch(() => {}).finally(() => setIsSearching(false))
      }
      return
    }

    if (quickQuery.length < 2) return

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await businessApi.autocomplete(quickQuery)
        setSuggestions(results)
      } catch (err) {
        console.error('Autocomplete error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 350)  // 350ms debounce — reduces server load vs 250ms

    return () => clearTimeout(timer)
  }, [quickQuery, showDropdown, featuredBusinesses])

  const handleRunAI = async () => {
    if (!query.trim()) return
    setAiState('thinking')
    setAiResults(null)

    const steps = [
      'Understanding your request…',
      'Scanning 10,000+ Omani businesses…',
      'Matching with your needs…',
    ]
    steps.forEach((txt, i) => setTimeout(() => setThinkingTxt(txt), i * 700))

    try {
      const base = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${base}/api/ai-search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setAiResults(data)
    } catch {
      setAiResults({
        message: 'Unable to complete AI search right now. Try Quick Search instead.',
        businesses: [],
        total_found: 0,
        query,
      })
    } finally {
      setAiState('result')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }
  }

  const handleQuickSearch = (e) => {
    e?.preventDefault()
    if (!quickQuery.trim()) return
    const params = new URLSearchParams({ q: quickQuery })
    if (quickLocation) params.set('governorate', quickLocation)
    navigate(`/businesses?${params.toString()}`)
    setShowDropdown(false)
  }

  const handlePopularTag = (tag) => {
    const params = new URLSearchParams({ q: tag })
    if (quickLocation) params.set('governorate', quickLocation)
    navigate(`/businesses?${params.toString()}`)
  }

  const handleSuggestionClick = (s) => {
    if (s.type === 'category') {
      navigate(`/businesses?category=${s.slug}`)
    } else {
      navigate(`/business/${s.slug}`)
    }
    setShowDropdown(false)
    setQuickQuery('')
    setSuggestions([])
  }

  return (
    <section className="hero pt-[60px] max-md:pt-[100px] pb-[40px] max-md:pb-[70px] px-[16px] max-md:px-[48px] bg-white text-center overflow-x-hidden">
      <div className="max-w-[1250px] mx-auto">
        {/* Hero Label */}
        <div className="hero-label inline-flex items-center gap-[8px] text-[10px] md:text-[11px] font-bold text-[var(--mid)] tracking-widest uppercase mb-[20px] md:mb-[24px]">
          <span className="w-[6px] h-[6px] rounded-full bg-[var(--brand)]"></span>
          Oman's #1 Home Services Platform
        </div>

        {/* Main Heading */}
        <h1 className="font-['Bricolage_Grotesque'] text-[clamp(32px,8vw,84px)] font-bold leading-[1.1] md:leading-[1.0] tracking-[-0.02em] md:tracking-[-0.04em] text-[var(--ink)] mb-[20px] md:mb-[24px] max-w-[800px] mx-auto">
          <AnimatedText text="Quality services," delayOffset={0.1} />
          <br />
          <AnimatedText text="at your " delayOffset={0.6} />
          <em className="not-italic text-[var(--brand)] inline-flex flex-col relative">
            <span className="inline-flex">
              <AnimatedText text="doorstep." delayOffset={0.8} />
            </span>
            <svg className="absolute -bottom-2 left-0 w-full h-[6px] md:h-[8px] text-[var(--brand)] opacity-30 animate-[fu_0.6s_ease_both_1.2s]" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </em>
        </h1>

        {/* Subheading */}
        <p className="text-[15px] md:text-[17px] text-[var(--mid)] max-w-[500px] mx-auto mb-[32px] md:mb-[48px] leading-[1.5] md:leading-[1.6] px-[12px] md:px-0 animate-[fu_0.8s_ease_both_1.4s]">
          Book verified professionals for home repairs, beauty, cleaning and more — across all 11 governorates.
        </p>

        {/* Search Container */}
        <div className="hero-search max-w-[620px] mx-auto bg-white border border-[var(--line)] rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] animate-[fu_0.8s_ease_both_1.6s]">

          {/* Toggle Buttons */}
          <div className="hs-toggle flex gap-[2px] p-[6px_6px_0]">
            <button
              className={`flex-1 py-[8px] md:py-[10px] rounded-[10px] text-[12px] md:text-[13px] font-bold transition-all ${
                mode === 'ai' ? 'bg-[var(--ink)] text-white' : 'text-[var(--dim)] hover:text-[var(--ink)]'
              }`}
              onClick={() => { setMode('ai'); setAiState('idle'); setAiResults(null) }}
            >
              ✦ AI Search
            </button>
            <button
              className={`flex-1 py-[8px] md:py-[10px] rounded-[10px] text-[12px] md:text-[13px] font-bold transition-all ${
                mode === 'cl' ? 'bg-[var(--ink)] text-white' : 'text-[var(--dim)] hover:text-[var(--ink)]'
              }`}
              onClick={() => setMode('cl')}
            >
              Quick Search
            </button>
          </div>

          {/* Search Body */}
          <div className="hs-body p-[6px] md:p-[8px]">
            {mode === 'ai' ? (
              <div className="p-1">
                <div className="hs-ai flex flex-col md:flex-row items-stretch md:items-center bg-[var(--bg)] border-[1.5px] border-transparent rounded-[10px] overflow-hidden mb-[8px] focus-within:border-[var(--brand)] focus-within:bg-white transition-all shadow-inner">
                  <div className="flex items-center flex-1">
                    <span className="px-[14px] text-[var(--brand)]">✦</span>
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-[14px] font-medium py-[14px] outline-none placeholder:text-[var(--dim)] w-full"
                      placeholder="Describe what you need…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunAI()}
                    />
                  </div>
                  <button
                    onClick={handleRunAI}
                    disabled={aiState === 'thinking'}
                    className="bg-[var(--ink)] text-white px-[20px] md:px-[24px] py-[12px] md:py-0 h-[44px] md:h-[48px] text-[14px] font-bold hover:opacity-90 disabled:opacity-50 mx-[4px] mb-[4px] md:mb-0 md:mr-[4px] rounded-[8px] transition-opacity"
                  >
                    {aiState === 'thinking' ? '...' : 'Search'}
                  </button>
                </div>

                {aiState === 'thinking' && (
                  <div className="hs-thinking mb-2 flex items-center justify-center md:justify-start">
                    <div className="hs-dots flex">
                      <div className="hs-dot"></div>
                      <div className="hs-dot"></div>
                      <div className="hs-dot"></div>
                    </div>
                    <span className="text-[11px] md:text-[12px] text-[var(--mid)] font-medium ml-2">{thinkingTxt}</span>
                  </div>
                )}

                {aiState === 'result' && aiResults && (
                  <div ref={resultRef} className="hs-rbox overflow-hidden border border-[var(--line)] rounded-[12px] bg-white animate-in slide-in-from-top-4 duration-300">
                    <div className="px-4 py-3 border-b border-[var(--line)] bg-gradient-to-r from-purple-50/60 to-pink-50/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[var(--brand)] text-[13px]">✦</span>
                        <span className="text-[11px] font-bold text-[var(--mid)] uppercase tracking-wider">AI Result</span>
                        {aiResults.total_found > 0 && (
                          <span className="ml-auto text-[10px] text-[var(--dim)]">{aiResults.total_found} businesses scanned</span>
                        )}
                      </div>
                      <p className="text-[13px] text-[var(--ink)] leading-relaxed">{aiResults.message}</p>
                    </div>
                    {aiResults.businesses.length > 0 ? (
                      <div className="divide-y divide-[var(--line)]">
                        {aiResults.businesses.map((biz, i) => (
                          <AiResultCard key={biz.id} biz={biz} index={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-[13px] text-[var(--dim)]">
                        No specific businesses found. Try a different description.
                      </div>
                    )}
                    {aiResults.total_found > 0 && (
                      <div className="px-4 py-2.5 border-t border-[var(--line)] bg-[var(--bg)]">
                        <button
                          onClick={() => navigate(`/businesses?q=${encodeURIComponent(aiResults.query)}`)}
                          className="text-[12px] font-bold text-[var(--brand)] hover:underline flex items-center gap-1 mx-auto"
                        >
                          View all {aiResults.total_found} results <ChevronRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ── Quick Search ── */
              <div className="p-1 animate-in fade-in duration-300">
                {/* form — ref used to anchor the portal dropdown position */}
                <form
                  ref={formRef}
                  onSubmit={handleQuickSearch}
                  className="hs-inner flex flex-col md:flex-row items-stretch md:items-center bg-[#F8F9FA] border border-[var(--line)] rounded-[10px] overflow-hidden mb-[10px] transition-all focus-within:border-[var(--brand)] focus-within:bg-white shadow-inner"
                >
                  <div className="flex items-center flex-1 px-2">
                    <span className="pl-2 pr-2 text-[var(--dim)] flex items-center">
                      {isSearching
                        ? <span className="w-[16px] h-[16px] border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin block" />
                        : <Search size={18} strokeWidth={2.5} />}
                    </span>
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-[14px] font-medium py-[14px] outline-none placeholder:text-[var(--dim)] w-full"
                      placeholder="Search services or businesses…"
                      value={quickQuery}
                      onChange={(e) => setQuickQuery(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch(e)}
                    />
                  </div>

                  <div className="flex items-center border-t md:border-t-0 md:border-l border-[var(--line)]">
                    <div className="h-6 w-[1.5px] bg-[var(--line)] hidden md:block"></div>
                    <select
                      className="flex-1 bg-transparent text-[14px] font-bold text-[var(--mid)] px-4 py-[12px] md:py-[14px] outline-none appearance-none cursor-pointer"
                      value={quickLocation}
                      onChange={(e) => setQuickLocation(e.target.value)}
                    >
                      <option value="">All Oman</option>
                      {governorates.map(g => (
                        <option key={g.id} value={g.slug}>{g.name_en}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-[var(--ink)] text-white px-[20px] md:px-[24px] py-[12px] md:py-0 h-[44px] md:h-[48px] text-[14px] font-bold mx-[4px] my-[4px] md:mx-1 md:my-1 rounded-[8px]"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center gap-2 pl-2 mt-3 md:mt-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-[var(--dim)] uppercase tracking-wider">Popular:</span>
                  {["AC Repair", "Deep Cleaning", "Plumbing", "Beauty"].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handlePopularTag(tag)}
                      className="text-[11px] md:text-[12px] font-medium text-[var(--mid)] border border-[var(--line)] rounded-full px-3 py-1 bg-white hover:border-[var(--brand)] hover:text-[var(--brand)] transition-all whitespace-nowrap"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="hero-trust flex flex-wrap items-center justify-center gap-[16px] md:gap-[32px] mt-[32px] md:mt-[40px] px-[12px] md:px-0 animate-[fu_0.8s_ease_both_1.8s]">
          {[
            { label: "10,000+ verified businesses", color: "text-[var(--brand)]" },
            { label: "All 11 governorates", color: "text-[#5B2D8E]" },
            { label: "4.8★ average rating", color: "text-[#F59E0B]" },
            { label: "WhatsApp ready", color: "text-[#25D366]" }
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-[8px] text-[11px] md:text-[13px] font-bold text-[var(--ink)]">
              <span className={`w-[6px] h-[6px] rounded-full bg-current ${t.color}`}></span>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Search Dropdown Portal ──
          Rendered at document.body so it escapes every overflow/clip/stacking context
          in the hero section. Position is tracked via formRef.getBoundingClientRect(). */}
      {showDropdown && dropdownPos.width > 0 && createPortal(
        <div
          ref={portalRef}
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 99999,
          }}
          className="bg-white rounded-2xl border border-[var(--line)] shadow-[0_24px_64px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--line)] bg-[var(--bg)]">
            <span className="text-[11px] font-bold text-[var(--dim)] uppercase tracking-widest">
              {quickQuery.trim()
                ? (isSearching ? 'Searching…' : `${suggestions.length} result${suggestions.length !== 1 ? 's' : ''}`)
                : 'Trending Services'}
            </span>
            <div className="flex items-center gap-3">
              {isSearching && (
                <span className="w-[14px] h-[14px] border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin block" />
              )}
              {quickQuery.trim() && (
                <button
                  onMouseDown={(e) => { e.preventDefault(); setQuickQuery(''); setSuggestions([]) }}
                  className="text-[11px] text-[var(--dim)] hover:text-[var(--ink)] transition-colors font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">

            {/* Skeleton while loading */}
            {isSearching && suggestions.length === 0 && (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)]">
                    <div className="w-11 h-11 rounded-xl skel flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 skel rounded w-3/4" />
                      <div className="h-2 skel rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Categories pill row */}
            {!isSearching && suggestions.some(s => s.type === 'category') && (
              <div className="px-5 pt-4 pb-3">
                <p className="text-[9px] font-bold text-[var(--dim)] uppercase tracking-widest mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.filter(s => s.type === 'category').map((s, i) => {
                    const Icon = SUGGESTION_ICONS.category[s.slug] || Briefcase
                    return (
                      <button
                        key={`cat-${i}`}
                        onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s) }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg)] hover:bg-white border border-[var(--line)] hover:border-[var(--brand)] transition-all group"
                      >
                        <Icon size={13} className="text-[var(--brand)]" />
                        <span className="text-[12px] font-semibold text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors whitespace-nowrap">{s.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Businesses 2-column grid */}
            {!isSearching && suggestions.some(s => s.type === 'business') && (
              <div className={`px-5 pb-4 ${suggestions.some(s => s.type === 'category') ? 'border-t border-[var(--line)] pt-4' : 'pt-4'}`}>
                {suggestions.some(s => s.type === 'category') && (
                  <p className="text-[9px] font-bold text-[var(--dim)] uppercase tracking-widest mb-3">Businesses</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestions.filter(s => s.type === 'business').map((s, i) => (
                    <div
                      key={`biz-${i}`}
                      onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s) }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg)] cursor-pointer group transition-colors border border-transparent hover:border-[var(--line)]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[var(--bg)] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--line)]">
                        {s.logo_url
                          ? <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                          : <Building2 size={18} className="text-[var(--dim)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-bold text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors truncate">{s.name}</span>
                          {s.is_verified && <BadgeCheck size={12} className="text-blue-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {s.category && <span className="text-[10px] font-bold text-[var(--dim)] uppercase tracking-wide">{s.category}</span>}
                          {s.governorate && <span className="text-[10px] text-[var(--dim)]">· {s.governorate}</span>}
                          {s.rating && (
                            <span className="text-[10px] text-[var(--dim)] flex items-center gap-0.5">
                              · <Star size={9} className="fill-amber-400 text-amber-400" /> {s.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!isSearching && suggestions.length === 0 && quickQuery.trim() && (
              <div className="py-10 text-center">
                <div className="text-[28px] mb-2">🔍</div>
                <div className="text-[13px] font-semibold text-[var(--ink)]">No results for "{quickQuery}"</div>
                <div className="text-[11px] text-[var(--dim)] mt-1">Try a different term or browse all businesses</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-center gap-1.5 px-5 py-3 border-t border-[var(--line)] bg-[var(--bg)] hover:bg-gray-50 cursor-pointer transition-colors rounded-b-2xl"
            onMouseDown={(e) => { e.preventDefault(); handleQuickSearch() }}
          >
            <span className="text-[12px] font-bold text-[var(--brand)]">
              {quickQuery.trim() ? `Search for "${quickQuery}"` : 'Browse all businesses'}
            </span>
            <ChevronRight size={13} className="text-[var(--brand)]" />
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
