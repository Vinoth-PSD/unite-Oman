import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, Utensils, Wrench, Sparkles, HeartPulse, Briefcase, Monitor, Package, ChevronRight, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'

const ICONS = { restaurants: Utensils, repairing: Wrench, beauty: Sparkles, health: HeartPulse, technical: Monitor, moving: Package }
const COLORS = ['#FCE8F1','#DBEAFE','#FEF3C7','#D1FAE5','#EDE5F7','#CFFAFE','#FEF0EA','#E0E7FF']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [hoveredCat, setHoveredCat] = useState(null)
  const [hoveredSubCat, setHoveredSubCat] = useState(null)
  
  const navRef = useRef(null)
  const timerRef = useRef(null)
  const { user, isAdmin, isVendor, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Close menus on route change
  useEffect(() => {
    setCatOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  const { data: topCategories = [] } = useQuery({
    queryKey: ['categories', 'top-level'],
    queryFn: () => categoryApi.list(null, 0, null),
    staleTime: 1000 * 60 * 10
  })

  // Set initial hovered category if none is set and menu opens
  useEffect(() => {
    if (catOpen && !hoveredCat && topCategories.length > 0) {
      setHoveredCat(topCategories[0])
      setHoveredSubCat(null)
    }
  }, [catOpen, topCategories, hoveredCat])

  const { data: subCategories = [], isFetching: subsLoading } = useQuery({
    queryKey: ['categories', 'sub', hoveredCat?.id],
    queryFn: () => categoryApi.list(null, null, hoveredCat?.slug),
    enabled: !!hoveredCat,
    staleTime: 1000 * 60 * 10
  })

  const { data: childCategories = [], isFetching: childLoading } = useQuery({
    queryKey: ['categories', 'sub', hoveredSubCat?.id],
    queryFn: () => categoryApi.list(null, null, hoveredSubCat?.slug),
    enabled: !!hoveredSubCat,
    staleTime: 1000 * 60 * 10
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openMenu = () => { clearTimeout(timerRef.current); setCatOpen(true) }
  const closeMenu = () => { timerRef.current = setTimeout(() => setCatOpen(false), 200) }

  return (
    <div onMouseLeave={closeMenu}>
      <nav ref={navRef} className={`h-[64px] flex items-center transition-all duration-500 fixed top-0 left-0 right-0 z-[100] border-b ${
        scrolled || catOpen ? 'bg-white/95 backdrop-blur-md shadow-sm border-[var(--line)]' : 'bg-white border-transparent'
      }`}>
        <div className="flex items-center justify-between w-full max-w-[var(--max)] mx-auto max-md:px-[18px] px-[48px] h-full">
          <Link to="/" className="shrink-0 tr hover:opacity-80">
            <Logo theme="light" style={{ height: '32px' }} />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-[32px] list-none h-full">
            <li className="h-full flex items-center cursor-default" onMouseEnter={openMenu}>
              <div className="text-[13px] text-[var(--mid)] font-bold transition-colors hover:text-[var(--ink)] flex items-center gap-1 h-full">
                Categories
                <span className={`transition-transform duration-200 inline-block text-[10px] ${catOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </li>
            <li className="h-full flex items-center"><Link to="/governorates" className="text-[13px] text-[var(--mid)] font-bold hover:text-[var(--ink)] tr h-full flex items-center">Directory</Link></li>
            <li className="h-full flex items-center"><Link to="/businesses" className="text-[13px] text-[var(--mid)] font-bold hover:text-[var(--ink)] tr h-full flex items-center">Businesses</Link></li>
            <li className="h-full flex items-center"><Link to="/contact" className="text-[13px] text-[var(--mid)] font-bold hover:text-[var(--ink)] tr h-full flex items-center">Contact</Link></li>
          </ul>

          <div className="flex items-center gap-[12px]">
            <div className="hidden md:flex items-center gap-[12px]">
              <Link to="/vendor/login" className="text-[13px] font-bold text-[var(--mid)] hover:text-[var(--ink)] tr px-2">
                Register as Professional
              </Link>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to={isAdmin ? "/admin" : (isVendor ? "/vendor/dashboard" : "/profile")}
                    className="btn-pill-out bg-none border-[1.5px] border-[var(--line)] text-[var(--ink)] text-[13px] font-bold p-[7px_20px] rounded-full tr hover:border-[var(--ink)] hover:bg-[var(--bg)] flex items-center gap-2">
                    <User size={14} /> My Account
                  </Link>
                  <button onClick={logout} className="text-[13px] font-bold text-[var(--ink)] tr hover:text-[var(--brand)]">Logout</button>
                </div>
              ) : (
                <>
                  <Link to="/admin/login" className="btn-pill-out bg-none border-[var(--line)] border text-[var(--ink)] text-[13px] font-bold p-[8px_20px] rounded-full tr hover:border-[var(--ink)]">
                    Log in
                  </Link>
                  <Link to="/list-business" className="btn-pill bg-[var(--ink)] text-white text-[13px] font-bold p-[9px_22px] rounded-full tr hover:opacity-85 shadow-lg shadow-black/5">
                    List Business
                  </Link>
                </>
              )}
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 tr text-gray-600">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Apple-style Full Width Dropdown */}
      <div 
        className={`fixed top-[64px] left-0 right-0 z-[90] bg-white border-b border-gray-100 shadow-2xl transition-all duration-300 origin-top flex overflow-hidden ${
          catOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
        onMouseEnter={openMenu}
        style={{ height: '440px' }}
      >
        <div className="w-full max-w-[var(--max)] mx-auto px-[48px] py-[24px] flex h-full">
          {/* Left Sidebar (Main Categories) */}
          <div className="w-[300px] border-r border-gray-100 pr-[20px] flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">Top Categories</h3>
            <div className="flex flex-col gap-1">
              {topCategories.map((cat, i) => {
                const Icon = ICONS[cat.slug] || Briefcase
                const isActive = hoveredCat?.id === cat.id
                return (
                  <div 
                    key={cat.id} 
                    onMouseEnter={() => { setHoveredCat(cat); setHoveredSubCat(null); }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors duration-200 ${
                      isActive ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS[i % COLORS.length] }}>
                        <Icon size={14} className="text-gray-700" />
                      </div>
                      <span className={`text-[13px] font-bold ${isActive ? 'text-[var(--brand)]' : 'text-gray-700'}`}>
                        {cat.name_en}
                      </span>
                    </div>
                    {cat.has_children && <ChevronRight size={14} className={isActive ? 'text-[var(--brand)]' : 'text-gray-300'} />}
                  </div>
                )
              })}
            </div>
            <div className="mt-auto pt-4 pb-2 px-3">
              <Link to="/categories" onClick={() => setCatOpen(false)} className="text-[12px] font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1">
                View all categories <ChevronRight size={12} />
              </Link>
            </div>
          </div>          {/* Middle & Right Panes */}
          {subsLoading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
          ) : subCategories.length > 0 ? (
            <>
              {/* Middle Pane (Subcategories) */}
              <div className="w-[340px] border-r border-gray-100 px-[32px] flex flex-col h-full relative shrink-0">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-4 h-[15px]">
                  {hoveredCat ? `Explore ${hoveredCat.name_en}` : ' '}
                </h3>
                
                <div className="flex flex-col gap-1 overflow-y-auto pb-4 custom-scrollbar -ml-2 -mr-2 px-2">
                  {subCategories.map(sub => {
                    const isSubActive = hoveredSubCat?.id === sub.id
                    return (
                      <div 
                        key={sub.id} 
                        onMouseEnter={() => setHoveredSubCat(sub)}
                        onClick={() => !sub.has_children && navigate(`/businesses?category=${sub.slug}`)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${
                          isSubActive ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <div>
                          <h4 className={`text-[13px] font-bold transition-colors mb-0.5 ${isSubActive ? 'text-[var(--brand)]' : 'text-gray-800'}`}>{sub.name_en}</h4>
                          <p className="text-[11px] text-gray-400">{sub.has_children ? 'Has categories' : `${sub.business_count || 0} businesses`}</p>
                        </div>
                        {sub.has_children && <ChevronRight size={14} className={isSubActive ? 'text-[var(--brand)]' : 'text-gray-300'} />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Pane (Child Categories) */}
              <div className="flex-1 px-[40px] flex flex-col h-full relative">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-4 h-[15px]">
                  {hoveredSubCat ? `Explore ${hoveredSubCat.name_en}` : ' '}
                </h3>

                {!hoveredSubCat ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Sparkles size={24} className="text-gray-400" />
                    </div>
                    <p className="text-[13px] font-bold text-gray-500">Hover a category to see more</p>
                  </div>
                ) : childLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
                ) : childCategories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 overflow-y-auto pb-4 custom-scrollbar content-start">
                    {childCategories.map(child => (
                      <Link 
                        key={child.id} 
                        to={`/businesses?category=${child.slug}`}
                        onClick={() => setCatOpen(false)}
                        className="group flex flex-col p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="text-[13px] font-bold text-gray-900 group-hover:text-[var(--brand)] transition-colors mb-0.5">{child.name_en}</h4>
                        <p className="text-[11px] text-gray-400">{child.business_count || 0} businesses</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Utensils size={24} className="text-[var(--brand)]" opacity={0.5} />
                    </div>
                    <h4 className="text-[14px] font-bold text-gray-900 mb-1">Explore {hoveredSubCat.name_en}</h4>
                    <p className="text-[12px] text-gray-400 max-w-[200px] mb-4">{hoveredSubCat.business_count || 0} businesses available</p>
                    <Link 
                      to={`/businesses?category=${hoveredSubCat.slug}`}
                      onClick={() => setCatOpen(false)}
                      className="px-6 py-2 bg-[var(--brand)] text-white rounded-full text-[13px] font-bold hover:opacity-90 transition-opacity"
                    >
                      View all
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : hoveredCat ? (
            <div className="flex-1 px-[40px] py-[20px] flex flex-col h-full relative">
              <div className="w-full h-[320px] rounded-3xl overflow-hidden relative flex flex-col items-center justify-center bg-gray-50 border border-gray-100 shadow-sm ml-4 mt-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg)] to-white opacity-60"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center p-8">
                  <div className="w-20 h-20 bg-white shadow-xl shadow-black/5 rounded-[24px] flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Sparkles size={32} className="text-[var(--brand)]" />
                  </div>
                  <h2 className="text-[28px] font-black text-gray-900 mb-3 tracking-tight">
                    Explore {hoveredCat.name_en}
                  </h2>
                  <p className="text-[15px] font-medium text-gray-500 max-w-[340px] mb-8 leading-relaxed">
                    Discover top-rated businesses, exclusive deals, and premium services in Oman.
                  </p>
                  <Link 
                    to={`/businesses?category=${hoveredCat.slug}`}
                    onClick={() => setCatOpen(false)}
                    className="px-8 py-3.5 bg-[var(--ink)] text-white rounded-full text-[14px] font-bold hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 transition-all flex items-center gap-2"
                  >
                    View all businesses <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>


      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[64px] left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-2 z-[90]">
          {[['Categories','/categories'],['Directory','/governorates'],['Businesses','/businesses'],['Contact','/contact']].map(([label, to]) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl">{label}</Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-1 flex flex-col gap-2">
            <Link to="/vendor/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl">Register as Professional</Link>
            <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl">Log in</Link>
            <Link to="/list-business" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-bold text-center text-white bg-gray-900 rounded-xl">List Business</Link>
          </div>
        </div>
      )}
    </div>
  )
}

