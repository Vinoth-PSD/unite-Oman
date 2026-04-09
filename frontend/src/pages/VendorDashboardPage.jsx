import { useState, useEffect } from 'react'
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { businessApi, reviewApi, serviceApi, bookingApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { Spinner } from '@/components/ui'
import toast from 'react-hot-toast'
import { 
  History, 
  LayoutDashboard, 
  Building2, 
  Star, 
  LogOut, 
  Settings, 
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  User,
  Zap,
  Trash2,
  Edit,
  Save,
  X,
  Menu,
  ChevronLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  Users,
  Eye,
  MessageSquare
} from 'lucide-react'

export default function VendorDashboardPage() {
  const { vendor, vendorLogout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!vendor) navigate('/vendor/login')
  }, [vendor, navigate])

  const tabs = [
    { name: 'Overview', icon: LayoutDashboard, path: '/vendor/dashboard' },
    { name: 'Appointments', icon: Clock, path: '/vendor/dashboard/appointments' },
    { name: 'My Shops', icon: Building2, path: '/vendor/dashboard/shops' },
    { name: 'Services', icon: Zap, path: '/vendor/dashboard/services' },
    { name: 'Reviews', icon: Star, path: '/vendor/dashboard/reviews' },
  ]

  const activeTab = tabs.find(t => t.path === location.pathname) || tabs[0]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink text-white rounded-xl flex items-center justify-center font-bold text-sm">
                {vendor?.email?.[0].toUpperCase() || <User size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-ink">Vendor Portal</p>
                <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{vendor?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={vendorLogout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-gray-200 fixed h-full z-50 transition-transform duration-300
        md:translate-x-0 md:block
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-6 pt-6 md:pt-10">
          {/* Mobile Close Button */}
          <div className="md:hidden flex justify-end mb-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 mb-6">
            <div className="w-10 h-10 bg-pink text-white rounded-xl flex items-center justify-center font-bold">
              {vendor?.email?.[0].toUpperCase() || <User size={20} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-ink">Vendor Portal</p>
              <p className="text-[11px] text-gray-400 truncate font-semibold">{vendor?.email}</p>
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                location.pathname === tab.path
                  ? 'bg-pink text-white shadow-lg shadow-pink/20'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-ink'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </Link>
          ))}
          
          <button
            onClick={vendorLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50/50 transition-all mt-8"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-16 md:mt-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-20">
          {/* Mobile Page Title */}
          <div className="md:hidden mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-pink rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-ink">{activeTab.name}</h1>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {activeTab.name === 'Overview' && "Welcome back! Here's what's happening today."}
                  {activeTab.name === 'Appointments' && "Manage your booking schedule"}
                  {activeTab.name === 'My Shops' && "View and manage your businesses"}
                  {activeTab.name === 'Services' && "Manage your service offerings"}
                  {activeTab.name === 'Reviews' && "See what customers are saying"}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <header className="hidden md:block mb-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-10 w-1 bg-pink rounded-full" />
              <h1 className="text-3xl font-bold text-ink tracking-tight">Dashboard Overview</h1>
            </div>
            <p className="text-gray-400 text-sm font-medium ml-5">Welcome back! Here's what's happening with your shops today.</p>
          </header>

          <Routes>
            <Route index element={<Overview />} />
            <Route path="appointments" element={<VendorAppointments />} />
            <Route path="shops" element={<MyShops />} />
            <Route path="services" element={<VendorServices />} />
            <Route path="reviews" element={<VendorReviews />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function Overview() {
  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ['vendor-shops'],
    queryFn: () => businessApi.me()
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['vendor-stats'],
    queryFn: () => businessApi.stats()
  })

  if (shopsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  const overviewStats = [
    { label: 'Total Views', value: stats?.total_views || 0, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Avg Rating', value: stats?.avg_rating || 0, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Total Reviews', value: stats?.total_reviews || 0, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Services', value: stats?.total_services || 0, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {overviewStats.map(stat => (
          <div key={stat.label} className="group bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-10 h-10 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3 md:mb-4`}>
              <stat.icon size={20} className="md:size-7" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl md:text-3xl font-black text-ink">
                  {stat.label === 'Avg Rating' ? stat.value.toFixed(1) : stat.value}
                </p>
                {stat.label === 'Avg Rating' && <span className="text-amber-400 text-sm md:text-lg">★</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-4 md:p-8">
        <h2 className="text-base md:text-lg font-bold text-ink mb-4 md:mb-6">Recent Activity</h2>
        {shops?.length === 0 ? (
          <p className="text-gray-400 font-semibold py-4 text-sm">No shops listed yet.</p>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {shops?.slice(0, 5).map(shop => (
              <div key={shop.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl border border-gray-200 flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
                    {shop.logo_url ? <img src={shop.logo_url} className="w-full h-full object-cover rounded-lg" /> : <Building2 className="text-gray-300" size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-ink truncate">{shop.name_en}</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold truncate">{shop.category?.name_en} • {shop.governorate?.name_en}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <StatusBadge status={shop.status} />
                  <Link to={`/business/${shop.slug}`} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-pink rounded-lg transition-colors">
                    <History size={14} className="md:size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MyShops() {
  const { data: shops, isLoading } = useQuery({
    queryKey: ['vendor-shops'],
    queryFn: () => businessApi.me()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  // Mobile Card View
  const MobileShopCard = ({ shop }) => (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {shop.logo_url ? <img src={shop.logo_url} className="w-full h-full object-cover" /> : <Building2 size={20} className="text-gray-200" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-ink truncate">{shop.name_en}</h3>
          <p className="text-[11px] text-gray-400 font-semibold">{shop.category?.name_en}</p>
          <StatusBadge status={shop.status} />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex gap-4">
          <div>
            <p className="text-xs font-bold text-ink">{shop.view_count}</p>
            <p className="text-[10px] text-gray-400 font-semibold">Views</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink flex items-center gap-1">
              <Star size={10} className="fill-yellow-400 text-yellow-400" /> {shop.rating_avg}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold">{shop.rating_count} Reviews</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link to={`/vendor/edit-shop/${shop.id}`} className="p-2 text-gray-400 hover:text-pink transition-colors">
            <Settings size={16} />
          </Link>
          <Link to={`/business/${shop.slug}`} className="p-2 text-gray-400 hover:text-pink transition-colors">
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {shops?.map(shop => (
          <MobileShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcff] border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Business</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Engagement</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shops?.map(shop => (
              <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                       {shop.logo_url ? <img src={shop.logo_url} className="w-full h-full object-cover" /> : <Building2 size={18} className="text-gray-200" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{shop.name_en}</p>
                      <p className="text-[11px] text-gray-400 font-semibold">{shop.category?.name_en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={shop.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs font-bold text-ink">{shop.view_count}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-ink flex items-center gap-1 justify-center">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" /> {shop.rating_avg}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">{shop.rating_count} Reviews</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/vendor/edit-shop/${shop.id}`} className="p-2 text-gray-400 hover:text-pink transition-colors" title="Manage Shop">
                      <Settings size={18} />
                    </Link>
                    <Link to={`/business/${shop.slug}`} className="p-2 text-gray-400 hover:text-pink transition-colors" title="View Public Page">
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function VendorReviews() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['vendor-reviews'],
    queryFn: () => reviewApi.me()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  if (!reviews?.length) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm text-center">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
          <Star size={24} className="md:size-8" />
        </div>
        <h2 className="text-base md:text-lg font-bold text-ink mb-2">No reviews yet</h2>
        <p className="text-gray-400 text-xs md:text-sm font-semibold max-w-sm mx-auto">
          Customer feedback for your shops will appear here once users start leaving reviews.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 md:mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-pink/10 text-pink rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                {review.reviewer_name?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{review.reviewer_name}</p>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-300 uppercase">{new Date(review.created_at).toLocaleDateString()}</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed font-medium italic">"{review.comment}"</p>
        </div>
      ))}
    </div>
  )
}

function VendorServices() {
  const [selectedShopId, setSelectedShopId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newService, setNewService] = useState({ name: '', description: '', price: '' })

  const { data: shops } = useQuery({ queryKey: ['vendor-shops'], queryFn: () => businessApi.me() })
  
  const { data: services, refetch, isLoading } = useQuery({
    queryKey: ['services', selectedShopId],
    queryFn: () => serviceApi.listByBusiness(selectedShopId),
    enabled: !!selectedShopId
  })

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await serviceApi.create({ ...newService, business_id: selectedShopId })
      setNewService({ name: '', description: '', price: '' })
      setIsAdding(false)
      refetch()
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      await serviceApi.delete(id)
      refetch()
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm">
        <h2 className="text-base md:text-lg font-bold text-ink mb-4 md:mb-6">Service Management</h2>
        <div className="max-w-md">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Shop to Manage</label>
          <select 
            value={selectedShopId || ''} 
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink focus:ring-2 focus:ring-pink/20 transition-all font-semibold bg-white text-gray-700"
          >
            <option value="">Select a shop...</option>
            {shops?.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
          </select>
        </div>
      </div>

      {selectedShopId && (
        <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
            <h3 className="font-bold text-ink">Active Services</h3>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-pink text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 w-full sm:w-auto justify-center hover:bg-pink/90 transition-colors"
            >
              <PlusCircle size={16} /> Add Service
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {isAdding && (
              <form onSubmit={handleAdd} className="p-4 md:p-6 border-2 border-dashed border-pink/30 rounded-2xl bg-pink/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <input 
                    placeholder="Service Name" 
                    required
                    value={newService.name} 
                    onChange={e => setNewService({...newService, name: e.target.value})}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink focus:ring-2 focus:ring-pink/20 transition-all bg-white text-gray-700 placeholder:text-gray-400" 
                  />
                  <input 
                    placeholder="Price (e.g. 5 OMR)" 
                    value={newService.price} 
                    onChange={e => setNewService({...newService, price: e.target.value})}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink focus:ring-2 focus:ring-pink/20 transition-all bg-white text-gray-700 placeholder:text-gray-400" 
                  />
                  <input 
                    placeholder="Description (Optional)" 
                    value={newService.description} 
                    onChange={e => setNewService({...newService, description: e.target.value})}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink focus:ring-2 focus:ring-pink/20 transition-all bg-white text-gray-700 placeholder:text-gray-400" 
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                  <button type="submit" className="bg-pink text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-pink/90 transition-colors">Save Service</button>
                </div>
              </form>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : services?.length === 0 && !isAdding ? (
              <p className="text-center text-gray-400 py-8 md:py-12 font-semibold text-sm">No services added for this shop yet.</p>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {services?.map(service => (
                  <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200 group transition-all hover:border-pink/30">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-ink">{service.name}</h4>
                      <p className="text-[11px] text-gray-500 font-semibold">{service.description || 'No description'} • <span className="text-pink font-bold">{service.price || 'Price on request'}</span></p>
                    </div>
                    <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(service.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function VendorAppointments() {
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['vendor-bookings'],
    queryFn: () => bookingApi.vendorList()
  })

  const updateStatus = async (id, status) => {
    try {
      await bookingApi.updateStatus(id, status)
      toast.success(`Booking ${status}`)
      refetch()
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  if (!bookings?.length) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl md:rounded-[2.5rem] border border-gray-200 shadow-sm text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 text-gray-300 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
          <Clock size={32} className="md:size-10" />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-ink mb-2">No appointments yet</h2>
        <p className="text-gray-400 text-xs md:text-sm font-semibold max-w-sm mx-auto">
          When customers book services from your shops, they will appear here.
        </p>
      </div>
    )
  }

  // Mobile Card View
  const MobileAppointmentCard = ({ booking }) => (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink/10 text-pink rounded-xl flex items-center justify-center font-black flex-shrink-0">
            {booking.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm text-ink">{booking.name}</p>
            <p className="text-[11px] text-gray-500 font-bold">{booking.phone}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
          booking.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
          'bg-amber-100 text-amber-700 border border-amber-200'
        }`}>
          {booking.status}
        </span>
      </div>
      
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div>
          <p className="text-xs font-bold text-ink">{booking.service || 'General Service'}</p>
          <p className="text-[11px] text-pink font-bold">{booking.business_name}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={12} />
          <p className="text-xs font-medium">{booking.date} at {booking.time}</p>
        </div>
      </div>

      {booking.status === 'pending' && (
        <div className="flex items-center gap-2 pt-2">
          <button 
            onClick={() => updateStatus(booking.id, 'confirmed')}
            className="flex-1 py-2 flex items-center justify-center gap-2 text-green-700 bg-green-100 hover:bg-green-200 rounded-xl transition-all duration-300 text-xs font-bold border border-green-200"
          >
            <CheckCircle size={14} /> Confirm
          </button>
          <button 
            onClick={() => updateStatus(booking.id, 'cancelled')}
            className="flex-1 py-2 flex items-center justify-center gap-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-xl transition-all duration-300 text-xs font-bold border border-red-200"
          >
            <XCircle size={14} /> Cancel
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {bookings.map(booking => (
          <MobileAppointmentCard key={booking.id} booking={booking} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcff] border-b border-gray-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Service & Shop</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date & Time</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink/10 text-pink rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                      {booking.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink">{booking.name}</p>
                      <p className="text-[11px] text-gray-500 font-bold tracking-tight">{booking.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-ink">{booking.service || 'General Service'}</p>
                  <p className="text-[11px] text-pink font-bold">{booking.business_name}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-bold text-ink">{booking.date}</p>
                  <p className="text-[11px] text-gray-500 font-bold">{booking.time}</p>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                     booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                     booking.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                     'bg-amber-100 text-amber-700 border-amber-200'
                   }`}>
                     {booking.status}
                   </span>
                </td>
                <td className="px-8 py-6 text-right">
                  {booking.status === 'pending' && (
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="w-10 h-10 flex items-center justify-center text-green-700 bg-green-100 hover:bg-green-200 rounded-xl transition-all duration-300 shadow-sm border border-green-200" title="Confirm Booking">
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="w-10 h-10 flex items-center justify-center text-red-700 bg-red-100 hover:bg-red-200 rounded-xl transition-all duration-300 shadow-sm border border-red-200" title="Cancel Booking">
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                  {booking.status !== 'pending' && (
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-700 border border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border border-red-200'
  }
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  )
}