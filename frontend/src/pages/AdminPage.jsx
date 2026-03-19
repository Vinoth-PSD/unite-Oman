import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { adminApi, businessApi, reviewApi, categoryApi, contactApi, governorateApi, commonApi } from '@/lib/api'
import { Spinner, Pagination } from '@/components/ui'
import { LayoutDashboard, Building2, Star, LogOut, CheckCircle, XCircle, Eye, Trash2, X, Users, FolderTree, Plus, Edit2, MessageSquare, Mail, Phone, Clock, Zap, Search, MapPin, Image as ImageIcon, Save, Upload, Globe } from 'lucide-react'
import Logo from '@/components/ui/Logo'
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

// ── Messages Table ────────────────────────────────────────────
function MessagesTable() {
  const qc = useQueryClient()
  const [selectedMessage, setSelectedMessage] = useState(null)
  const { data: messages, isLoading } = useQuery({ 
    queryKey: ['admin-messages'], 
    queryFn: contactApi.listMessages 
  })

  const readMutation = useMutation({
    mutationFn: contactApi.markAsRead,
    onSuccess: () => { toast.success('Marked as read'); qc.invalidateQueries(['admin-messages']) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Update failed')
  })

  const deleteMutation = useMutation({
    mutationFn: contactApi.deleteMessage,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['admin-messages']) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Delete failed')
  })

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <h2 className="font-bold text-ink text-lg mb-4">Contact Messages</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b border-gray-100">
                    {['Date','From','Phone','Subject','Message','Status','Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages?.map(m => (
                    <tr key={m.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${!m.is_read ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-semibold text-ink">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-ink whitespace-nowrap">{m.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-ink font-medium max-w-[180px] truncate">{m.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[220px] truncate">{m.message}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${m.is_read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                          {m.is_read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setSelectedMessage(m); if (!m.is_read) readMutation.mutate(m.id) }}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center transition" title="View Message">
                            <Eye size={14} />
                          </button>
                          {!m.is_read && (
                            <button disabled={readMutation.isPending} onClick={() => readMutation.mutate(m.id)}
                              className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition disabled:opacity-50" title="Mark as Read">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button disabled={deleteMutation.isPending} onClick={() => { if(confirm('Delete this message?')) deleteMutation.mutate(m.id) }}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition disabled:opacity-50" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {messages?.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm font-semibold">No messages yet.</div>
            )}
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-ink/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300">
            {/* Modal Header with Logo */}
            <div className="bg-ink p-10 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-pink to-purple" />
              <div className="flex flex-col items-center gap-3">
                <Logo height={35} />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Administrator Portal</span>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-10 space-y-8 bg-white">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-pink/5 text-pink text-[10px] font-black uppercase tracking-widest rounded-full border border-pink/10">
                  Contact Message Inquiry
                </div>
                <h2 className="font-display text-3xl font-normal text-ink leading-tight">{selectedMessage.subject}</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sender Name</p>
                  <p className="font-display text-xl text-ink font-normal">{selectedMessage.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Received On</p>
                  <p className="font-display text-xl text-ink font-normal">{new Date(selectedMessage.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-pink">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold text-ink">{selectedMessage.email}</p>
                  </div>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-ink">{selectedMessage.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Body</p>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl text-gray-600 text-base leading-relaxed whitespace-pre-wrap border border-gray-100 italic">
                  "{selectedMessage.message}"
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  disabled={deleteMutation.isPending}
                  onClick={() => { if(confirm('Permanently delete this message?')) deleteMutation.mutate(selectedMessage.id, { onSuccess: () => setSelectedMessage(null) }) }}
                  className="flex-1 bg-red-50 text-red-600 border border-red-100 py-4 rounded-2xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  Delete Message
                </button>
                <button onClick={() => setSelectedMessage(null)}
                  className="w-32 py-4 bg-ink text-white rounded-2xl text-sm font-bold hover:bg-ink/90 transition-all border border-ink">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Reviews Table ─────────────────────────────────────────────
function ReviewsTable() {
  const qc = useQueryClient()
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

// ── Categories Table ──────────────────────────────────────────
function CategoriesTable() {
  const qc = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [form, setForm] = useState({ name_en: '', name_ar: '', slug: '', icon: '', is_featured: false })

  const { data: cats, isLoading } = useQuery({ 
    queryKey: ['admin-categories'], 
    queryFn: () => categoryApi.list() 
  })

  const saveMutation = useMutation({
    mutationFn: (data) => editingCat 
      ? adminApi.updateCategory(editingCat.id, data) 
      : adminApi.createCategory(data),
    onSuccess: () => {
      toast.success(editingCat ? 'Category updated' : 'Category created')
      qc.invalidateQueries(['admin-categories'])
      handleClose()
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Save failed')
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      toast.success('Category deleted')
      qc.invalidateQueries(['admin-categories'])
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Delete failed. Ensure no shops are using this category.')
  })

  const handleEdit = (cat) => {
    setEditingCat(cat)
    setForm({ 
      name_en: cat.name_en, 
      name_ar: cat.name_ar, 
      slug: cat.slug, 
      icon: cat.icon || '', 
      is_featured: cat.is_featured 
    })
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingCat(null)
    setForm({ name_en: '', name_ar: '', slug: '', icon: '', is_featured: false })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-ink text-lg">Categories</h2>
        <button onClick={() => setIsModalOpen(true)} className="brand-btn px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Spinner /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Icon</th>
                <th className="text-left font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Name (EN/AR)</th>
                <th className="text-left font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Slug</th>
                <th className="text-left font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Businesses</th>
                <th className="text-left font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Featured</th>
                <th className="text-left font-bold text-gray-400 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats?.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xl">{c.icon || '📁'}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{c.name_en}</div>
                    <div className="text-xs text-gray-400">{c.name_ar}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 font-bold text-purple">{c.business_count}</td>
                  <td className="px-4 py-3">
                    {c.is_featured ? <span className="text-[10px] font-bold text-pink bg-pink/10 px-2 py-0.5 rounded-full uppercase">Featured</span> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(c)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => { if(confirm(`Delete "${c.name_en}"?`)) deleteMutation.mutate(c.id) }}
                        disabled={deleteMutation.isPending}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
                        {deleteMutation.isPending && deleteMutation.variables === c.id ? <Spinner className="w-3 h-3" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 p-8 space-y-4">
            <h3 className="font-bold text-ink text-xl mb-2">{editingCat ? 'Edit Category' : 'Add New Category'}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Name (English)</label>
                <input required value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-pink" placeholder="Restaurants" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Name (Arabic)</label>
                <input required value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-pink text-right" placeholder="مطاعم" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Slug</label>
              <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-pink font-mono" placeholder="restaurants" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Icon (Emoji)</label>
              <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-pink" placeholder="🍔" maxLength={2} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer py-2 group">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-pink focus:ring-pink" />
              <span className="text-sm font-semibold text-gray-600 group-hover:text-ink">Featured Category</span>
            </label>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleClose} className="flex-1 py-3 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending} className="flex-1 brand-btn py-3 rounded-xl text-sm font-bold disabled:opacity-50">
                {saveMutation.isPending ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
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
    { id: 'vendor-control', label: 'Vendor Control', icon: Zap },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
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
      case 'vendors':
        return <VendorsTable onViewDashboard={setViewingVendor} />
      case 'vendor-control':
        return <VendorControlTable />
      case 'categories':
 return <CategoriesTable />
      case 'messages': return <MessagesTable />
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

// ── Vendor Control (Advanced Components) ──────────────────────

function VendorControlTable() {
  const [selectedApptBiz, setSelectedApptBiz] = useState(null)
  const [selectedServiceBiz, setSelectedServiceBiz] = useState(null)
  const [selectedEditBiz, setSelectedEditBiz] = useState(null)
  const [search, setSearch] = useState('')
  
  const { data: shops, isLoading } = useQuery({ 
      queryKey: ['admin-vendor-control'], 
      queryFn: adminApi.vendorControl 
  })

  // Filter by search
  const filteredShops = shops?.filter(s => 
    s.name_en.toLowerCase().includes(search.toLowerCase()) || 
    s.owner_email?.toLowerCase().includes(search.toLowerCase())
  )

  // Group by category
  const grouped = filteredShops?.reduce((acc, shop) => {
    const cat = shop.category?.name_en || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(shop)
    return acc
  }, {})

  if (isLoading) return <Spinner />

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-zap-gradient rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group hover:rotate-0 transition-transform">
             <Zap size={28} />
          </div>
          <div>
            <h1 className="font-display text-4xl font-normal text-ink">Vendor Control</h1>
            <p className="text-gray-400 text-sm font-semibold tracking-tight">Centralized Administrative Registry</p>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-3">
           <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-pink transition-colors">
                 <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search shops or vendors..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-pink/10 focus:border-pink transition-all shadow-sm"
              />
           </div>
           <div className="flex items-center gap-2">
              <p className="text-[10px] text-pink font-black uppercase tracking-[0.2em] bg-pink/5 px-3 py-1 rounded-full border border-pink/10">Administrator Mode</p>
              <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">{filteredShops?.length || 0} Results</p>
           </div>
        </div>
      </div>

      {grouped && Object.entries(grouped).length > 0 ? Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-6">
          <div className="flex items-center gap-4">
             <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.4em] whitespace-nowrap pl-2">{category}</h3>
             <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-100 to-transparent rounded-full" />
             <span className="text-[9px] font-bold text-gray-300 uppercase">{items.length} units</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {items.map(shop => (
              <div key={shop.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col gap-6 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${shop.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {shop.status}
                   </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center text-4xl overflow-hidden p-1.5 shadow-inner group-hover:scale-105 transition-transform duration-500">
                     {shop.logo_url ? <img src={shop.logo_url} className="w-full h-full object-cover rounded-2xl" /> : (shop.category?.icon || '🏢')}
                  </div>
                  <div>
                    <h4 className="font-display text-2xl font-normal text-ink mb-1 group-hover:text-pink transition-colors line-clamp-1">{shop.name_en}</h4>
                    <div className="flex flex-col gap-0.5">
                       <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight truncate max-w-[200px]">{shop.owner_email || 'ORPHAN_ACCOUNT'}</p>
                       <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest">{shop.governorate?.name_en || 'REMOTE'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <button onClick={() => setSelectedApptBiz(shop)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-50/50 hover:bg-blue-500 hover:text-white transition-all group/btn" title="Manage Appointments">
                    <Clock size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Bookings</span>
                  </button>
                  <button onClick={() => setSelectedServiceBiz(shop)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-purple-50/50 hover:bg-purple-500 hover:text-white transition-all group/btn" title="Manage Services">
                    <Zap size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Services</span>
                  </button>
                  <button onClick={() => setSelectedEditBiz(shop)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-500 hover:text-white transition-all group/btn" title="Edit Profile">
                    <Edit2 size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Edit</span>
                  </button>
                  <a href={`/business/${shop.slug}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-pink-light/50 hover:bg-pink hover:text-white transition-all group/btn" title="View Public">
                    <Eye size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Live</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )) : (
        <div className="py-32 text-center bg-white rounded-[4rem] border border-dashed border-gray-200 shadow-inner">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
              <Search size={48} />
           </div>
           <h3 className="font-display text-3xl text-ink mb-2">No Matches Found</h3>
           <p className="text-gray-400 font-semibold tracking-tight text-lg">Try adjusting your search filters or terminology.</p>
           {search && (
              <button onClick={() => setSearch('')} className="mt-8 text-pink font-bold border-b border-pink/30 hover:border-pink transition-all">Clear active search query</button>
           )}
        </div>
      )}

      {selectedApptBiz && <AdminAppointmentModal business={selectedApptBiz} onClose={() => setSelectedApptBiz(null)} />}
      {selectedServiceBiz && <AdminServiceModal business={selectedServiceBiz} onClose={() => setSelectedServiceBiz(null)} />}
      {selectedEditBiz && <AdminEditShopModal business={selectedEditBiz} onClose={() => setSelectedEditBiz(null)} />}
    </div>
  )
}

function AdminEditShopModal({ business, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name_en: business.name_en || '',
    name_ar: business.name_ar || '',
    description: business.description || '',
    short_description: business.short_description || '',
    category_id: business.category?.id || '',
    governorate_id: business.governorate?.id || '',
    phone: business.phone || '',
    whatsapp: business.whatsapp || '',
    email: business.email || '',
    website: business.website || '',
    address: business.address || '',
    logo_url: business.logo_url || '',
    cover_image_url: business.cover_image_url || '',
    gallery_urls: business.gallery_urls || [],
    business_hours: business.business_hours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: true },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false },
    }
  })

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })
  const { data: governorates } = useQuery({ queryKey: ['governorates'], queryFn: () => governorateApi.list() })

  const mutation = useMutation({
    mutationFn: (data) => businessApi.update(business.id, data),
    onSuccess: () => {
      toast.success('Shop record synchronized')
      queryClient.invalidateQueries(['admin-vendor-control'])
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.detail || 'Update failed')
  })

  const handleFileUpload = async (file, type) => {
    try {
      const res = await commonApi.upload(file)
      if (type === 'logo') setForm(prev => ({ ...prev, logo_url: res.url }))
      else if (type === 'cover') setForm(prev => ({ ...prev, cover_image_url: res.url }))
      else if (type === 'gallery') setForm(prev => ({ ...prev, gallery_urls: [...prev.gallery_urls, res.url] }))
      toast.success('Asset uploaded')
    } catch { toast.error('Upload failed') }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (form.category_id) payload.category_id = parseInt(form.category_id)
    if (form.governorate_id) payload.governorate_id = parseInt(form.governorate_id)
    mutation.mutate(payload)
  }

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-ink/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-amber-500" />
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50">
                <Edit2 size={24} />
             </div>
             <div>
                <h3 className="font-display text-3xl text-ink">Administrative Override</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Editing <span className="text-ink">{business.name_en}</span></p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleSubmit} disabled={mutation.isPending} className="brand-btn px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-pink/20">
                {mutation.isPending ? <Spinner className="w-4 h-4" /> : <Save size={18} />}
                Sync Changes
             </button>
             <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white hover:bg-gray-100 text-gray-400 transition-all border border-gray-100">
                <X size={24} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
           <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                 <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Building2 size={14} /> Core Metadata
                 </h4>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Name (EN)</label>
                       <input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} className="w-full bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-200 shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Name (AR)</label>
                       <input value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} className="w-full bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-200 shadow-sm text-right" dir="rtl" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                       <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none shadow-sm">
                          {categories?.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Governorate</label>
                       <select value={form.governorate_id} onChange={e => setForm({...form, governorate_id: e.target.value})} className="w-full bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none shadow-sm">
                          {governorates?.map(g => <option key={g.id} value={g.id}>{g.name_en}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
                    <textarea value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} rows={2} className="w-full bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none shadow-sm resize-none" />
                 </div>
              </div>

              <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                 <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2">
                    <ImageIcon size={14} /> Media Assets
                 </h4>

                 <div className="flex gap-4">
                    <div className="group relative w-24 h-24 bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm">
                       {form.logo_url ? <img src={form.logo_url} className="w-full h-full object-cover" /> : <Upload size={20} className="text-gray-300" />}
                       <input type="file" accept="image/*" onChange={e => handleFileUpload(e.target.files[0], 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                       <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Edit2 size={14} className="text-white" />
                       </div>
                    </div>
                    <div className="group relative flex-1 h-24 bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm">
                       {form.cover_image_url ? <img src={form.cover_image_url} className="w-full h-full object-cover" /> : <Upload size={20} className="text-gray-300" />}
                       <input type="file" accept="image/*" onChange={e => handleFileUpload(e.target.files[0], 'cover')} className="absolute inset-0 opacity-0 cursor-pointer" />
                       <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Edit2 size={14} className="text-white" />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-4 gap-3">
                    {form.gallery_urls.map((url, i) => (
                       <div key={i} className="relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-100 group shadow-inner">
                          <img src={url} className="w-full h-full object-cover" />
                          <button onClick={() => setForm({...form, gallery_urls: form.gallery_urls.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all shadow-md"><X size={12} /></button>
                       </div>
                    ))}
                    <div className="relative aspect-square bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-amber-400 transition-all group">
                       <Plus size={20} className="text-gray-300 group-hover:text-amber-400" />
                       <input type="file" accept="image/*" onChange={e => handleFileUpload(e.target.files[0], 'gallery')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
              <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                 <Clock size={14} /> Schedule Configuration
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                 {Object.entries(form.business_hours).map(([day, h]) => (
                    <div key={day} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-hover">
                       <span className="text-[11px] font-black uppercase text-ink/60 w-24">{day}</span>
                       <div className="flex items-center gap-2">
                          {!h.closed ? (
                             <>
                                <input type="time" value={h.open} onChange={e => setForm({...form, business_hours: {...form.business_hours, [day]: {...h, open: e.target.value}}})} className="text-[10px] font-bold border-none bg-gray-50 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-amber-200" />
                                <span className="text-gray-300 text-xs">→</span>
                                <input type="time" value={h.close} onChange={e => setForm({...form, business_hours: {...form.business_hours, [day]: {...h, close: e.target.value}}})} className="text-[10px] font-bold border-none bg-gray-50 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-amber-200" />
                             </>
                          ) : <span className="text-[10px] font-black text-red-400/60 tracking-tighter uppercase mr-4">Shop is Closed</span>}
                          <button onClick={() => setForm({...form, business_hours: {...form.business_hours, [day]: {...h, closed: !h.closed}}})} className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${h.closed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                             {h.closed ? 'Open' : 'Close'}
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function AdminAppointmentModal({ business, onClose }) {
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['admin-shop-bookings', business.id],
    queryFn: () => adminApi.getShopBookings(business.id)
  })

  const updateStatus = async (id, status) => {
    try {
      await adminApi.updateShopBookingStatus(id, status)
      toast.success(`Booking ${status}`)
      refetch()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-ink/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-blue-500" />
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Clock size={16} />
               </div>
               <h3 className="font-display text-3xl text-ink">Appointment Manager</h3>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">Monitoring <span className="text-ink">{business.name_en}</span></p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white hover:bg-red-500 hover:text-white transition-all shadow-md border border-gray-100 group">
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {isLoading ? <Spinner /> : !bookings?.length ? (
            <div className="text-center py-24 grayscale opacity-40">
               <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                  <Clock size={50} />
               </div>
               <p className="font-display text-2xl text-ink/40">No appointments scheduled</p>
               <p className="text-sm font-bold text-gray-400 mt-2">Historical and future bookings will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
               {bookings.map(booking => (
                 <div key={booking.id} className="flex items-center justify-between p-7 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100/50 transition-all group">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-colors">
                         {booking.name[0].toUpperCase()}
                       </div>
                       <div>
                         <p className="font-display text-xl text-ink leading-none mb-1">{booking.name}</p>
                         <div className="flex items-center gap-3">
                            <p className="text-xs text-gray-400 font-bold">{booking.phone}</p>
                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                            <p className="text-xs text-gray-300 font-semibold">{booking.email}</p>
                         </div>
                       </div>
                    </div>
                    <div className="px-8 border-x border-gray-50 text-center">
                       <p className="text-base font-black text-ink mb-1">{booking.service || 'Standard Service'}</p>
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-[11px] text-ink font-bold">{booking.date}</p>
                          <span className="text-gray-300">|</span>
                          <p className="text-[11px] text-blue-500 font-black">{booking.time}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                         booking.status === 'confirmed' ? 'bg-green-500 text-white' :
                         booking.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-600 border border-amber-200'
                       }`}>{booking.status}</span>
                       
                       {booking.status === 'pending' && (
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => updateStatus(booking.id, 'confirmed')} className="w-10 h-10 bg-green-50 text-green-500 rounded-xl shadow-sm border border-green-100 hover:bg-green-500 hover:text-white transition-all transform hover:scale-110"><CheckCircle size={18} /></button>
                           <button onClick={() => updateStatus(booking.id, 'cancelled')} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl shadow-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"><XCircle size={18} /></button>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AdminServiceModal({ business, onClose }) {
  const [newS, setNewS] = useState({ name: '', description: '', price: '' })
  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['admin-shop-services', business.id],
    queryFn: () => adminApi.getShopServices(business.id)
  })

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await adminApi.createShopService({ ...newS, business_id: business.id })
      setNewS({ name: '', description: '', price: '' })
      toast.success('Service injected successfully')
      refetch()
    } catch { toast.error('Encryption key mismatch / Injection failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this service signature?')) return
    try {
      await adminApi.deleteShopService(id)
      toast.success('Service purged')
      refetch()
    } catch { toast.error('Purge operation failed') }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-ink/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-purple-600" />
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Zap size={16} />
               </div>
               <h3 className="font-display text-3xl text-ink">Service Registry</h3>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">Control Over <span className="text-ink">{business.name_en}</span></p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white hover:bg-purple-600 hover:text-white transition-all shadow-md border border-gray-100 group">
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           <form onSubmit={handleAdd} className="mb-12 p-8 bg-purple-50/30 border border-purple-100/30 rounded-[2.5rem] space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                 <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] font-display">Manual Entry Interface</p>
                 <span className="text-[9px] text-gray-300 font-bold uppercase">Authorized Access</span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                    <input placeholder="Ex: Master Haircut" value={newS.name} onChange={e => setNewS({...newS, name: e.target.value})} className="w-full border-none bg-white rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-purple-200 shadow-sm font-semibold" required />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price Tier</label>
                    <input placeholder="Ex: 15 OMR" value={newS.price} onChange={e => setNewS({...newS, price: e.target.value})} className="w-full border-none bg-white rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-purple-200 shadow-sm font-semibold" />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Capabilities Description</label>
                 <input placeholder="What does this service involve?" value={newS.description} onChange={e => setNewS({...newS, description: e.target.value})} className="w-full border-none bg-white rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-purple-200 shadow-sm font-semibold" />
              </div>
              <button type="submit" className="w-full py-4 bg-ink text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:shadow-xl transition-all flex items-center justify-center gap-3">
                 Inject Service Definition <Zap size={14} className="animate-pulse" />
              </button>
           </form>

           <div className="space-y-5">
              <div className="flex items-center gap-3">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Active Ecosystem Definitions</h4>
                 <div className="h-[1px] flex-1 bg-gray-50" />
              </div>
              {isLoading ? <Spinner /> : services?.length === 0 ? (
                 <div className="text-center py-12 opacity-30">
                    <Zap size={32} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No active definitions found</p>
                 </div>
              ) : (
                <div className="grid gap-4">
                   {services?.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm group hover:border-purple-200/50 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors">
                             <Zap size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-ink text-base mb-0.5">{s.name}</h4>
                            <div className="flex items-center gap-3">
                               <p className="text-xs text-pink font-bold">{s.price || 'P.O.A'}</p>
                               <span className="w-1 h-1 bg-gray-200 rounded-full" />
                               <p className="text-[10px] text-gray-400 font-semibold italic">{s.description || 'No descriptive data'}</p>
                            </div>
                          </div>
                       </div>
                       <button onClick={() => handleDelete(s.id)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Trash2 size={18} />
                       </button>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
