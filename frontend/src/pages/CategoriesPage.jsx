import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import { Spinner } from '@/components/ui'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Utensils, Wrench, Sparkles, HeartPulse, Briefcase, Monitor, Package, ChevronRight, Store, Stethoscope, Pill, Key, Smartphone, Building2 } from 'lucide-react'

const ICONS = {
  restaurants: Utensils, repairing: Wrench, beauty: Sparkles,
  health: HeartPulse, technical: Monitor, moving: Package, retail: Store,
  clinic: Stethoscope, pharmacy: Pill, 'car-rental': Key, 'car-repair': Wrench,
  supermarket: Store, electronic: Smartphone, 'it-company': Briefcase
}
const GRADIENTS = [
  'from-rose-400 to-pink-600',
  'from-blue-400 to-indigo-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-cyan-400 to-blue-500',
  'from-orange-400 to-red-500',
  'from-indigo-400 to-violet-600',
]
const BG_SOFT = [
  '#FFF0F3','#EFF6FF','#FFFBEB','#ECFDF5','#F5F3FF','#ECFEFF','#FFF7ED','#EEF2FF'
]

export default function CategoriesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const parentId = searchParams.get('parent_id') || 0
  const parentSlug = searchParams.get('parent_slug')
  const parentName = searchParams.get('name')
  const isSubView = (parentId !== 0 && parentId !== '0') || !!parentSlug

  const { data: cats = [], isLoading } = useQuery({
    queryKey: ['categories', parentId, parentSlug],
    queryFn: () => categoryApi.list(null, isSubView ? null : 0, parentSlug || null)
  })

  return (
    <div className="min-h-screen pt-16" style={{ background: 'linear-gradient(135deg, #f8f6f0 0%, #f0eee8 100%)' }}>
      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{
        background: isSubView
          ? 'linear-gradient(135deg, #1a0533 0%, #2d0a4e 50%, #0f1a3d 100%)'
          : 'linear-gradient(135deg, #0f0a1a 0%, #1a0533 50%, #0a1f3d 100%)'
      }}>
        {/* decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #E8317A, transparent)' }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #C5963A, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] opacity-5" style={{ background: 'radial-gradient(ellipse, white, transparent)' }} />
        </div>

        <div className="relative max-w-[1240px] mx-auto px-6 py-16 text-center">
          {isSubView && (
            <button onClick={() => navigate('/categories')}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-all">
              <ArrowLeft size={14} /> Back to all categories
            </button>
          )}
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: '#C5963A' }}>
            {isSubView ? `✦ ${parentName || 'Sub-categories'}` : '✦ Browse by Category'}
          </p>
          <h1 className="text-white font-display text-[clamp(28px,5vw,56px)] font-normal leading-tight tracking-tight">
            {isSubView ? `Explore ${parentName || 'Services'}` : 'All Categories'}
          </h1>
          <p className="mt-3 text-white/50 text-base max-w-md mx-auto">
            {isSubView
              ? `Choose a subcategory to view all businesses`
              : `Discover businesses across ${cats.length || ''}+ categories in Oman`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1240px] mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
        ) : isSubView ? (
          /* Subcategory — beautiful large cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cats.map((cat, i) => {
              const Icon = ICONS[cat.slug] || Briefcase
              const grad = GRADIENTS[i % GRADIENTS.length]
              const link = cat.has_children
                ? `/categories?parent_slug=${cat.slug}&name=${encodeURIComponent(cat.name_en)}`
                : `/businesses?category=${cat.slug}`
              return (
                <Link key={cat.id} to={link}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: BG_SOFT[i % BG_SOFT.length] }}>
                  {/* top gradient bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${grad}`} />
                  <div className="p-6 flex items-center gap-5">
                    {/* icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon size={24} strokeWidth={2} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{cat.name_en}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {cat.has_children ? 'View subcategories' : `${cat.business_count || 0} shops`}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                  {/* hover shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                </Link>
              )
            })}
          </div>
        ) : (
          /* Top-level — icon grid cards */
          <div className="grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-4 gap-5">
            {cats.map((cat, i) => {
              const Icon = ICONS[cat.slug] || Briefcase
              const grad = GRADIENTS[i % GRADIENTS.length]
              const link = cat.has_children
                ? `/categories?parent_slug=${cat.slug}&name=${encodeURIComponent(cat.name_en)}`
                : `/businesses?category=${cat.slug}`
              return (
                <Link key={cat.id} to={link}
                  className="group relative bg-white rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100 overflow-hidden">
                  {/* Background glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                    <Icon size={26} strokeWidth={2} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{cat.name_en}</h3>
                  <p className="text-xs text-gray-400">
                    {cat.has_children ? 'See subcategories →' : `${cat.business_count || 0} shops`}
                  </p>
                  {cat.has_children && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white opacity-80"
                      style={{ background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' }}>
                      {cat.business_count || 0} shops
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {!isLoading && cats.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-400 font-medium">No categories found here.</p>
            <Link to="/categories" className="mt-4 inline-block text-sm font-bold text-pink-500 hover:underline">
              ← Back to all categories
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
