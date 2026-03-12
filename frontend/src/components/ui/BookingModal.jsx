import { useState } from 'react'
import { X, ChevronRight, Calendar, Clock, CheckCircle } from 'lucide-react'
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
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [booked, setBooked] = useState(false)

  const services = business?.tags?.length
    ? business.tags.map(t => ({ name: t, desc: 'Professional service' }))
    : [{ name: 'General Service', desc: 'Professional service' }]

  const days = getDays()

  const steps = ['Service', 'Date & Time', 'Confirm']

  const handleConfirm = () => {
    if (!name.trim() || !phone.trim()) { toast.error('Please fill in your details'); return }
    setBooked(true)
    setTimeout(() => { onClose(); toast.success('Booking confirmed! We\'ll contact you shortly.') }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,10,26,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-display text-xl font-normal text-ink">Book: {business?.name_en}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex-1 text-center text-xs font-bold py-2 border-b-2 transition-all ${
                  i === step ? 'border-purple text-purple' :
                  i < step ? 'border-green-500 text-green-600' :
                  'border-gray-200 text-gray-400'
                }`}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 pb-6 max-h-[480px] overflow-y-auto">

          {/* Step 0: Service */}
          {step === 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-3">Choose a service:</p>
              <div className="space-y-2.5">
                {services.map(s => (
                  <button key={s.name} onClick={() => setSelectedService(s.name)}
                    className={`w-full text-left p-4 rounded-2xl border-[1.5px] transition-all ${
                      selectedService === s.name
                        ? 'border-purple bg-purple/5'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-ink">{s.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
                      </div>
                      {selectedService === s.name && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' }}>
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-2"><Calendar size={14} />Select a date:</p>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {days.map((d, i) => {
                  const isToday = i === 0
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
                  const dayNum = d.getDate()
                  const month = d.toLocaleDateString('en-US', { month: 'short' })
                  const sel = selectedDay === i
                  return (
                    <button key={i} onClick={() => setSelectedDay(i)}
                      className={`flex-shrink-0 w-14 py-2.5 rounded-2xl text-center transition-all border-[1.5px] ${
                        sel ? 'text-white border-transparent' : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                      style={sel ? { background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' } : {}}>
                      <div className={`text-[10px] font-bold ${sel ? 'text-white/80' : 'text-gray-400'}`}>{isToday ? 'Today' : dayName}</div>
                      <div className={`text-lg font-bold ${sel ? 'text-white' : 'text-ink'}`}>{dayNum}</div>
                      <div className={`text-[10px] ${sel ? 'text-white/70' : 'text-gray-400'}`}>{month}</div>
                    </button>
                  )
                })}
              </div>

              <p className="text-sm text-gray-500 mb-3 flex items-center gap-2"><Clock size={14} />Select a time:</p>
              <div className="grid grid-cols-3 gap-2">
                {TIMES.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-2 rounded-xl text-xs font-semibold border-[1.5px] transition-all ${
                      selectedTime === t
                        ? 'text-white border-transparent'
                        : 'border-gray-100 text-ink hover:border-gray-300 bg-white'
                    }`}
                    style={selectedTime === t ? { background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' } : {}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && !booked && (
            <div>
              {/* Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold text-ink">{selectedService}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold text-ink">
                    {selectedDay !== null ? getDays()[selectedDay].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time</span>
                  <span className="font-semibold text-ink">{selectedTime || '—'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Your Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone Number *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+968 XXXX XXXX"
                    className="w-full border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* Booked confirmation */}
          {booked && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' }}>
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="font-display text-xl text-ink mb-2">Booking Confirmed!</h3>
              <p className="text-sm text-gray-500">We'll contact you at {phone} to confirm.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!booked && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            <div className="flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 border-[1.5px] border-gray-200 rounded-2xl text-sm font-bold text-ink hover:border-gray-300 transition-all">
                  ← Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={() => {
                  if (step === 0 && !selectedService) { toast.error('Please select a service'); return }
                  if (step === 1 && (!selectedDay || !selectedTime)) { toast.error('Please select date and time'); return }
                  setStep(s => s + 1)
                }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }}>
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={handleConfirm}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(90deg,#E8317A,#5B2D8E)' }}>
                  Confirm Booking ✓
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
