import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, MapPin, Image as ImageIcon, Save, ArrowLeft,X,Upload, Phone, Mail, Globe, Clock, MessageSquare, Plus} from 'lucide-react'
import { businessApi, categoryApi, governorateApi, commonApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { Spinner } from '@/components/ui'
import toast from 'react-hot-toast'

import { useAuth } from '@/context/AuthContext'

export default function EditShopPage() {
  const { vendor } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Redirect if logged out
  useEffect(() => {
    if (!vendor) navigate('/vendor/login')
  }, [vendor, navigate])

  const { data: shop, isLoading: isShopLoading } = useQuery({
    queryKey: ['shop', id],
    queryFn: () => businessApi.get(id) // Note: get usually takes slug, but our backend list returns ID. In our API, get(slug) is defined. 
    // Wait, the backend get by slug endpoint is public. For editing, we might need a specific get-by-id for vendors.
    // However, our backend update endpoint takes business_id (UUID).
  })

  // Since we might not have a public get-by-id, let's assume we use slug for now or fetch from /me
  const { data: myShops } = useQuery({
    queryKey: ['vendor-shops'],
    queryFn: () => businessApi.me()
  })

  const currentShop = myShops?.find(s => s.id === id) || shop

  const [form, setForm] = useState({
    name_en: '',
    name_ar: '',
    description: '',
    short_description: '',
    category_id: '',
    governorate_id: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    logo_url: '',
    cover_image_url: '',
    gallery_urls: [],
    business_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: true },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false },
    }
  })

  useEffect(() => {
    if (currentShop) {
      setForm({
        name_en: currentShop.name_en || '',
        name_ar: currentShop.name_ar || '',
        description: currentShop.description || '',
        short_description: currentShop.short_description || '',
        category_id: currentShop.category?.id || '',
        governorate_id: currentShop.governorate?.id || '',
        phone: currentShop.phone || '',
        whatsapp: currentShop.whatsapp || '',
        email: currentShop.email || '',
        website: currentShop.website || '',
        address: currentShop.address || '',
        logo_url: currentShop.logo_url || '',
        cover_image_url: currentShop.cover_image_url || '',
        gallery_urls: currentShop.gallery_urls || [],
        business_hours: currentShop.business_hours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: true },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: false },
        }
      })
    }
  }, [currentShop])

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() })
  const { data: governorates } = useQuery({ queryKey: ['governorates'], queryFn: () => governorateApi.list() })

  const mutation = useMutation({
    mutationFn: (data) => businessApi.update(id, data),
    onSuccess: () => {
      toast.success('Shop updated successfully!')
      queryClient.invalidateQueries(['vendor-shops'])
      navigate('/vendor/dashboard/shops')
    },
    onError: (e) => toast.error(getErrorMessage(e))
  })

  const handleFileUpload = async (file, type, index = null) => {
    try {
      const res = await commonApi.upload(file)
      if (type === 'logo') setForm(prev => ({ ...prev, logo_url: res.url }))
      else if (type === 'cover') setForm(prev => ({ ...prev, cover_image_url: res.url }))
      else if (type === 'gallery') setForm(prev => ({ ...prev, gallery_urls: [...prev.gallery_urls, res.url] }))
      toast.success('Image uploaded!')
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Clean data before sending
    const payload = { ...form }
    
    // Convert IDs to numbers safely
    if (form.category_id) payload.category_id = parseInt(form.category_id)
    else delete payload.category_id

    if (form.governorate_id) payload.governorate_id = parseInt(form.governorate_id)
    else delete payload.governorate_id

    // Remove any empty fields that might cause validation issues on backend
    if (!payload.email) delete payload.email
    if (!payload.phone) delete payload.phone
    if (!payload.whatsapp) delete payload.whatsapp
    if (!payload.website) delete payload.website

    mutation.mutate(payload)
  }

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? import.meta.env.VITE_API_URL + url : url;
  }

  if (isShopLoading) return <Spinner />

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-ink font-bold text-sm mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Shop</h1>
          <p className="text-gray-400 text-sm font-semibold">Update your business details and photos.</p>
        </div>
        <button form="edit-form" type="submit" disabled={mutation.isPending} className="brand-btn px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
          {mutation.isPending ? <Spinner className="w-4 h-4" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <form id="edit-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
             <Building2 size={20} className="text-pink" />
             Basic Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Shop Name (English)</label>
              <input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} 
                className="w-full border-[1.5px] border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink transition-colors" required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Shop Name (Arabic)</label>
              <input value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} 
                className="w-full border-[1.5px] border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink transition-colors text-right" dir="rtl" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Category</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} 
                className="w-full border-[1.5px] border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink transition-colors bg-white font-semibold">
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Governorate</label>
              <select value={form.governorate_id} onChange={e => setForm({...form, governorate_id: e.target.value})} 
                className="w-full border-[1.5px] border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink transition-colors bg-white font-semibold">
                {governorates?.map(g => <option key={g.id} value={g.id}>{g.name_en}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Media Management */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
             <ImageIcon size={20} className="text-pink" />
             Shop Media
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Logo */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Business Logo</label>
              <div className="group relative w-32 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-pink/30 cursor-pointer">
                {form.logo_url ? (
                  <img src={getImageUrl(form.logo_url)} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Upload Logo</p>
                  </div>
                )}
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e.target.files[0], 'logo')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Cover */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Cover Image</label>
              <div className="group relative w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-pink/30 cursor-pointer">
                {form.cover_image_url ? (
                  <img src={getImageUrl(form.cover_image_url)} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Upload Cover</p>
                  </div>
                )}
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e.target.files[0], 'cover')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div>
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Gallery Photos</label>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.gallery_urls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group shadow-sm">
                    <img src={getImageUrl(url)} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setForm({...form, gallery_urls: form.gallery_urls.filter((_, i) => i !== idx)});
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 transition-all hover:border-pink/40 hover:bg-pink-light/20 relative overflow-hidden group cursor-pointer">
                   <Upload size={20} className="text-gray-300 mb-2 group-hover:text-pink transition-colors" />
                   <p className="text-[9px] text-gray-400 font-bold uppercase text-center leading-tight">Add Photo</p>
                   <input 
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e.target.files[0], 'gallery')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
             <Phone size={20} className="text-pink" />
             Contact Information
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} 
                  placeholder="+968 ..." className="w-full border-[1.5px] border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-pink transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">WhatsApp</label>
              <div className="relative">
                <MessageSquare size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} 
                  placeholder="+968 ..." className="w-full border-[1.5px] border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-pink transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
                  placeholder="contact@business.com" className="w-full border-[1.5px] border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-pink transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
             <Clock size={20} className="text-pink" />
             Working Hours
          </h2>
          
          <div className="space-y-4">
            {Object.entries(form.business_hours).map(([day, hours]) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 gap-4">
                <div className="flex items-center gap-3 min-w-[120px]">
                  <div className={`w-2 h-2 rounded-full ${hours.closed ? 'bg-red-400' : 'bg-green-400'}`} />
                  <span className="text-sm font-bold text-ink capitalize">{day}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  {!hours.closed ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Open</span>
                        <input type="time" value={hours.open} onChange={e => setForm({
                          ...form, 
                          business_hours: { ...form.business_hours, [day]: { ...hours, open: e.target.value } }
                        })} className="text-xs font-bold bg-white border border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-pink" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Close</span>
                        <input type="time" value={hours.close} onChange={e => setForm({
                          ...form, 
                          business_hours: { ...form.business_hours, [day]: { ...hours, close: e.target.value } }
                        })} className="text-xs font-bold bg-white border border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-pink" />
                      </div>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-gray-300 uppercase italic">Shop is closed on this day</span>
                  )}
                  
                  <button type="button" onClick={() => setForm({
                    ...form,
                    business_hours: { ...form.business_hours, [day]: { ...hours, closed: !hours.closed } }
                  })} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    hours.closed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {hours.closed ? 'Open Shop' : 'Close Shop'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
