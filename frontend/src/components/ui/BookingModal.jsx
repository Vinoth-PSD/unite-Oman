import { useState } from 'react'
import { X, ChevronRight, Calendar, Clock, CheckCircle } from 'lucide-react'
import { bookingApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

const TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM']

function getDays() {
  const days = []
  const now = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    days.push(d)
  }
  return days
}

export default function BookingModal({ business, onClose }) {
  const [step, setStep] = useState(0) // 0=Service, 1=DateTime, 2=Confirm
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0) // Default to today
  const [selectedTime, setSelectedTime] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [booked, setBooked] = useState(false)

  const services = business?.services?.length
    ? business.services.map(s => ({ name: s.name, desc: s.description || 'Professional service', price: s.price }))
    : business?.tags?.length
    ? business.tags.map(t => ({ name: t, desc: 'Professional service' }))
    : [{ name: 'General Service', desc: 'Professional service' }]

  const days = getDays()

  const steps = ['Service', 'Date & Time', 'Confirm']

  const handleConfirm = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) { 
      toast.error('Please fill in all details')
      return 
    }
    
    setLoading(true)
    try {
      await bookingApi.create({
        business_id: business.id,
        name,
        email,
        phone,
        service: selectedService,
        date: days[selectedDay].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        time: selectedTime
      })
      setBooked(true)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" style={{ background: 'rgba(15,10,26,0.7)', backdropFilter: 'blur(10px)' }}>
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="space-y-1">
             <h2 className="font-display text-2xl font-normal text-ink leading-none">Book Appointment</h2>
             <p className="text-xs text-gray-400 font-semibold">{business?.name_en}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-8 pb-4">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? 'bg-pink w-full' :
                  i < step ? 'bg-green-500' : 'bg-gray-100'
                }`} />
                <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${
                  i === step ? 'text-pink' : 'text-gray-300'
                }`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 pb-8 max-h-[500px] overflow-y-auto">

          {/* Step 0: Service */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Choose a service</p>
              <div className="space-y-3">
                {services.map(s => (
                  <button key={s.name} onClick={() => setSelectedService(s.name)}
                    className={`w-full text-left p-5 rounded-3xl border-[2px] transition-all duration-300 ${
                      selectedService === s.name
                        ? 'border-pink bg-pink/5 shadow-md shadow-pink/5'
                        : 'border-gray-50 hover:border-gray-200 bg-white'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="font-bold text-base text-ink">{s.name}</div>
                        <div className="text-xs text-gray-400 font-medium mt-1 line-clamp-2">{s.desc}</div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        {s.price && <div className="text-pink font-bold text-sm whitespace-nowrap bg-pink/5 px-2 py-1 rounded-lg">{s.price}</div>}
                        {selectedService === s.name && (
                          <div className="w-6 h-6 rounded-full bg-pink flex items-center justify-center shadow-lg shadow-pink/20">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-pink" />Select Date
              </p>
              <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {days.map((d, i) => {
                  const isToday = i === 0
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
                  const dayNum = d.getDate()
                  const month = d.toLocaleDateString('en-US', { month: 'short' })
                  const sel = selectedDay === i
                  return (
                    <button key={i} onClick={() => setSelectedDay(i)}
                      className={`flex-shrink-0 w-16 py-4 rounded-3xl text-center transition-all duration-300 border-[2px] ${
                        sel ? 'bg-ink text-white border-ink shadow-lg' : 'border-gray-50 bg-white hover:border-gray-200 text-gray-400'
                      }`}>
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${sel ? 'text-white/60' : 'text-gray-300'}`}>{isToday ? 'Today' : dayName}</div>
                      <div className={`text-xl font-black ${sel ? 'text-white' : 'text-ink'}`}>{dayNum}</div>
                      <div className={`text-[10px] font-bold ${sel ? 'text-white/40' : 'text-gray-400'}`}>{month}</div>
                    </button>
                  )
                })}
              </div>

              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={14} className="text-pink" />Select Time
              </p>
              <div className="grid grid-cols-3 gap-3">
                {TIMES.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-3 rounded-2xl text-xs font-bold border-[2px] transition-all duration-300 ${
                      selectedTime === t
                        ? 'bg-pink text-white border-pink shadow-md shadow-pink/20'
                        : 'border-gray-50 text-ink hover:border-gray-200 bg-white'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && !booked && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Confirm Details</p>
              <div className="bg-gray-50 rounded-[2rem] p-6 mb-6 space-y-3 border border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Service</span>
                  <span className="font-bold text-ink">{selectedService}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Appointment</span>
                  <div className="text-right">
                    <p className="font-bold text-ink">{days[selectedDay].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-pink font-bold">{selectedTime}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border-2 border-gray-50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-pink bg-gray-50/30 transition-all font-semibold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full border-2 border-gray-50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-pink bg-gray-50/30 transition-all font-semibold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Phone Number</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+968 XXXX XXXX"
                    className="w-full border-2 border-gray-50 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-pink bg-gray-50/30 transition-all font-semibold" />
                </div>
              </div>
            </div>
          )}

          {/* Booked confirmation */}
          {booked && (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h3 className="font-display text-3xl text-ink mb-3 leading-none">Booking Confirmed!</h3>
              <p className="text-gray-400 font-semibold px-4">We've sent a confirmation email to <span className="text-ink">{email}</span>. The vendor will contact you shortly.</p>
              
              <button 
                onClick={onClose}
                className="mt-10 w-full py-4 bg-ink text-white rounded-2xl font-bold hover:shadow-lg transition-all"
              >
                Back to Profile
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!booked && (
          <div className="px-8 pb-8 pt-2">
            <div className="flex gap-4">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} disabled={loading}
                  className="flex-1 py-4 border-2 border-gray-50 rounded-2xl text-sm font-bold text-ink hover:bg-gray-50 transition-all disabled:opacity-50">
                  Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={() => {
                  if (step === 0 && !selectedService) { toast.error('Please select a service'); return }
                  if (step === 1 && (!selectedDay === null || !selectedTime)) { toast.error('Please select date and time'); return }
                  setStep(s => s + 1)
                }}
                  className="flex-1 py-4 bg-pink text-white rounded-2xl text-sm font-bold shadow-lg shadow-pink/20 hover:bg-pink/90 transition-all flex items-center justify-center gap-2">
                  Next Step <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-4 bg-ink text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-ink/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? 'Confirming...' : 'Confirm Booking ✓'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
