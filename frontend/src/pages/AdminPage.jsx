import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { adminApi, businessApi, reviewApi } from '@/lib/api'
import { Spinner, Pagination } from '@/components/ui'
import { LayoutDashboard, Building2, Star, LogOut, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react'
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
function BusinessTable() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-businesses', page, statusFilter],
    queryFn: () => businessApi.adminAll({ page, per_page: 10, status: statusFilter || undefined })
  })

  const approveMutation = useMutation({
    mutationFn: (id) => businessApi.adminUpdate(id, { status: 'active' }),
    onSuccess: () => { toast.success('Business approved'); qc.invalidateQueries(['admin-businesses']) }
  })
  const rejectMutation = useMutation({
    mutationFn: (id) => businessApi.adminUpdate(id, { status: 'rejected' }),
    onSuccess: () => { toast.success('Business rejected'); qc.invalidateQueries(['admin-businesses']) }
  })
  const deleteMutation = useMutation({
    mutationFn: businessApi.adminDelete,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['admin-businesses']) }
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
                    <div className="flex items-center gap-1">
                      <a href={`/business/${b.slug}`} target="_blank" rel="noreferrer"
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center transition-colors" title="View">
                        <Eye size={13} />
                      </a>
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => approveMutation.mutate(b.id)}
                            className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors" title="Approve">
                            <CheckCircle size={13} />
                          </button>
                          <button onClick={() => rejectMutation.mutate(b.id)}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors" title="Reject">
                            <XCircle size={13} />
                          </button>
                        </>
                      )}
                      <button onClick={() => { if(confirm('Delete this business?')) deleteMutation.mutate(b.id) }}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors" title="Delete">
                        <Trash2 size={13} />
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

// ── Dashboard Main ────────────────────────────────────────────
function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.stats })

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-ink border-r border-white/8 flex flex-col fixed left-0 top-16 bottom-0 z-30">
        <div className="px-4 py-5 border-b border-white/8">
          <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
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
          <button onClick={() => { logout(); navigate('/') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/40 hover:text-white/70 rounded-xl hover:bg-white/5 transition-all">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-8">
        {activeTab === 'overview' && (
          <div>
            <h1 className="font-display text-3xl font-normal text-ink mb-6">Dashboard Overview</h1>
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
          </div>
        )}
        {activeTab === 'businesses' && <BusinessTable />}
        {activeTab === 'reviews' && <ReviewsTable />}
      </main>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────
export function AdminLoginPage_() { return <AdminLoginPage /> }
export default function AdminPage() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminDashboard /> : <AdminLoginPage />
}
