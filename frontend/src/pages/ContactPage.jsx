import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, ArrowRight } from 'lucide-react'
import { contactApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await contactApi.send(formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      console.error('Contact error:', err)
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen pt-16 max-sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16 bg-[#0A0614] relative overflow-hidden">
      {/* Mesh gradients */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 70% 60% at 15% 60%, rgba(232,49,122,.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 85% 30%, rgba(91,45,142,.15) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 90%, rgba(240,90,40,.08) 0%, transparent 50%)`
      }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-pink/10 border border-pink/25 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-pink animate-pulse" />
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-pink/80 tracking-[.12em] uppercase">Get In Touch</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[clamp(32px,5vw,56px)] font-normal text-white leading-tight mb-2 sm:mb-4 px-2">
            We'd Love to <em className="italic brand-text not-italic">Hear From You.</em>
          </h1>
          <p className="text-white/50 text-xs sm:text-sm lg:text-[15px] max-w-[600px] mx-auto leading-relaxed px-4">
            Have questions about listing your business, advertising, or just want to say hello? Our team in Muscat is ready to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 backdrop-blur-xl relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#E8317A,#F05A28,#5B2D8E)' }} />
            
            {submitted ? (
              <div className="py-8 sm:py-10 lg:py-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Send className="text-emerald-400" size={24} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Message Sent!</h2>
                <p className="text-white/50 text-xs sm:text-sm mb-6 sm:mb-8 max-w-[320px] mx-auto px-4">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 mx-auto transition-all duration-300 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40"
                >
                  Send Another Message <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm outline-none focus:border-pink/50 transition-all placeholder:text-white/20" 
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm outline-none focus:border-purple/50 transition-all placeholder:text-white/20" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+968 0000 0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm outline-none focus:border-orange/50 transition-all placeholder:text-white/20" 
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      required
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm outline-none focus:border-pink/50 transition-all placeholder:text-white/20" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Message</label>
                  <textarea 
                    required
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your inquiry..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm outline-none focus:border-pink/50 transition-all placeholder:text-white/20 resize-none"
                  ></textarea>
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : (
                    <>
                      Send Message
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 backdrop-blur-xl">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <MessageSquare className="text-pink" size={18} />
                Contact Information
              </h3>
              
              <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-pink/10 border border-pink/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="text-pink" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-white/30 uppercase tracking-[.12em] mb-1">Email Support</p>
                    <p className="text-white text-xs sm:text-sm lg:text-[15px] font-semibold truncate">support@uniteoman.com</p>
                    <p className="text-white/40 text-[10px] sm:text-xs mt-0.5 sm:mt-1">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-purple/10 border border-purple/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="text-purple" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-white/30 uppercase tracking-[.12em] mb-1">Call Us</p>
                    <p className="text-white text-xs sm:text-sm lg:text-[15px] font-semibold">+968 2400 0000</p>
                    <p className="text-white/40 text-[10px] sm:text-xs mt-0.5 sm:mt-1">Sun-Thu, 8am - 5pm</p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-orange" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-white/30 uppercase tracking-[.12em] mb-1">Office Location</p>
                    <p className="text-white text-xs sm:text-sm lg:text-[15px] font-semibold leading-relaxed">
                      Al Qurum Business District,<br />Muscat, Sultanate of Oman
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 lg:mt-10 pt-5 sm:pt-6 lg:pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 sm:gap-3 text-white/50 text-xs sm:text-sm">
                  <Globe size={14} />
                  <span>Available in English & Arabic</span>
                </div>
              </div>
            </div>

            {/* Optional: Map placeholder or secondary card */}
            <div className="bg-gradient-to-br from-pink/20 via-purple/20 to-orange/20 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-white font-bold text-sm sm:text-base mb-1 sm:mb-2">Want to list your business?</h4>
                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                  Join 10,000+ verified businesses in Oman and grow your digital presence today.
                </p>
                <a href="/list-business" className="inline-flex items-center gap-2 text-pink font-bold text-xs sm:text-sm hover:gap-4 transition-all uppercase tracking-widest">
                  List for free now <ArrowRight size={14} />
                </a>
              </div>
              <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 size={60} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Building2({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}