import { createContext, useContext, useState, useCallback } from 'react'
import { adminApi, vendorAuthApi } from '@/lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem('admin_token')
    return token ? { token } : null
  })

  const [vendor, setVendor] = useState(() => {
    const token = localStorage.getItem('vendor_token')
    return token ? { token } : null
  })

  // Admin Auth
  const login = useCallback(async (email, password) => {
    try {
      const { access_token } = await adminApi.login({ email, password })
      localStorage.setItem('admin_token', access_token)
      setAdmin({ token: access_token })
      toast.success('Admin logged in successfully')
      return true
    } catch {
      toast.error('Invalid admin credentials')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setAdmin(null)
    toast.success('Admin logged out')
  }, [])

  // Vendor Auth
  const vendorLogin = useCallback(async (email, password) => {
    try {
      const { access_token } = await vendorAuthApi.login({ email, password })
      localStorage.setItem('vendor_token', access_token)
      setVendor({ token: access_token })
      toast.success('Logged in successfully')
      return true
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Invalid credentials')
      return false
    }
  }, [])

  const vendorRegister = useCallback(async (data) => {
    try {
      const { access_token } = await vendorAuthApi.vendorRegister(data)
      localStorage.setItem('vendor_token', access_token)
      setVendor({ token: access_token })
      toast.success('Registration submitted for approval')
      return true
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Registration failed')
      return false
    }
  }, [])

  const vendorLogout = useCallback(() => {
    localStorage.removeItem('vendor_token')
    setVendor(null)
    toast.success('Logged out')
  }, [])

  return (
    <AuthContext.Provider value={{ 
      admin, login, logout, isAdmin: !!admin,
      vendor, vendorLogin, vendorRegister, vendorLogout, isVendor: !!vendor
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
