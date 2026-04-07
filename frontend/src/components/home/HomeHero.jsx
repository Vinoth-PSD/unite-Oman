import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { businessApi } from '@/lib/api'
import { Search, MapPin, Sparkles, Building2, Utensils, Store, Smartphone, Briefcase, ChevronRight, Monitor } from 'lucide-react'

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

const AI_RESULTS = [
  { cat: "AC & Maintenance", name: "Muscat Cooling Pros", loc: "Azaiba, Muscat", stars: "★★★★★", why: "Best rated for speed", match: "high" },
  { cat: "Home Cleaning", name: "Salalah Shine Co.", loc: "Dahariz, Salalah", stars: "★★★★☆", why: "Matches your budget", match: "md" },
  { cat: "Beauty & Grooming", name: "Signature Hair Muscat", loc: "Bousher", stars: "★★★★★", why: "Home service available", match: "high" }
]

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

export default function HomeHero() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('cl')
  const [aiState, setAiState] = useState('idle')
  const [thinkingTxt, setThinkingTxt] = useState('Understanding your request…')
  const [query, setQuery] = useState('')
  const [quickQuery, setQuickQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const resultRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!quickQuery.trim() || quickQuery.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await businessApi.autocomplete(quickQuery)
        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } catch (err) {
        console.error('Autocomplete error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [quickQuery])

  const handleRunAI = () => {
    if (!query.trim()) return
    setAiState('thinking')
    setTimeout(() => setThinkingTxt('Scanning 10,000+ Omani businesses…'), 700)
    setTimeout(() => setThinkingTxt('Matching with your location and needs…'), 1400)
    setTimeout(() => {
      setAiState('result')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }, 2100)
  }

  const handleQuickSearch = (e) => {
    e?.preventDefault()
    if (!quickQuery.trim()) return
    navigate(`/businesses?q=${encodeURIComponent(quickQuery)}`)
  }

  const handleSuggestionClick = (s) => {
    if (s.type === 'category') {
      navigate(`/businesses?category=${s.slug}`)
    } else {
      navigate(`/business/${s.slug}`)
    }
    setShowDropdown(false)
    setQuickQuery('')
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
        <div className="hero-search max-w-[620px] mx-auto bg-white border border-[var(--line)] rounded-[14px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] animate-[fu_0.8s_ease_both_1.6s]">
          
          {/* Toggle Buttons */}
          <div className="hs-toggle flex gap-[2px] p-[6px_6px_0]">
            <button 
              className={`flex-1 py-[8px] md:py-[10px] rounded-[10px] text-[12px] md:text-[13px] font-bold transition-all ${
                mode === 'ai' ? 'bg-[var(--ink)] text-white' : 'text-[var(--dim)] hover:text-[var(--ink)]'
              }`}
              onClick={() => { setMode('ai'); setAiState('idle'); }}
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
                    className="bg-[var(--ink)] text-white px-[20px] md:px-[24px] py-[12px] md:py-0 h-[44px] md:h-[48px] text-[14px] font-bold hover:opacity-90 mx-[4px] mb-[4px] md:mb-0 md:mr-[4px] rounded-[8px]"
                  >
                    Search
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
                
                {aiState === 'result' && (
                  <div ref={resultRef} className="hs-rbox overflow-hidden border border-[var(--line)] rounded-[12px] bg-white animate-in slide-in-from-top-4 duration-300">
                    {/* AI Results Content */}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-1 animate-in fade-in duration-300 relative" ref={dropdownRef}>
                <form onSubmit={handleQuickSearch} className="hs-inner flex flex-col md:flex-row items-stretch md:items-center bg-[#F8F9FA] border border-[var(--line)] rounded-[10px] overflow-hidden mb-[10px] transition-all focus-within:border-[var(--brand)] focus-within:bg-white shadow-inner">
                  <div className="flex items-center flex-1 px-2">
                    <span className="pl-2 pr-2 text-[var(--dim)]">
                      <Search size={18} strokeWidth={2.5} />
                    </span>
                    <input 
                      type="text" 
                      className="flex-1 bg-transparent text-[14px] font-medium py-[14px] outline-none placeholder:text-[var(--dim)] w-full" 
                      placeholder="Search services or businesses…" 
                      value={quickQuery}
                      onChange={(e) => setQuickQuery(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    />
                  </div>
                  
                  <div className="flex items-center border-t md:border-t-0 md:border-l border-[var(--line)]">
                    <div className="h-6 w-[1.5px] bg-[var(--line)] hidden md:block"></div>
                    <select className="flex-1 bg-transparent text-[14px] font-bold text-[var(--mid)] px-4 py-[12px] md:py-[14px] outline-none appearance-none cursor-pointer">
                      <option>All Oman</option>
                    </select>
                    <button 
                      type="submit" 
                      className="bg-[var(--ink)] text-white px-[20px] md:px-[24px] py-[12px] md:py-0 h-[44px] md:h-[48px] text-[14px] font-bold mx-[4px] my-[4px] md:mx-1 md:my-1 rounded-[8px]"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--line)] rounded-xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-200 mx-0 md:mx-1">
                    <div className="max-h-[320px] overflow-y-auto no-scrollbar">
                      {suggestions.map((s, i) => {
                        const Icon = s.type === 'category' ? (SUGGESTION_ICONS.category[s.slug] || Briefcase) : Building2
                        return (
                          <div 
                            key={i} 
                            onClick={() => handleSuggestionClick(s)}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              s.type === 'category' ? 'bg-pink/10 text-pink' : 'bg-blue-50 text-blue-500'
                            }`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-[13px] font-bold text-ink group-hover:text-pink transition-colors truncate">
                                {s.name}
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {s.type}
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 flex-shrink-0" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center gap-2 pl-2 mt-3 md:mt-0">
                  <span className="text-[10px] md:text-[11px] font-bold text-[var(--dim)] uppercase tracking-wider">Popular:</span>
                  {["AC Repair", "Deep Cleaning", "Plumbing", "Beauty"].map(h => (
                    <button 
                      key={h} 
                      className="text-[11px] md:text-[12px] font-medium text-[var(--mid)] border border-[var(--line)] rounded-full px-3 py-1 bg-white hover:border-[var(--brand)] hover:text-[var(--brand)] transition-all whitespace-nowrap"
                    >
                      {h}
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
    </section>
  )
}