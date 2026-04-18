import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' }
})

// Attach auth token if available (admin or vendor)
api.interceptors.request.use(cfg => {
  const adminToken = localStorage.getItem('admin_token')
  const vendorToken = localStorage.getItem('vendor_token')
  
  if (adminToken) {
    cfg.headers.Authorization = `Bearer ${adminToken}`
  } else if (vendorToken) {
    cfg.headers.Authorization = `Bearer ${vendorToken}`
  }
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('vendor_token')
    }
    return Promise.reject(err)
  }
)

// ── Businesses ────────────────────────────────────────────────
export const businessApi = {
  list: (params) => api.get('/api/businesses', { params }).then(r => r.data),
  me: () => api.get('/api/businesses/me').then(r => r.data),
  stats: () => api.get('/api/businesses/me/stats').then(r => r.data),
  featured: (limit = 3) => api.get('/api/businesses/featured', { params: { limit } }).then(r => r.data),
  get: (slug) => api.get(`/api/businesses/${slug}`).then(r => r.data),
  create: (data) => api.post('/api/businesses', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/businesses/${id}`, data).then(r => r.data),
  adminUpdate: (id, data) => api.patch(`/api/businesses/admin/${id}`, data).then(r => r.data),
  adminDelete: (id) => api.delete(`/api/businesses/admin/${id}`),
  adminAll: (params) => api.get('/api/businesses/admin/all', { params }).then(r => r.data),
  autocomplete: (q) => api.get('/api/businesses/autocomplete', { params: { q } }).then(r => r.data),
}

// ── Categories ────────────────────────────────────────────────
export const categoryApi = {
  list: (isFeatured, parentId, parentSlug) => {
    let url = `/api/categories?`
    if (isFeatured !== null && isFeatured !== undefined) url += `is_featured=${isFeatured}&`
    if (parentId !== null && parentId !== undefined && parentId !== '') url += `parent_id=${parentId}&`
    if (parentSlug) url += `parent_slug=${parentSlug}&`
    return api.get(url).then(r => r.data)
  },
  get: (slug) => api.get(`/api/categories/${slug}`).then(r => r.data),
}

// ── Governorates ──────────────────────────────────────────────
export const governorateApi = {
  list: () => api.get('/api/governorates').then(r => r.data),
  get: (slug) => api.get(`/api/governorates/${slug}`).then(r => r.data),
}

// ── Reviews ───────────────────────────────────────────────────
export const reviewApi = {
  list: (businessId) => api.get(`/api/reviews/${businessId}`).then(r => r.data),
  me: () => api.get('/api/reviews/me').then(r => r.data),
  create: (data) => api.post('/api/reviews', data).then(r => r.data),
  approve: (id) => api.patch(`/api/reviews/admin/${id}/approve`).then(r => r.data),
  delete: (id) => api.delete(`/api/reviews/admin/${id}`),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  login: (data) => api.post('/api/admin/login', data).then(r => r.data),
  stats: () => api.get('/api/admin/stats').then(r => r.data),
  listVendors: () => api.get('/api/admin/vendors').then(r => r.data),
  deleteVendor: (id) => api.delete(`/api/admin/vendors/${id}`),
  toggleVendorStatus: (id, isActive) => api.patch(`/api/admin/vendors/${id}/status`, { is_active: isActive }).then(r => r.data),
  getVendorStats: (id) => api.get(`/api/admin/vendors/${id}/stats`).then(r => r.data),
  getVendorBusinesses: (id) => api.get(`/api/admin/vendors/${id}/businesses`).then(r => r.data),
  
  // Vendor Control
  vendorControl: () => api.get('/api/admin/vendor-control').then(res => res.data),
  getShopBookings: (bizId) => api.get(`/api/admin/bookings/${bizId}`).then(res => res.data),
  updateShopBookingStatus: (id, status) => api.patch(`/api/admin/bookings/${id}/status`, { status }).then(res => res.data),
  getShopServices: (bizId) => api.get(`/api/admin/services/${bizId}`).then(res => res.data),
  createShopService: (data) => api.post('/api/admin/services', data).then(res => res.data),
  deleteShopService: (id) => api.delete(`/api/admin/services/${id}`).then(res => res.data),

  createCategory: (data) => api.post('/api/admin/categories', data).then(r => r.data),
  updateCategory: (id, data) => api.put(`/api/admin/categories/${id}`, data).then(r => r.data),
  deleteCategory: (id) => api.delete(`/api/admin/categories/${id}`),
}

// ── Vendor Auth ────────────────────────────────────────────────
export const vendorAuthApi = {
  login: (data) => api.post('/api/auth/login', data).then(r => r.data),
  register: (data) => api.post('/api/auth/register', data).then(r => r.data),
  vendorRegister: (data) => api.post('/api/auth/vendor-register', data).then(r => r.data),
}

// ── Services ──────────────────────────────────────────────────
export const serviceApi = {
  create: (data) => api.post('/api/services', data).then(r => r.data),
  listByBusiness: (businessId) => api.get(`/api/services/business/${businessId}`).then(r => r.data),
  update: (id, data) => api.put(`/api/services/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/services/${id}`),
}

// ── Contact ───────────────────────────────────────────────────
export const contactApi = {
  send: (data) => api.post('/api/contact', data).then(r => r.data),
  listMessages: () => api.get('/api/contact/admin/messages').then(r => r.data),
  markAsRead: (id) => api.patch(`/api/contact/admin/messages/${id}/read`).then(r => r.data),
  deleteMessage: (id) => api.delete(`/api/contact/admin/messages/${id}`),
}

// ── Bookings ─────────────────────────────────────────────────
export const bookingApi = {
  create: (data) => api.post('/api/bookings/', data).then(r => r.data),
  vendorList: () => api.get('/api/bookings/vendor/me').then(r => r.data),
  updateStatus: (id, status) => api.patch(`/api/bookings/${id}/status`, { status }).then(r => r.data),
}

// ── Common ────────────────────────────────────────────────────
export const commonApi = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  }
}

export default api
