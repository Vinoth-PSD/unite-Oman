import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { adminApi, businessApi, reviewApi } from '@/lib/api'
import { Spinner, Pagination } from '@/components/ui'
import { LayoutDashboard, Building2, Star, LogOut, CheckCircle, XCircle, Eye, Trash2, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Login Page ────────────────────────────────────────────────
function AdminLoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await login(form.email, form.password)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="font-display text-2xl font-normal text-ink">Admin Login</h1>
          <p className="text-sm text-gray-400 mt-1">UniteOman Control Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@uniteoman.com"
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink transition-colors" required />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink transition-colors" required />
          </div>
          <button type="submit" disabled={loading} className="w-full brand-btn py-3 rounded-xl text-sm font-bold mt-2 disabled:opacity-60">
            {loading ? 'Logging in…' : 'Log In →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${color}`}>{icon}</div>
      <div className="font-display text-3xl font-normal text-ink mb-0.5 brand-text">{value ?? '–'}</div>
      <div className="text-sm font-bold text-ink">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Business Table ────────────────────────────────────────────
function BusinessTable({ defaultStatus = '' }) {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState(defaultStatus)
  const [selectedBusiness, setSelectedBusiness] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-businesses', page, statusFilter],
    queryFn: () => businessApi.adminAll({ page, per_page: 10, status: statusFilter || undefined })
  })

  const approveMutation = useMutation({
    mutationFn: (id) => businessApi.adminUpdate(id, { status: 'active' }),
    onSuccess: () => { toast.success('Business approved'); qc.invalidateQueries(['admin-businesses']) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Approval failed')
  })
  const rejectMutation = useMutation({
    mutationFn: (id) => businessApi.adminUpdate(id, { status: 'rejected' }),
    onSuccess: () => { toast.success('Business rejected'); qc.invalidateQueries(['admin-businesses']) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Rejection failed')
  })
  const deleteMutation = useMutation({
    mutationFn: businessApi.adminDelete,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['admin-businesses']) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Delete failed')
  })

  const statusColor = { active: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', suspended: 'bg-red-100 text-red-700', rejected: 'bg-gray-100 text-gray-500' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-ink text-lg">Businesses</h2>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold outline-none">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Spinner /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Business','Category','Governorate','Plan','Status','Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.items?.map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm text-ink">{b.name_en}</div>
                    <div className="text-xs text-gray-400">{b.name_ar}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.category?.name_en || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.governorate?.name_en || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-purple bg-purple-light px-2 py-0.5 rounded-full capitalize">{b.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColor[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedBusiness(b) }}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center transition-colors" title="View Details">
                        <Eye size={14} />
                      </button>
                      {b.status === 'pending' && (
                        <>
                          <button 
                            disabled={approveMutation.isPending}
                            onClick={(e) => { e.stopPropagation(); approveMutation.mutate(b.id) }}
                            className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors disabled:opacity-50" title="Approve">
                            {approveMutation.isPending && approveMutation.variables === b.id ? <Spinner className="w-3 h-3" /> : <CheckCircle size={14} />}
                          </button>
                          <button 
                            disabled={rejectMutation.isPending}
                            onClick={(e) => { e.stopPropagation(); rejectMutation.mutate(b.id) }}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-50" title="Reject">
                            {rejectMutation.isPending && rejectMutation.variables === b.id ? <Spinner className="w-3 h-3" /> : <X size={14} />}
                          </button>
                        </>
                      )}
                      <button 
                        disabled={deleteMutation.isPending}
                        onClick={(e) => { e.stopPropagation(); if(confirm('Delete this business?')) deleteMutation.mutate(b.id) }}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50" title="Delete">
                        {deleteMutation.isPending && deleteMutation.variables === b.id ? <Spinner className="w-3 h-3" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
          </div>
        </div>
      )}

      {/* Business Details Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-ink">Business Details</h3>
              <button onClick={() => setSelectedBusiness(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-14 h-14 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-2xl shadow-sm">
                   {selectedBusiness.category?.icon || '🏢'}
                </div>
                <div>
                   <h4 className="font-display text-xl font-normal text-ink">{selectedBusiness.name_en}</h4>
                   <p className="text-gray-400 text-sm font-semibold">{selectedBusiness.category?.name_en} • {selectedBusiness.governorate?.name_en}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-100/50">
                  <p className="text-[10px] font-bold text-purple uppercase tracking-widest mb-1">Plan Type</p>
                  <p className="font-bold text-ink capitalize">{selectedBusiness.plan}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${selectedBusiness.status === 'active' ? 'bg-green-50/30 border-green-100/50' : 'bg-amber-50/30 border-amber-100/50'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${selectedBusiness.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>Current Status</p>
                  <p className="font-bold text-ink capitalize">{selectedBusiness.status}</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-light text-pink flex items-center justify-center">
                    <Star size={14} className="fill-pink" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor Email</p>
                    <p className="text-sm font-bold text-ink">{selectedBusiness.owner_email || 'Not available'}</p>
                  </div>
                </div>

                {selectedBusiness.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                      <LayoutDashboard size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-ink">{selectedBusiness.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <a href={`/business/${selectedBusiness.slug}`} target="_blank" rel="noreferrer" 
                   className="flex-1 min-w-[120px] py-3 border-[1.5px] border-gray-100 rounded-xl text-sm font-bold text-gray-500 text-center hover:bg-gray-50 transition-colors flex items-center justify-center">
                  View Public
                </a>
                
                {selectedBusiness.status === 'pending' ? (
                  <>
                    <button 
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(selectedBusiness.id, { onSuccess: () => setSelectedBusiness(null) })}
                      className="flex-1 min-w-[120px] bg-green-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {approveMutation.isPending ? <Spinner className="w-4 h-4" /> : <CheckCircle size={16} />}
                      Approve
                    </button>
                    <button 
                      disabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(selectedBusiness.id, { onSuccess: () => setSelectedBusiness(null) })}
                      className="flex-1 min-w-[120px] bg-amber-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {rejectMutation.isPending ? <Spinner className="w-4 h-4" /> : <X size={16} />}
                      Reject
                    </button>
                  </>
                ) : (
                  <button 
                    disabled={deleteMutation.isPending}
                    onClick={() => { if(confirm('Delete this business?')) deleteMutation.mutate(selectedBusiness.id, { onSuccess: () => setSelectedBusiness(null) }) }}
                    className="flex-1 min-w-[120px] bg-red-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleteMutation.isPending ? <Spinner className="w-4 h-4" /> : <Trash2 size={16} />}
                    Delete Shop
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reviews Table ─────────────────────────────────────────────
function ReviewsTable() {
  const qc = useQueryClient()
  // For simplicity, admin sees all reviews via a separate endpoint (can be added to backend)
  // Using placeholder for now
  return (
    <div>
      <h2 className="font-bold text-ink text-lg mb-4">Pending Reviews</h2>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-3xl mb-2">⭐</div>
        <p className="text-gray-400 text-sm">Review moderation will appear here.</p>
      </div>
    </div>
  )
}

// ── Vendors Table ──────────────────────────────────────────────
function VendorsTable({ onViewDashboard }) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-vendors'], queryFn: adminApi.listVendors })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteVendor,
    onSuccess: () => { toast.success('Vendor account deleted'); qc.invalidateQueries(['admin-vendors']) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Failed to delete vendor')
  })

  return (
    <div>
      <h2 className="font-bold text-ink text-lg mb-4">Vendor Registrations</h2>
      {isLoading ? <div className="flex justify-center py-12"><Spinner /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Email','Registered At','Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.map(v => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-ink">{v.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(v.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onViewDashboard(v)}
                        className="w-8 h-8 rounded-lg bg-pink/10 text-pink hover:bg-pink hover:text-white flex items-center justify-center transition-colors" title="View Dashboard">
                        <LayoutDashboard size={14} />
                      </button>
                      <button 
                        disabled={deleteMutation.isPending}
                        onClick={() => { if(confirm('Delete this vendor account? Warning: This will NOT delete their shops.')) deleteMutation.mutate(v.id) }}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50" title="Delete Vendor">
                        {deleteMutation.isPending && deleteMutation.variables === v.id ? <Spinner className="w-3 h-3" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-sm">No vendors found.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Vendor Preview Component ──────────────────────────────────
function VendorPreview({ vendor, onBack }) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-vendor-stats', vendor.id],
    queryFn: () => adminApi.getVendorStats(vendor.id)
  })

  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-vendor-shops', vendor.id],
    queryFn: () => adminApi.getVendorBusinesses(vendor.id)
  })

  if (statsLoading || shopsLoading) return <Spinner />

  const overviewStats = [
    { label: 'Total Views', value: stats?.total_views || 0, icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Avg Rating', value: stats?.avg_rating || 0, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Total Reviews', value: stats?.total_reviews || 0, icon: Star, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Services', value: stats?.total_services || 0, icon: LayoutDashboard, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-pink text-xs font-bold uppercase tracking-widest mb-2 hover:underline flex items-center gap-1">
             ← Back to Vendors
          </button>
          <h1 className="font-display text-3xl font-normal text-ink">Vendor Dashboard: <span className="text-pink">{vendor.email}</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {overviewStats.map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
             <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-2xl font-black text-ink">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
        <h2 className="text-lg font-bold text-ink mb-6">Vendor’s Shops ({shops?.length || 0})</h2>
        <div className="space-y-4">
          {shops?.map(shop => (
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
                <div className="text-right">
                   <p className="text-xs font-bold text-ink">{shop.view_count} views</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{shop.rating_avg} ★</p>
                </div>
                <a href={`/business/${shop.slug}`} target="_blank" rel="noreferrer" className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-pink rounded-lg transition-colors">
                  <Eye size={16} />
                </a>
              </div>
            </div>
          ))}
          {!shops?.length && <p className="text-center text-gray-400 py-8 font-semibold">No businesses found for this vendor.</p>}
        </div>
      </div>
    </div>
  )
}

// ── Dashboard Main ────────────────────────────────────────────
function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = new URLSearchParams(location.search).get('tab') || 'overview'
  const [viewingVendor, setViewingVendor] = useState(null)

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.stats })

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'businesses', label: 'Shops List', icon: Building2 },
    { id: 'requests', label: 'Requests', icon: CheckCircle },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'history', label: 'History', icon: Trash2 },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ]

  // Components for each tab
  const renderTab = () => {
    if (viewingVendor) return <VendorPreview vendor={viewingVendor} onBack={() => setViewingVendor(null)} />

    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h1 className="font-display text-3xl font-normal text-ink mb-6">Dashboard Overview</h1>
            {!stats ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <StatCard icon="🏢" label="Total Businesses" value={stats?.total_businesses} sub={`${stats?.active_businesses} active`} color="bg-purple-light" />
                  <StatCard icon="⏳" label="Pending Review" value={stats?.pending_businesses} sub="Awaiting approval" color="bg-amber-50" />
                  <StatCard icon="⭐" label="Total Reviews" value={stats?.total_reviews} sub="All time" color="bg-orange-light" />
                  <StatCard icon="🏆" label="Featured" value={stats?.featured_businesses} sub="Sponsored listings" color="bg-pink-light" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[['📁','Categories',stats?.total_categories],['📍','Governorates',stats?.total_governorates],['✅','Verified',stats?.active_businesses]].map(([icon,label,val]) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <div className="font-display text-2xl brand-text font-normal">{val ?? '–'}</div>
                        <div className="text-sm font-semibold text-gray-500">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )
      case 'businesses': return <BusinessTable key="active" defaultStatus="active" />
      case 'requests': return <BusinessTable key="pending" defaultStatus="pending" />
      case 'history': return <BusinessTable key="history" defaultStatus="rejected" />
      case 'vendors': return <VendorsTable onViewDashboard={(v) => setViewingVendor(v)} />
      case 'reviews': return <ReviewsTable />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex">
      <aside className="w-56 bg-ink border-r border-white/8 flex flex-col fixed left-0 top-16 bottom-0 z-30">
        <div className="px-4 py-5 border-b border-white/8">
          <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { navigate(`/admin?tab=${id}`); setViewingVendor(null) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === id
                  ? 'text-white'
                  : 'text-white/45 hover:text-white/70 hover:bg-white/5'
              }`}
              style={activeTab === id ? { background: 'linear-gradient(90deg,rgba(232,49,122,.25),rgba(91,45,142,.25))' } : {}}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/8">
          <button onClick={() => { logout(); navigate('/admin/login') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/40 hover:text-white/70 rounded-xl hover:bg-white/5 transition-all">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-8">
        {renderTab()}
      </main>
    </div>
  )
}

export function AdminLoginPage_() { return <AdminLoginPage /> }
export default function AdminPage() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminDashboard /> : <AdminLoginPage />
}
