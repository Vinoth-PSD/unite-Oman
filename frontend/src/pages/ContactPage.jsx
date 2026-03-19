import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, ArrowRight } from 'lucide-react'
import { contactApi } from '@/lib/api'
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
      // toast is already imported and configured in App.jsx
    } catch (err) {
      console.error('Contact error:', err)
      toast.error(err.response?.data?.detail || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0A0614] relative overflow-hidden">
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

      <div className="max-w-[1140px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-pink/10 border border-pink/25 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse" />
            <span className="text-[11px] font-bold text-pink/80 tracking-[.12em] uppercase">Get In Touch</span>
          </div>
          <h1 className="font-display text-[clamp(32px,5vw,56px)] font-normal text-white leading-tight mb-4">
            We'd Love to <em className="italic brand-text not-italic">Hear From You.</em>
          </h1>
          <p className="text-white/50 text-[15px] max-w-[600px] mx-auto leading-relaxed">
            Have questions about listing your business, advertising, or just want to say hello? Our team in Muscat is ready to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#E8317A,#F05A28,#5B2D8E)' }} />
            
            {submitted ? (
              <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="text-emerald-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Message Sent!</h2>
                <p className="text-white/50 mb-8 max-w-[320px] mx-auto">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="brand-btn px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto"
                >
                  Send Another Message <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink/50 transition-all placeholder:text-white/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple/50 transition-all placeholder:text-white/20" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+968 0000 0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange/50 transition-all placeholder:text-white/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      required
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink/50 transition-all placeholder:text-white/20" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Message</label>
                  <textarea 
                    required
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your inquiry..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink/50 transition-all placeholder:text-white/20 resize-none"
                  ></textarea>
                </div>
                <button 
                  disabled={loading}
                  className="w-full brand-btn py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {loading ? 'Sending...' : (
                    <>
                      Send Message
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="text-pink" size={20} />
                Contact Information
              </h3>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink/10 border border-pink/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="text-pink" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[.12em] mb-1">Email Support</p>
                    <p className="text-white text-[15px] font-semibold">support@uniteoman.com</p>
                    <p className="text-white/40 text-xs mt-1">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple/10 border border-purple/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="text-purple" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[.12em] mb-1">Call Us</p>
                    <p className="text-white text-[15px] font-semibold">+968 2400 0000</p>
                    <p className="text-white/40 text-xs mt-1">Sun-Thu, 8am - 5pm</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-orange" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[.12em] mb-1">Office Location</p>
                    <p className="text-white text-[15px] font-semibold leading-relaxed">
                      Al Qurum Business District,<br />Muscat, Sultanate of Oman
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-white/50 text-sm">
                  <Globe size={16} />
                  <span>Available in English & Arabic</span>
                </div>
              </div>
            </div>

            {/* Optional: Map placeholder or secondary card */}
            <div className="bg-gradient-to-br from-pink/20 via-purple/20 to-orange/20 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-white font-bold mb-2">Want to list your business?</h4>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  Join 10,000+ verified businesses in Oman and grow your digital presence today.
                </p>
                <a href="/list-business" className="inline-flex items-center gap-2 text-pink font-bold text-sm hover:gap-4 transition-all uppercase tracking-widest">
                  List for free now <ArrowRight size={16} />
                </a>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 size={80} className="text-white" />
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
