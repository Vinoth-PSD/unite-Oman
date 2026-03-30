import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { categoryApi, governorateApi, commonApi } from '@/lib/api'
import { Spinner } from '@/components/ui'
import { Building2, Mail, Lock, User, MapPin, Tag, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VendorAuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    business_name: '',
    category_id: '',
    location_id: '',
  })

  const [formFiles, setFormFiles] = useState({
    id_proof: null,
    owner_photo: null,
    trade_license: null
  })

  const { vendorLogin, vendorRegister } = useAuth()
  const navigate = useNavigate()

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })
  const { data: governorates } = useQuery({ queryKey: ['governorates'], queryFn: () => governorateApi.list() })

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let success = false
      if (isLogin) {
        success = await vendorLogin(formData.email, formData.password)
        if (success) navigate('/vendor/dashboard')
      } else {
        // Handle File Uploads first
        if (!formFiles.id_proof || !formFiles.owner_photo) {
          toast.error("Please upload mandatory documents (ID Proof & Photo)")
          setLoading(false)
          return
        }

        const uploadPromises = [
          commonApi.upload(formFiles.id_proof),
          commonApi.upload(formFiles.owner_photo),
          formFiles.trade_license ? commonApi.upload(formFiles.trade_license) : Promise.resolve({ url: null })
        ]

        toast.loading("Uploading documents...", { id: 'uploading' })
        const [idRes, photoRes, tradeRes] = await Promise.all(uploadPromises)
        toast.dismiss('uploading')

        success = await vendorRegister({
          ...formData,
          category_id: parseInt(formData.category_id),
          location_id: parseInt(formData.location_id),
          id_proof_url: idRes.url,
          owner_photo_url: photoRes.url,
          trade_license_url: tradeRes?.url || null
        })
        if (success) {
          toast.success("Registration submitted! Admin will review soon.")
          setIsLogin(true)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24 pb-12 px-6">
      <div className={`bg-white rounded-3xl border border-gray-100 shadow-xl p-8 w-full transition-all duration-500 ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-light text-pink rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink/10">
            <Building2 size={32} />
          </div>
          <h1 className="font-display text-2xl font-normal text-ink">
            {isLogin ? 'Vendor Login' : 'List Your Business'}
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">
            {isLogin 
              ? 'Welcome back to UniteOman Business' 
              : 'Join Oman\'s premier digital directory in one step.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className={`grid gap-5 ${isLogin ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            {/* Left Column: Account Info */}
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input name="full_name" value={formData.full_name} onChange={handleChange} required
                      placeholder="Your name"
                      className="w-full border-[1.5px] border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-pink transition-colors bg-gray-50/30" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required
                    placeholder="shop@example.com"
                    className="w-full border-[1.5px] border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-pink transition-colors bg-gray-50/30" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input name="password" type="password" value={formData.password} onChange={handleChange} required
                    placeholder="••••••••" minLength={6}
                    className="w-full border-[1.5px] border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-pink transition-colors bg-gray-50/30" />
                </div>
              </div>
            </div>

            {/* Right Column: Business Info & Verification (Only for Registration) */}
            {!isLogin && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Business Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input name="business_name" value={formData.business_name} onChange={handleChange} required
                      placeholder="e.g. Muscat Coffee House"
                      className="w-full border-[1.5px] border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-pink transition-colors bg-gray-50/30" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Category</label>
                    <select name="category_id" value={formData.category_id} onChange={handleChange} required
                      className="w-full border-[1.5px] border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink transition-colors bg-gray-50/30 appearance-none font-semibold">
                      <option value="">Select Category</option>
                      {categories?.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Location</label>
                    <select name="location_id" value={formData.location_id} onChange={handleChange} required
                      className="w-full border-[1.5px] border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink transition-colors bg-gray-50/30 appearance-none font-semibold">
                      <option value="">Select Location</option>
                      {governorates?.map(g => <option key={g.id} value={g.id}>{g.name_en}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 mt-4">
                  <h3 className="text-[11px] font-black text-ink uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={14} /> Documentation
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">ID Proof (Mandatory) *</label>
                      <input type="file" required accept="image/*,application/pdf"
                        onChange={(e) => setFormFiles(p => ({...p, id_proof: e.target.files[0]}))}
                        className="text-[10px] font-bold text-gray-400 file:bg-pink-light file:text-pink file:border-none file:rounded-lg file:px-3 file:py-1 file:mr-3 cursor-pointer hover:file:bg-pink-100 transition-all" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Vendor Photo (Profile) *</label>
                      <input type="file" required accept="image/*"
                        onChange={(e) => setFormFiles(p => ({...p, owner_photo: e.target.files[0]}))}
                        className="text-[10px] font-bold text-gray-400 file:bg-blue-50 file:text-blue-600 file:border-none file:rounded-lg file:px-3 file:py-1 file:mr-3 cursor-pointer hover:file:bg-blue-100 transition-all" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Trade License (Optional)</label>
                      <input type="file" accept="image/*,application/pdf"
                        onChange={(e) => setFormFiles(p => ({...p, trade_license: e.target.files[0]}))}
                        className="text-[10px] font-bold text-gray-400 file:bg-gray-100 file:text-gray-600 file:border-none file:rounded-lg file:px-3 file:py-1 file:mr-3 cursor-pointer hover:file:bg-gray-200 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button type="submit" disabled={loading} 
            className="w-full brand-btn py-4 rounded-xl text-sm font-bold mt-4 disabled:opacity-60 shadow-xl shadow-pink/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
            {loading ? <Spinner className="w-5 h-5" /> : (isLogin ? 'Log In to Dashboard →' : 'Submit Registration for Approval →')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center text-sm font-medium text-gray-500">
          {isLogin ? "New vendor? " : "Already registered? "}
          <button onClick={() => setIsLogin(!isLogin)} 
            className="text-pink hover:text-purple transition-colors font-bold ml-1">
            {isLogin ? 'Create Your Business Profile' : 'Sign in to Your Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
