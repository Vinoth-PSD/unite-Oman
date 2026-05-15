import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProtectedCustomerRoute({ children, message }) {
  const location = useLocation()
  const customerUser = localStorage.getItem('customerUser')

  useEffect(() => {
    if (!customerUser && message) {
      toast.error(message)
    }
  }, [])

  if (!customerUser) {
    return (
      <Navigate
        to="/customer/login"
        state={{ redirectTo: location.pathname }}
        replace
      />
    )
  }

  return children
}