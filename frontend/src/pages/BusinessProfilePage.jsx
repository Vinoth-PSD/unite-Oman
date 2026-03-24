import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Phone, Mail, Globe, Clock, ChevronLeft, Send, Heart, Calendar, Star } from 'lucide-react'
import { businessApi, reviewApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { Spinner } from '@/components/ui'
import BookingModal from '@/components/ui/BookingModal'
import AISummary from '@/components/ui/AISummary'
import toast from 'react-hot-toast'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`transition-all ${n <= (hover || value) ? 'text-amber-400 scale-110' : 'text-gray-200 hover:text-gray-300'}`}>
          <Star size={20} fill={n <= (hover || value) ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  )
}

function RatingStars({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(rating) ? '#fbbf24' : 'none'}
          className={n <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

function RatingBreakdown({ reviews }) {
  const total = reviews.length
  const counts = [0, 0, 0, 0, 0, 0] // index 1-5
  reviews.forEach(r => counts[Math.floor(r.rating)]++)

  return (
    <div className="space-y-2 mt-4">
      {[5, 4, 3, 2, 1].map(num => {
        const count = counts[num] || 0
        const percentage = total > 0 ? (count / total) * 100 : 0
        return (
          <div key={num} className="flex items-center gap-3 text-[10px] font-bold">
            <span className="w-3 text-gray-400">{num}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
            </div>
            <span className="w-8 text-right text-gray-400">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function Lightbox({ images, index, onClose, onPrev, onNext }) {
  if (index === null) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>

      {images.length > 1 && (
        <>
          <button onClick={onPrev} className="absolute left-6 text-white/40 hover:text-white transition-colors">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={onNext} className="absolute right-6 text-white/40 hover:text-white transition-colors">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      <img src={images[index]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <span className="text-white/60 text-sm font-medium">{index + 1} / {images.length}</span>
      </div>
    </div>
  )
}

export default function BusinessProfilePage() {
  const { slug } = useParams()
  const qc = useQueryClient()
  const [tab, setTab] = useState('about')
  const [saved, setSaved] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [lbIndex, setLbIndex] = useState(null)
  const [reviewForm, setReviewForm] = useState({ reviewer_name: '', rating: 0, comment: '' })

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['business', slug],
    queryFn: () => businessApi.get(slug)
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', business?.id],
    queryFn: () => reviewApi.list(business.id),
    enabled: !!business?.id
  })

  const submitReview = useMutation({
    mutationFn: reviewApi.create,
    onSuccess: () => {
      toast.success('Review submitted successfully!')
      setReviewForm({ reviewer_name: '', rating: 0, comment: '' })
      qc.invalidateQueries({ queryKey: ['reviews', business.id] })
      qc.invalidateQueries({ queryKey: ['business', slug] })
    },
    onError: (e) => toast.error(getErrorMessage(e))
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-16"><Spinner className="w-10 h-10" /></div>
  )
  if (error || !business) return (
    <div className="min-h-screen flex items-center justify-center pt-16 text-center">
      <div><div className="text-5xl mb-4">🏢</div><h2 className="text-xl font-bold text-ink mb-2">Business not found</h2><Link to="/businesses" className="brand-text text-sm font-bold">← Back to listings</Link></div>
    </div>
  )

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? import.meta.env.VITE_API_URL + url : url;
  }

  const { name_en, name_ar, description, short_description, category, governorate,
    cover_image_url: rawCover, logo_url: rawLogo, gallery_urls: rawGallery, phone, whatsapp, email, website,
    address, is_verified, listing_type, plan, rating_avg, rating_count,
    business_hours: rawHours, tags: rawTags, services: rawServices } = business

  const cover_image_url = getImageUrl(rawCover)
  const logo_url = getImageUrl(rawLogo)
  const gallery_urls = (rawGallery || []).map(getImageUrl)
  
  const business_hours = rawHours || {}
  const tags = rawTags || []
  const services = rawServices || []

  const priceRange = plan === 'enterprise' ? 'OMR 50–200' : plan === 'professional' ? 'OMR 10–80' : null
  const today = DAYS[new Date().getDay()]
  const todayHours = business_hours[today.toLowerCase()]

  const tabs = ['About', 'Services', 'Reviews', 'Location']

  return (
    <div className="min-h-screen pt-16" style={{ background: '#F5F2EC' }}>

      {/* Hero cover */}
      <div className="relative h-52 overflow-hidden"
        style={{ background: cover_image_url ? `url(${cover_image_url}) center/cover` : 'linear-gradient(135deg,#2D1A0E,#1A1427)' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back link */}
        <div className="absolute top-5 left-0 right-0 max-w-[1240px] mx-auto px-6">
          <Link to="/businesses" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold transition-colors bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <ChevronLeft size={15} /> Back to listings
          </Link>
        </div>

        {/* Hero info */}
        <div className="absolute bottom-0 left-0 right-0 max-w-[1240px] mx-auto px-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              {/* Status badges */}
              <div className="flex items-center gap-2 mb-2">
                {is_verified && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">✓ Verified Business</span>
                )}
                {listing_type !== 'standard' && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">⭐ Featured</span>
                )}
              </div>
              <h1 className="font-display text-[clamp(24px,4vw,38px)] text-white font-normal tracking-tight mb-1">{name_en}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/75">
                {(reviews.length > 0 || rating_count > 0) && (
                  <span className="flex items-center gap-2">
                    <RatingStars rating={reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : (rating_avg || 0)} />
                    <strong className="text-white">
                      {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : Number(rating_avg).toFixed(1)}
                    </strong> 
                    ({reviews.length || rating_count} reviews)
                  </span>
                )}
                {governorate && <span className="flex items-center gap-1">📍 {governorate.name_en}</span>}
                {priceRange && <span className="flex items-center gap-1">💰 {priceRange}</span>}
              </div>
            </div>
            {/* Hero actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => { setSaved(s => !s); toast.success(saved ? 'Removed from saved' : 'Saved!') }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${saved ? 'bg-pink/10 border-pink text-pink' : 'bg-white/10 border-white/30 text-white hover:border-white/60'}`}>
                <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button onClick={() => setShowBooking(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#1B5E3B,#2D7A55)' }}>
                <Calendar size={15} /> Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1240px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* Left column */}
          <div className="space-y-4">

            {/* AI Summary */}
            <AISummary business={business} />

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {tabs.map(t => (
                  <button key={t} onClick={() => setTab(t.toLowerCase())}
                    className={`flex-1 py-3 text-sm font-semibold transition-all ${
                      tab === t.toLowerCase()
                        ? 'text-purple border-b-2 border-purple bg-purple/3'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* About tab */}
                {tab === 'about' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-pink to-purple rounded-full opacity-20" />
                      <p className="text-[15px] text-gray-600 leading-[1.8] font-medium tracking-tight">
                        {description || short_description || 'No description available for this verified business.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {phone && (
                        <a href={`tel:${phone}`} className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-pink/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-pink group-hover:scale-110 transition-transform">
                              <Phone size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Call Us</p>
                              <p className="text-sm font-bold text-ink">{phone}</p>
                            </div>
                          </div>
                        </a>
                      )}
                      {email && (
                        <a href={`mailto:${email}`} className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-purple group-hover:scale-110 transition-transform">
                              <Mail size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email Us</p>
                              <p className="text-sm font-bold text-ink truncate max-w-[150px]">{email}</p>
                            </div>
                          </div>
                        </a>
                      )}
                      {(todayHours || business_hours) && (
                        <div className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-emerald-500/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                              <Clock size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Today's Hours</p>
                              <p className="text-sm font-bold text-ink font-mono tracking-tight">
                                {todayHours ? `${todayHours.open} – ${todayHours.close}` : 'Closed Today'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {address && (
                        <div className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-amber-500/30 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                              <MapPin size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                              <p className="text-sm font-bold text-ink line-clamp-1">{address}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Services tab */}

                
                {tab === 'services' && (
                  <div>
                    {services.length === 0 && tags.length === 0 ? (
                      <p className="text-sm text-gray-400">No services listed.</p>
                    ) : (
                      <div className="space-y-3">
                        {services.length > 0 ? (
                          services.map((s) => (
                            <div key={s.id}
                              className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-purple/20 hover:bg-purple/2 transition-all">
                              <div>
                                <p className="font-semibold text-sm text-ink">{s.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {s.description || 'Professional service'} 
                                  {s.price && <span className="text-pink ml-1">({s.price})</span>}
                                </p>
                              </div>
                              <button onClick={() => setShowBooking(true)}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all"
                                style={{ background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' }}>
                                Book
                              </button>
                            </div>
                          ))
                        ) : (
                          tags.map((tag, i) => (
                            <div key={i}
                              className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-purple/20 hover:bg-purple/2 transition-all">
                              <div>
                                <p className="font-semibold text-sm text-ink">{tag}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Professional service</p>
                              </div>
                              <button onClick={() => setShowBooking(true)}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all"
                                style={{ background: 'linear-gradient(135deg,#E8317A,#5B2D8E)' }}>
                                Book
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}





                {/* Reviews tab */}
                {tab === 'reviews' && (
                  <div>
                    {reviews.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="text-3xl mb-2">⭐</div>
                        <p className="font-bold text-ink text-sm mb-1">No reviews yet</p>
                        <p className="text-xs text-gray-400">Be the first to leave a review</p>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-6">
                        {reviews.map(r => (
                          <div key={r.id} className="border border-gray-100 rounded-2xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-bold text-sm text-ink">{r.reviewer_name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                            </div>
                            {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write review */}
                    <div className="border-t border-gray-100 pt-5">
                      <h4 className="font-bold text-ink text-sm mb-4">Write a Review</h4>
                      <form onSubmit={e => {
                        e.preventDefault()
                        if (!reviewForm.rating) return toast.error('Please select a rating')
                        submitReview.mutate({ ...reviewForm, business_id: business.id })
                      }} className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Rating *</label>
                          <StarPicker value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Your Name *</label>
                          <input value={reviewForm.reviewer_name} onChange={e => setReviewForm(f => ({ ...f, reviewer_name: e.target.value }))}
                            placeholder="Enter your name"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple transition-colors" required />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Review</label>
                          <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            placeholder="Share your experience…" rows={3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple transition-colors resize-none" />
                        </div>
                        <button type="submit" disabled={submitReview.isPending}
                          className="brand-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                          <Send size={13} /> {submitReview.isPending ? 'Submitting…' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Location tab */}
                {tab === 'location' && (
                  <div>
                    {address && (
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-pink-light flex items-center justify-center flex-shrink-0 mt-0.5"><MapPin size={14} className="text-pink" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Address</p>
                          <p className="text-sm text-ink font-medium">{address}</p>
                        </div>
                      </div>
                    )}
                    {/* Map placeholder -> Google Maps Link */}
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((business?.name_en || '') + ' ' + (address || '') + ' Oman')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-52 rounded-2xl bg-gray-100 flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer group"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2 transition-transform group-hover:scale-110">🗺️</div>
                        <p className="text-sm text-gray-500 font-bold group-hover:text-ink transition-colors">Open in Google Maps</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Get directions to {business?.name_en}</p>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Bento Gallery */}
            {gallery_urls.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl text-ink font-normal">Gallery</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{gallery_urls.length} Photos</span>
                </div>

                <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px]">
                  {/* Large featured photo */}
                  <div onClick={() => setLbIndex(0)}
                    className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-100">
                    <img src={gallery_urls[0]} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Smaller thumbnails */}
                  {gallery_urls.slice(1, 4).map((url, i) => (
                    <div key={i} onClick={() => setLbIndex(i + 1)}
                      className={`relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 ${i === 2 ? 'col-span-2' : 'col-span-2 sm:col-span-1'}`}>
                      <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}

                  {/* View all overlay on last visible image if more exist */}
                  {gallery_urls.length > 4 && (
                    <div onClick={() => setLbIndex(4)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-sm cursor-pointer hover:bg-black/60 transition-colors rounded-2xl">
                      +{gallery_urls.length - 4} More
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Quick Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-ink text-sm mb-4">Quick Contact</h3>
              <div className="space-y-2.5">
                <button onClick={() => setShowBooking(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#1B5E3B,#2D7A55)' }}>
                  <Calendar size={15} /> Book Appointment
                </button>
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-[1.5px] border-gray-200 text-ink hover:border-gray-300 transition-all">
                    💬 Send Message
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-gray-100 text-gray-600 hover:border-gray-200 transition-all">
                    📞 Call Now
                  </a>
                )}
              </div>
            </div>

            {/* Business Hours */}
            {Object.keys(business_hours).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-ink text-sm mb-4 flex items-center gap-2"><Clock size={14} className="text-purple" />Business Hours</h3>
                <div className="space-y-2">
                  {DAYS.map(day => {
                    const hours = business_hours[day.toLowerCase()]
                    const isClosed = !hours || hours.closed
                    const isToday = day === today
                    return (
                      <div key={day} className={`flex justify-between text-xs ${isToday ? 'font-bold' : 'font-medium'}`}>
                        <span className={isToday ? 'text-purple' : 'text-gray-500'}>{day.slice(0, 3)}</span>
                        <span className={!isClosed ? (isToday ? 'text-purple' : 'text-ink') : 'text-gray-300'}>
                          {!isClosed ? `${hours.open} – ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Rating snapshot */}
            {(reviews.length > 0 || rating_count > 0) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-display text-xl text-ink font-normal mb-4">Rating</h3>
                <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
                  <div className="text-center">
                    <div className="font-display text-5xl brand-text font-normal mb-1">
                      {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : Number(rating_avg).toFixed(1)}
                    </div>
                    <RatingStars rating={reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : (rating_avg || 0)} size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Review Analysis</p>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      Based on <span className="text-ink font-bold">{reviews.length || rating_count}</span> verified customer reviews.
                    </p>
                  </div>
                </div>
                
                <RatingBreakdown reviews={reviews} />
              </div>
            )}

            {/* Tags / services quick list */}
            {tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-ink text-sm mb-3">Services</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="text-xs font-semibold bg-purple-light text-purple px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBooking && <BookingModal business={business} onClose={() => setShowBooking(false)} />}

      <Lightbox
        images={gallery_urls}
        index={lbIndex}
        onClose={() => setLbIndex(null)}
        onPrev={() => setLbIndex(prev => (prev > 0 ? prev - 1 : gallery_urls.length - 1))}
        onNext={() => setLbIndex(next => (next < gallery_urls.length - 1 ? next + 1 : 0))}
      />
    </div>
  )
}
