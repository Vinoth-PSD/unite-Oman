import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { businessApi, bookingApi } from '@/lib/api'
import { Spinner } from '@/components/ui'
import toast from 'react-hot-toast'
import { ChevronLeft, User, CheckCircle2 } from 'lucide-react'

const TIMES = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM']

export default function BookingPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [selectedService, setSelectedService] = useState('General Enquiry')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [isBooked, setIsBooked] = useState(false)

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })

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
    for (let i = 0; i < 14; i++) {
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
  if (!business) return <div className="text-center py-20 px-4 text-gray-500">Business not found.</div>

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

  /* ── SUCCESS STATE ── */
  if (isBooked) {
    return (
      <div className="min-h-screen bg-[#f7f7fb] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center py-16">
          <div className="w-20 h-20 rounded-full bg-pink-50 border-2 border-pink-200 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={36} className="text-[#ff2d78]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Booking Request Sent!
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-8 max-w-sm mx-auto leading-relaxed">
            Your request for{' '}
            <span className="font-bold text-gray-800">{selectedService}</span> at{' '}
            <span className="font-bold text-gray-800">{business.name_en}</span> has been sent.
            The vendor will contact you shortly at{' '}
            <span className="font-bold text-gray-800">{formData.phone}</span> to confirm.
          </p>
          <button
            onClick={() => navigate(`/business/${slug}`)}
            className="px-8 py-3.5 bg-[#ff2d78] hover:bg-[#e01a65] text-white rounded-full font-black text-sm transition-all shadow-lg shadow-pink-200"
          >
            Return to Profile
          </button>
        </div>
      </div>
    )
  }

  /* ── MAIN BOOKING PAGE ── */
  return (
    <div className="min-h-screen bg-[#f7f7fb]">

      {/* ── NAVBAR ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link
            to={`/business/${slug}`}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-[#ff2d78] transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="truncate max-w-[180px] md:max-w-none">{business.name_en}</span>
          </Link>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            Secure Checkout
          </span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* ── PAGE HEADER ── */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 tracking-tight">
            Book an{' '}
            <span className="bg-gradient-to-r from-[#ff2d78] to-[#ff6b9d] bg-clip-text text-transparent">
              appointment
            </span>
          </h1>
          <p className="text-gray-400 font-medium text-sm md:text-base">
            Select your service and preferred time at{' '}
            <span className="text-[#ff2d78] font-black">{business.name_en}</span>
          </p>
        </div>

        {/* ── THREE-COLUMN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_380px] gap-5 md:gap-6 items-start">

          {/* ════════════════════════════
              COLUMN 1 — SERVICE SELECTION
          ════════════════════════════ */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-50">
              <h2 className="text-base md:text-lg font-black text-gray-900">1. Service Selection</h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ff2d78] bg-pink-50 px-3 py-1 rounded-full">
                Classic Choice
              </span>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent">

              {/* Default — General Enquiry */}
              <div
                onClick={() => setSelectedService('General Enquiry')}
                className={`p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedService === 'General Enquiry'
                    ? 'border-[#ff2d78] bg-pink-50/60'
                    : 'border-transparent bg-gray-50 hover:border-pink-200 hover:bg-pink-50/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-sm font-black text-gray-900">General Enquiry</h3>
                  <span className="text-[11px] font-black text-gray-300">FREE</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Discuss your requirements with {business.name_en}.
                </p>
                {selectedService === 'General Enquiry' && (
                  <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#ff2d78]">
                    <CheckCircle2 size={12} strokeWidth={3} /> Selected
                  </div>
                )}
              </div>

              {/* Dynamic services */}
              {services.map(s => (
                <div
                  key={s.id || s.name}
                  onClick={() => setSelectedService(s.name)}
                  className={`p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedService === s.name
                      ? 'border-[#ff2d78] bg-pink-50/60'
                      : 'border-transparent bg-gray-50 hover:border-pink-200 hover:bg-pink-50/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-sm font-black text-gray-900">{s.name}</h3>
                    <span className={`text-xs font-black ${
                      selectedService === s.name ? 'text-[#ff2d78]' : 'text-[#ff2d78]'
                    }`}>
                      {s.price || 'OMR --'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {s.description || 'Professional service'}
                  </p>
                  {selectedService === s.name && (
                    <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#ff2d78]">
                      <CheckCircle2 size={12} strokeWidth={3} /> Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════
              COLUMN 2 — SCHEDULE
          ════════════════════════════ */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-50">
              <h2 className="text-base md:text-lg font-black text-gray-900">2. Appointments</h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                Availability
              </span>
            </div>

            <div className="space-y-10">

              {/* Date picker */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4 block">
                  Pick a date
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-2.5">
                  {dates.slice(0, 12).map((d, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(d.full)}
                      className={`h-16 md:h-[72px] rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all gap-0.5 ${
                        selectedDate === d.full
                          ? 'border-[#ff2d78] bg-[#ff2d78] text-white shadow-md shadow-pink-200'
                          : 'border-gray-100 bg-gray-50 hover:border-pink-200 hover:bg-pink-50/40'
                      }`}
                    >
                      <span className={`text-[8px] uppercase font-black tracking-widest ${
                        selectedDate === d.full ? 'text-white/70' : 'text-gray-300'
                      }`}>
                        {d.weekday.substring(0, 3)}
                      </span>
                      <span className={`text-xl md:text-2xl font-black leading-none ${
                        selectedDate === d.full ? 'text-white' : 'text-gray-800'
                      }`}>
                        {d.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time picker */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4 block">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {TIMES.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-3.5 rounded-2xl border-2 text-xs font-black transition-all ${
                        selectedTime === t
                          ? 'border-[#ff2d78] bg-[#ff2d78] text-white shadow-md shadow-pink-200'
                          : 'border-gray-100 bg-gray-50 hover:border-pink-200 hover:text-[#ff2d78] text-gray-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ════════════════════════════
              COLUMN 3 — FINALIZE
          ════════════════════════════ */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden"
            style={{ borderTop: '3px solid #ff2d78' }}
          >
            <div className="p-6 md:p-8">

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-8">
                <div className="w-11 h-11 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-[#ff2d78]" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-gray-900">3. Finalize</h2>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-0.5">
                    Confirmation Step
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-0.5 block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#ff2d78] focus:bg-pink-50/30 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-0.5 block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#ff2d78] focus:bg-pink-50/30 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-0.5 block mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+968 9XXX XXXX"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#ff2d78] focus:bg-pink-50/30 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
              </div>

              {/* Divider + CTA */}
              <div className="pt-6 mt-6 border-t border-gray-50">
                <button
                  onClick={handleConfirm}
                  disabled={submitBooking.isPending}
                  className="w-full bg-[#ff2d78] hover:bg-[#e01a65] active:scale-[0.98] text-white py-4 md:py-5 rounded-2xl font-black shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all text-sm flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitBooking.isPending
                    ? <Spinner className="w-4 h-4" />
                    : <>
                        Request Appointment
                        <CheckCircle2 size={16} strokeWidth={3} />
                      </>
                  }
                </button>

                {/* Mobile booking summary */}
                <div className="mt-4 p-3.5 bg-gray-50 rounded-xl lg:hidden">
                  <div className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-2.5">
                    Booking Summary
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Service</span>
                      <span className="font-black text-gray-800 truncate max-w-[170px]">{selectedService}</span>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Date</span>
                        <span className="font-black text-gray-800">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Time</span>
                        <span className="font-black text-gray-800">{selectedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
