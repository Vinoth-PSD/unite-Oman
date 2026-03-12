import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomePage from '@/pages/HomePage'
import BusinessListPage from '@/pages/BusinessListPage'
import BusinessProfilePage from '@/pages/BusinessProfilePage'
import CategoriesPage from '@/pages/CategoriesPage'
import AdminPage from '@/pages/AdminPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 }
  }
})

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px' }
          }} />
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/businesses" element={<PublicLayout><BusinessListPage /></PublicLayout>} />
            <Route path="/business/:slug" element={<PublicLayout><BusinessProfilePage /></PublicLayout>} />
            <Route path="/categories" element={<PublicLayout><CategoriesPage /></PublicLayout>} />

            {/* Admin — no public layout */}
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/admin/login" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
