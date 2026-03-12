import { createContext, useContext, useState, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem('admin_token')
    return token ? { token } : null
  })

  const login = useCallback(async (email, password) => {
    try {
      const { access_token } = await adminApi.login({ email, password })
      localStorage.setItem('admin_token', access_token)
      setAdmin({ token: access_token })
      toast.success('Logged in successfully')
      return true
    } catch {
      toast.error('Invalid credentials')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setAdmin(null)
    toast.success('Logged out')
  }, [])

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAdmin: !!admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
