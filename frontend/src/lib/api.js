import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' }
})

// Attach auth token if available
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('admin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) localStorage.removeItem('admin_token')
    return Promise.reject(err)
  }
)

// ── Businesses ────────────────────────────────────────────────
export const businessApi = {
  list: (params) => api.get('/api/businesses', { params }).then(r => r.data),
  featured: (limit = 3) => api.get('/api/businesses/featured', { params: { limit } }).then(r => r.data),
  get: (slug) => api.get(`/api/businesses/${slug}`).then(r => r.data),
  create: (data) => api.post('/api/businesses', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/businesses/${id}`, data).then(r => r.data),
  adminUpdate: (id, data) => api.patch(`/api/businesses/admin/${id}`, data).then(r => r.data),
  adminDelete: (id) => api.delete(`/api/businesses/admin/${id}`),
  adminAll: (params) => api.get('/api/businesses/admin/all', { params }).then(r => r.data),
}

// ── Categories ────────────────────────────────────────────────
export const categoryApi = {
  list: (featuredOnly = false) => api.get('/api/categories', { params: { featured_only: featuredOnly } }).then(r => r.data),
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
  create: (data) => api.post('/api/reviews', data).then(r => r.data),
  approve: (id) => api.patch(`/api/reviews/admin/${id}/approve`).then(r => r.data),
  delete: (id) => api.delete(`/api/reviews/admin/${id}`),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  login: (data) => api.post('/api/admin/login', data).then(r => r.data),
  stats: () => api.get('/api/admin/stats').then(r => r.data),
}

export default api
