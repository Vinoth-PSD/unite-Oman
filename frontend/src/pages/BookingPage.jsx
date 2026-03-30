import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { businessApi, bookingApi } from '@/lib/api'
import { Spinner } from '@/components/ui'
import toast from 'react-hot-toast'
import { ChevronLeft, Calendar, Clock, User, Mail, Phone, CheckCircle2, Sparkles } from 'lucide-react'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const TIMES = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM']

export default function BookingPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  
  const [selectedService, setSelectedService] = useState('General Enquiry')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [isBooked, setIsBooked] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', slug],
    queryFn: () => businessApi.get(slug)
  })

  const submitBooking = useMutation({
    mutationFn: (data) => bookingApi.create(data),
    onSuccess: () => setIsBooked(true),
    onError: () => toast.error('Failed to submit booking request. Please try again.')
  })

  const dates = useMemo(() => {
    const arr = []
    for(let i=0; i<14; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        arr.push({
            full: d.toISOString().split('T')[0],
            day: d.getDate(),
            month: d.toLocaleString('en-US', { month: 'short' }),
            weekday: i === 0 ? 'Today' : d.toLocaleString('en-US', { weekday: 'short' })
        })
    }
    return arr
  }, [])

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) setSelectedDate(dates[0].full)
  }, [dates, selectedDate])

  const services = business?.services || []

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!business) return <div className="text-center py-20">Business not found.</div>

  const handleConfirm = (e) => {
    e.preventDefault()
    if (!selectedService) return toast.error('Please select a service')
    if (!selectedTime) return toast.error('Please select a time')
    
    submitBooking.mutate({
        business_id: business.id,
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        ...formData
    })
  }

  if (isBooked) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <div className="flex justify-center mb-10">
            <img 
               src="https://www.shutterstock.com/image-vector/three-smiling-diverse-people-celebrating-600nw-2696362995.jpg" 
               alt="Booking Celebration" 
               className="h-48 w-auto rounded-3xl opacity-90 transition-all hover:scale-105 duration-700"
            />
        </div>
        <h1 className="text-3xl font-black text-ink mb-4">Booking Request Sent!</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Your request for <strong>{selectedService}</strong> at <strong>{business.name_en}</strong> has been sent. The vendor will contact you shortly at {formData.phone} to confirm.
        </p>
        <button onClick={() => navigate(`/business/${slug}`)} className="px-8 py-3 bg-ink text-white rounded-full font-bold hover:opacity-90 transition-all">
            Return to Profile
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* CLASSIC TOP NAVIGATION */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-[50]">
        <div className="max-w-[1500px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link to={`/business/${slug}`} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-ink transition-all">
               <ChevronLeft size={18} /> {business.name_en}
            </Link>
            <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
               Secure Checkout
            </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-12">
         <div className="mb-14 text-center lg:text-left">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-800 mb-4 tracking-tight drop-shadow-sm">
               Book an appointment
            </h1>
            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-2xl">
               Please select your service and preferred time at <span className="text-emerald-600 font-black">{business.name_en}</span>
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_420px] gap-8 items-start">
            
            {/* COLUMN 1: SERVICES (CLASSIC WHITE) */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[600px]">
               <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                  <h2 className="text-xl font-black text-ink">1. Service Selection</h2>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Classic Choice</span>
               </div>
               
               <div className="space-y-4">
                  {/* Default Enquiry Option */}
                  <div key="enquiry" 
                       onClick={() => setSelectedService('General Enquiry')}
                       className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                           selectedService === 'General Enquiry' 
                           ? 'border-emerald-500 bg-emerald-50/10 shadow-lg scale-[1.02]' 
                           : 'border-transparent bg-white hover:border-emerald-200 shadow-sm'
                       }`}>
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-black text-ink">General Enquiry</h3>
                        <span className={`text-[11px] font-black uppercase ${selectedService === 'General Enquiry' ? 'text-emerald-600' : 'text-gray-400'}`}>FREE</span>
                     </div>
                     <p className="text-xs text-gray-400 leading-relaxed font-bold opacity-70 italic">Discuss your requirements with {business.name_en}.</p>
                     {selectedService === 'General Enquiry' && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            <CheckCircle2 size={14} /> Selected
                        </div>
                     )}
                  </div>

                  {services.map(s => (
                        <div key={s.id || s.name} 
                             onClick={() => setSelectedService(s.name)}
                             className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                 selectedService === s.name 
                                 ? 'border-emerald-500 bg-emerald-50/10 shadow-lg scale-[1.02]' 
                                 : 'border-transparent bg-white hover:border-emerald-200 shadow-sm'
                             }`}>
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="text-base font-black text-ink">{s.name}</h3>
                              <span className={`text-xs font-black ${selectedService === s.name ? 'text-emerald-600' : 'text-pink-600'}`}>{s.price || 'OMR --'}</span>
                           </div>
                           <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-medium">{s.description || 'Professional service at Lime Spa'}</p>
                           {selectedService === s.name && (
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                    <CheckCircle2 size={14} /> Selected
                                </div>
                           )}
                        </div>
                     ))}
               </div>
            </section>

            {/* COLUMN 2: SCHEDULE (CLASSIC WHITE) */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[600px]">
               <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                  <h2 className="text-xl font-black text-ink">2. Appointments</h2>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Availability</span>
               </div>
               
               <div className="space-y-12">
                 <div>
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 block">Pick a date</label>
                     <div className="grid grid-cols-4 gap-3">
                         {dates.slice(0, 12).map((d, i) => (
                             <div key={i} 
                                 onClick={() => setSelectedDate(d.full)}
                                 className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                     selectedDate === d.full ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' : 'border-transparent bg-white hover:border-emerald-200'
                                 }`}>
                                 <span className={`text-[9px] uppercase font-bold tracking-widest ${selectedDate === d.full ? 'text-white/70' : 'text-gray-400'}`}>{d.weekday}</span>
                                 <span className="text-2xl font-black leading-none my-1">{d.day}</span>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div>
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 block">Preferred Time Slot</label>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {TIMES.map(t => (
                             <button key={t} 
                                     onClick={() => setSelectedTime(t)}
                                     className={`py-4 rounded-2xl border-2 text-xs font-black transition-all ${
                                         selectedTime === t ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' : 'border-transparent bg-white hover:border-emerald-200 text-gray-500'
                                     }`}>
                                 {t}
                             </button>
                         ))}
                     </div>
                 </div>
               </div>
            </section>

            {/* COLUMN 3: DETAILS (CLASSIC WHITE) */}
            <section className="bg-white p-10 rounded-3xl border border-gray-100 shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col justify-between transition-all">
               <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
               
               <div>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-gray-50 text-ink rounded-2xl flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-ink">3. Finalize</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirmation Step</p>
                    </div>
                  </div>

                  <form className="space-y-6">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                        <input type="text" placeholder="Your Name" required
                               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                               className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all mt-1.5" />
                     </div>

                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                        <input type="email" placeholder="email@example.com" required
                               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                               className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all mt-1.5" />
                     </div>

                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone</label>
                        <input type="tel" placeholder="+968 9XXX XXXX" required
                               value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                               className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all mt-1.5" />
                     </div>
                  </form>
               </div>

               <div className="pt-10 border-t border-gray-100 mt-10">
                  <button onClick={handleConfirm}
                          disabled={submitBooking.isPending}
                          className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-3">
                     {submitBooking.isPending ? <Spinner className="w-4 h-4" /> : 'Request Appointment'}
                     <CheckCircle2 size={18} strokeWidth={3} />
                  </button>
               </div>
            </section>

         </div>
      </div>
    </div>
  )
}
