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
  if (!business) return <div className="text-center py-20 px-4">Business not found.</div>

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
      <div className="max-w-2xl mx-auto py-12 md:py-20 px-4 md:px-6 text-center">
        <div className="flex justify-center mb-6 md:mb-10">
            <img 
               src="https://www.shutterstock.com/image-vector/three-smiling-diverse-people-celebrating-600nw-2696362995.jpg" 
               alt="Booking Celebration" 
               className="h-32 md:h-48 w-auto rounded-2xl md:rounded-3xl opacity-90 transition-all hover:scale-105 duration-700"
            />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 md:mb-4">
          Booking Request Sent!
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 max-w-md mx-auto px-4">
            Your request for <strong>{selectedService}</strong> at <strong>{business.name_en}</strong> has been sent. 
            The vendor will contact you shortly at {formData.phone} to confirm.
        </p>
        <button 
          onClick={() => navigate(`/business/${slug}`)} 
          className="px-6 md:px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:opacity-90 transition-all text-sm md:text-base"
        >
            Return to Profile
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Navigation - Mobile Optimized */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-[50]">
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
            <Link 
              to={`/business/${slug}`} 
              className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-gray-500 hover:text-gray-900 transition-all"
            >
               <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" /> 
               <span className="truncate max-w-[180px] md:max-w-none">{business.name_en}</span>
            </Link>
            <div className="text-[10px] md:text-xs font-bold text-gray-300 uppercase tracking-widest">
               Secure Checkout
            </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-12">
         <div className="mb-8 md:mb-14 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-800 mb-2 md:mb-4 tracking-tight">
               Book an appointment
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-medium max-w-2xl mx-auto lg:mx-0">
               Please select your service and preferred time at <span className="text-emerald-600 font-black">{business.name_en}</span>
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_420px] gap-4 md:gap-6 lg:gap-8 items-start">
            
            {/* COLUMN 1: SERVICES */}
            <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-5 md:mb-8 pb-3 md:pb-4 border-b border-gray-50">
                  <h2 className="text-lg md:text-xl font-black text-gray-900">1. Service Selection</h2>
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 md:px-3 py-1 rounded-full">
                     Classic Choice
                  </span>
               </div>
               
               <div className="space-y-3 md:space-y-4 max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2">
                  {/* Default Enquiry Option */}
                  <div key="enquiry" 
                       onClick={() => setSelectedService('General Enquiry')}
                       className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all ${
                           selectedService === 'General Enquiry' 
                           ? 'border-emerald-500 bg-emerald-50/10 shadow-lg' 
                           : 'border-transparent bg-white hover:border-emerald-200 shadow-sm'
                       }`}>
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm md:text-base font-black text-gray-900">General Enquiry</h3>
                        <span className={`text-[10px] md:text-[11px] font-black uppercase ${
                          selectedService === 'General Enquiry' ? 'text-emerald-600' : 'text-gray-400'
                        }`}>FREE</span>
                     </div>
                     <p className="text-xs text-gray-400 leading-relaxed">
                       Discuss your requirements with {business.name_en}.
                     </p>
                     {selectedService === 'General Enquiry' && (
                        <div className="mt-3 md:mt-4 flex items-center gap-2 text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            <CheckCircle2 size={12} className="md:w-[14px] md:h-[14px]" /> Selected
                        </div>
                     )}
                  </div>

                  {services.map(s => (
                        <div key={s.id || s.name} 
                             onClick={() => setSelectedService(s.name)}
                             className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all ${
                                 selectedService === s.name 
                                 ? 'border-emerald-500 bg-emerald-50/10 shadow-lg' 
                                 : 'border-transparent bg-white hover:border-emerald-200 shadow-sm'
                             }`}>
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="text-sm md:text-base font-black text-gray-900">{s.name}</h3>
                              <span className={`text-xs font-black ${
                                selectedService === s.name ? 'text-emerald-600' : 'text-pink-600'
                              }`}>
                                {s.price || 'OMR --'}
                              </span>
                           </div>
                           <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                             {s.description || 'Professional service'}
                           </p>
                           {selectedService === s.name && (
                                <div className="mt-3 md:mt-4 flex items-center gap-2 text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                    <CheckCircle2 size={12} className="md:w-[14px] md:h-[14px]" /> Selected
                                </div>
                           )}
                        </div>
                     ))}
               </div>
            </section>

            {/* COLUMN 2: SCHEDULE */}
            <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-5 md:mb-8 pb-3 md:pb-4 border-b border-gray-50">
                  <h2 className="text-lg md:text-xl font-black text-gray-900">2. Appointments</h2>
                  <span className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 md:px-3 py-1 rounded-full">
                     Availability
                  </span>
               </div>
               
               <div className="space-y-8 md:space-y-12">
                 <div>
                     <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 md:mb-6 block">
                       Pick a date
                     </label>
                     <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                         {dates.slice(0, 12).map((d, i) => (
                             <div key={i} 
                                 onClick={() => setSelectedDate(d.full)}
                                 className={`h-16 md:h-20 rounded-xl md:rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                     selectedDate === d.full 
                                     ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' 
                                     : 'border-transparent bg-white hover:border-emerald-200'
                                 }`}>
                                 <span className={`text-[8px] md:text-[9px] uppercase font-bold tracking-widest ${
                                   selectedDate === d.full ? 'text-white/70' : 'text-gray-400'
                                 }`}>
                                   {d.weekday.substring(0, 3)}
                                 </span>
                                 <span className="text-xl md:text-2xl font-black leading-none my-1">{d.day}</span>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div>
                     <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 md:mb-6 block">
                       Preferred Time Slot
                     </label>
                     <div className="grid grid-cols-2 gap-2 md:gap-3 max-h-[300px] overflow-y-auto pr-2">
                         {TIMES.map(t => (
                             <button 
                               key={t} 
                               onClick={() => setSelectedTime(t)}
                               className={`py-3 md:py-4 rounded-xl md:rounded-2xl border-2 text-xs font-black transition-all ${
                                   selectedTime === t 
                                   ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' 
                                   : 'border-transparent bg-white hover:border-emerald-200 text-gray-500'
                               }`}>
                                 {t}
                             </button>
                         ))}
                     </div>
                 </div>
               </div>
            </section>

            {/* COLUMN 3: DETAILS */}
            <section className="bg-white p-6 md:p-10 rounded-2xl md:rounded-3xl border border-gray-100 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-1 md:h-1.5 bg-emerald-500"></div>
               
               <div>
                  <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 text-gray-900 rounded-xl md:rounded-2xl flex items-center justify-center">
                        <User size={20} className="md:w-[24px] md:h-[24px]" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-gray-900">3. Finalize</h2>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Confirmation Step
                        </p>
                    </div>
                  </div>

                  <form className="space-y-4 md:space-y-6">
                     <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                          Full Name
                        </label>
                        <input 
                          type="text" 
                          placeholder="Your Name" 
                          required
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 md:py-4 px-4 md:px-5 text-sm font-bold focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all mt-1 md:mt-1.5" 
                        />
                     </div>

                     <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                          Email
                        </label>
                        <input 
                          type="email" 
                          placeholder="email@example.com" 
                          required
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 md:py-4 px-4 md:px-5 text-sm font-bold focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all mt-1 md:mt-1.5" 
                        />
                     </div>

                     <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                          Phone
                        </label>
                        <input 
                          type="tel" 
                          placeholder="+968 9XXX XXXX" 
                          required
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 md:py-4 px-4 md:px-5 text-sm font-bold focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all mt-1 md:mt-1.5" 
                        />
                     </div>
                  </form>
               </div>

               <div className="pt-6 md:pt-10 mt-6 md:mt-10 border-t border-gray-100">
                  <button 
                    onClick={handleConfirm}
                    disabled={submitBooking.isPending}
                    className="w-full bg-emerald-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3"
                  >
                     {submitBooking.isPending ? <Spinner className="w-4 h-4" /> : 'Request Appointment'}
                     <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={3} />
                  </button>
                  
                  {/* Mobile Summary */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl lg:hidden">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Booking Summary
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service:</span>
                        <span className="font-bold text-gray-900 truncate max-w-[180px]">{selectedService}</span>
                      </div>
                      {selectedDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="font-bold text-gray-900">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Time:</span>
                          <span className="font-bold text-gray-900">{selectedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            </section>

         </div>
      </div>
    </div>
  )
}