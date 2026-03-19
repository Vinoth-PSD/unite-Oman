import { useState, useEffect } from 'react'
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { businessApi, reviewApi, serviceApi, bookingApi } from '@/lib/api'
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
  X
} from 'lucide-react'

export default function VendorDashboardPage() {
  const { vendor, vendorLogout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if logged out
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
    <div className="flex min-h-screen bg-gray-50 pt-4">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:block fixed h-full pt-10">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
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
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-5xl mx-auto pt-4 pb-20">
          <header className="mb-10">
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

  if (shopsLoading || statsLoading) return <Spinner />

  const overviewStats = [
    { label: 'Total Views', value: stats?.total_views || 0, icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Avg Rating', value: stats?.avg_rating || 0, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Total Reviews', value: stats?.total_reviews || 0, icon: History, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Services', value: stats?.total_services || 0, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {overviewStats.map(stat => (
          <div key={stat.label} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-ink">
                  {stat.label === 'Avg Rating' ? stat.value.toFixed(1) : stat.value}
                </p>
                {stat.label === 'Avg Rating' && <span className="text-amber-400 text-lg">★</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
        <h2 className="text-lg font-bold text-ink mb-6">Recent Activity</h2>
        {shops?.length === 0 ? (
          <p className="text-gray-400 font-semibold py-4">No shops listed yet.</p>
        ) : (
          <div className="space-y-4">
            {shops?.slice(0, 5).map(shop => (
              <div key={shop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden">
                    {shop.logo_url ? <img src={shop.logo_url} className="w-full h-full object-cover rounded-lg" /> : <Building2 className="text-gray-300" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">{shop.name_en}</h3>
                    <p className="text-xs text-gray-400 font-semibold">{shop.category?.name_en} • {shop.governorate?.name_en}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={shop.status} />
                  <Link to={`/business/${shop.slug}`} className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-pink rounded-lg transition-colors">
                    <History size={16} />
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

  if (isLoading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcff] border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Business</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Engagement</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {shops?.map(shop => (
              <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden">
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

  if (isLoading) return <Spinner />

  if (!reviews?.length) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={32} />
        </div>
        <h2 className="text-lg font-bold text-ink mb-2">No reviews yet</h2>
        <p className="text-gray-400 text-sm font-semibold max-w-sm mx-auto">
          Customer feedback for your shops will appear here once users start leaving reviews.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-light text-pink rounded-xl flex items-center justify-center font-bold">
                {review.reviewer_name?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{review.reviewer_name}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-100"} />
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
  
  const { data: services, refetch } = useQuery({
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
    } catch { toast.error('Failed to add service') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      await serviceApi.delete(id)
      refetch()
    } catch { toast.error('Failed to delete service') }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-ink mb-6">Service Management</h2>
        <div className="max-w-md">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Shop to Manage</label>
          <select 
            value={selectedShopId || ''} 
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="w-full border-[1.5px] border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink transition-colors font-semibold bg-gray-50/30"
          >
            <option value="">Select a shop...</option>
            {shops?.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
          </select>
        </div>
      </div>

      {selectedShopId && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-ink">Active Services</h3>
            <button 
              onClick={() => setIsAdding(true)}
              className="brand-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <PlusCircle size={16} /> Add Service
            </button>
          </div>

          <div className="space-y-4">
            {isAdding && (
              <form onSubmit={handleAdd} className="p-6 border-2 border-dashed border-pink/20 rounded-2xl bg-pink-light/5 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <input placeholder="Service Name (e.g. Haircut)" required
                    value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})}
                    className="border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink bg-white" />
                  <input placeholder="Price (e.g. 5 OMR)" 
                    value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})}
                    className="border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink bg-white" />
                  <input placeholder="Description (Optional)" 
                    value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})}
                    className="border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink bg-white" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-gray-400">Cancel</button>
                  <button type="submit" className="brand-btn px-6 py-2 rounded-lg text-xs font-bold">Save Service</button>
                </div>
              </form>
            )}

            {services?.length === 0 && !isAdding ? (
              <p className="text-center text-gray-400 py-12 font-semibold">No services added for this shop yet.</p>
            ) : (
              <div className="grid gap-4">
                {services?.map(service => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:border-pink/20">
                    <div>
                      <h4 className="font-bold text-sm text-ink">{service.name}</h4>
                      <p className="text-[11px] text-gray-400 font-semibold">{service.description || 'No description'} • <span className="text-pink">{service.price || 'Price on request'}</span></p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (isLoading) return <Spinner />

  if (!bookings?.length) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Clock size={40} />
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">No appointments yet</h2>
        <p className="text-gray-400 text-sm font-semibold max-w-sm mx-auto">
          When customers book services from your shops, they will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcff] border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Service & Shop</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date & Time</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-ink">
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink/5 text-pink rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                      {booking.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink">{booking.name}</p>
                      <p className="text-[11px] text-gray-400 font-bold tracking-tight">{booking.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-ink">{booking.service || 'General Service'}</p>
                  <p className="text-[11px] text-pink font-bold">{booking.business_name}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-bold text-ink">{booking.date}</p>
                  <p className="text-[11px] text-gray-400 font-bold">{booking.time}</p>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                     booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600' :
                     booking.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                     'bg-amber-500/10 text-amber-600'
                   }`}>
                     {booking.status}
                   </span>
                </td>
                <td className="px-8 py-6 text-right">
                  {booking.status === 'pending' && (
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="w-10 h-10 flex items-center justify-center text-green-500 bg-green-50 hover:bg-green-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm" title="Confirm Booking">
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm" title="Cancel Booking">
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                  {booking.status !== 'pending' && (
                    <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Completed</span>
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
    active: 'bg-green-50 text-green-600',
    pending: 'bg-yellow-50 text-yellow-600',
    rejected: 'bg-red-50 text-red-600'
  }
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  )
}
