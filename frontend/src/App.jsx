import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import AdminNavbar from '@/components/layout/AdminNavbar'
import VendorNavbar from '@/components/layout/VendorNavbar'
import Footer from '@/components/layout/Footer'
import HomePage from '@/pages/HomePage'
import BusinessListPage from '@/pages/BusinessListPage'
import BusinessProfilePage from '@/pages/BusinessProfilePage'
import CategoriesPage from '@/pages/CategoriesPage'
import GovernoratesPage from '@/pages/GovernoratesPage'
import AdminPage from '@/pages/AdminPage'
import VendorAuthPage from '@/pages/VendorAuthPage'
import ListBusinessPage from '@/pages/ListBusinessPage'
import VendorDashboardPage from '@/pages/VendorDashboardPage'
import EditShopPage from '@/pages/EditShopPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 }
  }
})

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      <main className="pt-16">{children}</main>
    </>
  )
}

function VendorLayout({ children }) {
  return (
    <>
      <VendorNavbar />
      <main className="pt-16">{children}</main>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster position="top-right" toastOptions={{
            style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px' }
          }} />
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/businesses" element={<PublicLayout><BusinessListPage /></PublicLayout>} />
            <Route path="/business/:slug" element={<PublicLayout><BusinessProfilePage /></PublicLayout>} />
            <Route path="/categories" element={<PublicLayout><CategoriesPage /></PublicLayout>} />
            <Route path="/governorates" element={<PublicLayout><GovernoratesPage /></PublicLayout>} />

            {/* Vendor — vendor navbar */}
            <Route path="/vendor/login" element={<PublicLayout><VendorAuthPage /></PublicLayout>} />
            <Route path="/vendor/dashboard/*" element={<VendorLayout><VendorDashboardPage /></VendorLayout>} />
            <Route path="/vendor/edit-shop/:id" element={<VendorLayout><EditShopPage /></VendorLayout>} />
            <Route path="/list-business" element={<PublicLayout><ListBusinessPage /></PublicLayout>} />

            {/* Admin — admin navbar */}
            <Route path="/admin/*" element={<AdminLayout><AdminPage /></AdminLayout>} />
            <Route path="/admin/login" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
