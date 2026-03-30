import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessApi, reviewApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { Spinner } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="wr-stars">
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`wr-star ${n <= (hover || value) ? 'on' : ''}`}>
          ★
        </span>
      ))}
    </div>
  )
}

function RatingStars({ rating }) {
  return (
    <div className="rt-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`rt-star ${n <= Math.round(rating) ? 'on' : 'off'}`}>★</span>
      ))}
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
  const { user, isAdmin } = useAuth()
  const qc = useQueryClient()
  const [lbIndex, setLbIndex] = useState(null)
  const [isStuck, setIsStuck] = useState(false)
  
  // States
  const [isBooked, setIsBooked] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState('Click Generate for an AI-powered overview of this business.')
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
  
  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner className="w-10 h-10" /></div>
  )
  if (error || !business) return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div><div className="text-5xl mb-4">🏢</div><h2 className="text-xl font-bold text-ink mb-2">Business not found</h2><Link to="/businesses" className="brand-text text-sm font-bold">← Back to listings</Link></div>
    </div>
  )

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? import.meta.env.VITE_API_URL + url : url;
  }

  const { name_en, description, short_description, category, governorate,
    cover_image_url: rawCover, gallery_urls: rawGallery, phone, whatsapp, email, website,
    address, is_verified, listing_type, plan, rating_avg, rating_count, view_count, has_deal, deal_text,
    business_hours: rawHours, tags: rawTags, services: rawServices, owner_id } = business

  const isOwner = user?.id === owner_id || isAdmin

  const coverUrl = getImageUrl(rawCover)
  const validGallery = [coverUrl, ...(rawGallery || []).map(getImageUrl)].filter(Boolean)
  
  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&q=80'
  ]
  
  const displayGallery = [...validGallery]
  while (displayGallery.length < 3) displayGallery.push(FALLBACK_IMAGES[displayGallery.length])
  
  const business_hours = rawHours || {}
  const tags = rawTags || []
  const services = rawServices?.length > 0 ? rawServices : []

  const today = DAYS[new Date().getDay()]
  
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : Number(rating_avg || 0).toFixed(1)
  const totalReviews = reviews.length || rating_count || 0

  const handleAiGen = () => {
    setAiLoading(true)
    setAiText('')
    setTimeout(() => {
      setAiLoading(false)
      setAiText(`AI summary: ${name_en} is highly rated (${avgRating} stars from ${totalReviews} reviews) and specializes in ${category?.name_en || 'various services'}. Users consistently praise their promptness and quality of work. Located in ${governorate?.name_en || 'Oman'}.`)
    }, 1500)
  }

  return (
    <>
      <div className="wrap pt-4">
        {/* BREADCRUMB */}
        <div className={`bc ${isStuck ? 'stuck' : ''}`}>
          <Link to="/">Home</Link>
          <span className="bc-sep">/</span>
          <Link to="/businesses">Services</Link>
          <span className="bc-sep">/</span>
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{name_en}</span>
        </div>

        {/* PHOTO MOSAIC */}
        <div className="mosaic relative group/mosaic">
          {isOwner && (
             <Link to={`/vendor/edit-shop/${business.id}`} 
               className="absolute top-4 right-4 z-[20] bg-white/90 backdrop-blur shadow-sm p-3 rounded-xl border border-line flex items-center gap-2 text-[13px] font-bold hover:bg-white transition-all">
                ⚙️ Manage Images
             </Link>
          )}
          <div className="mosaic-main cursor-pointer" onClick={() => setLbIndex(0)}>
            <img src={displayGallery[0]} alt="Main" />
          </div>
          {displayGallery.slice(1, 3).map((img, i) => (
             <div key={i} className="mosaic-sub cursor-pointer" onClick={() => setLbIndex(i+1)}>
               <img src={img} alt="" />
             </div>
          ))}
          <button className="mosaic-btn" onClick={() => setLbIndex(0)}>⊞ View all photos</button>
        </div>

        <div className="columns">
          {/* LEFT COLUMN */}
          <div>
            <div className="identity">
              <div className="flex items-start justify-between gap-4">
                <div className="id-badges">
                  {is_verified && <span className="badge-v">✓ Verified Business</span>}
                  {listing_type !== 'standard' && <span className="badge-f">⭐ Featured</span>}
                </div>
              </div>
              <h1 className="id-name">{name_en}</h1>
              <div className="id-meta">
                <span>
                  <span className="id-stars">{'★'.repeat(Math.round(avgRating))}</span> 
                  <strong>{avgRating}</strong> ({totalReviews} reviews)
                </span>
                <span className="sep">·</span>
                <span>📍 {address || (governorate ? governorate.name_en : 'Oman')}</span>
                {category && (
                  <>
                    <span className="sep">·</span>
                    <span>🏷️ {category.name_en}</span>
                  </>
                )}
              </div>
            </div>

            <div className="ai-block">
              <div className="ai-block-head">
                <div className="ai-block-title"><span className="ai-spark">✦</span> AI Summary</div>
                <button className="ai-gen-btn" onClick={handleAiGen} disabled={aiLoading}>
                  {aiLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
              <div className="ai-text">
                {aiLoading ? (
                  <div className="ai-dots">
                    <span className="ai-dot"></span><span className="ai-dot"></span><span className="ai-dot"></span>
                  </div>
                ) : aiText}
              </div>
            </div>

            <div className="bento">
              <div className="bt">
                <div className="bt-label">Rating</div>
                <div className="rating-tile">
                  <div className="rt-num">{avgRating}</div>
                  <div className="rt-right">
                    <RatingStars rating={avgRating} />
                    <div className="rt-cnt">{totalReviews} reviews</div>
                  </div>
                </div>
              </div>
              <div className="bt bt-stat">
                <span className="bt-ico">👀</span>
                <div className="bt-label">Profile Views</div>
                <div className="bt-val">{view_count || 1}</div>
              </div>
              <div className="bt bt-stat">
                <span className="bt-ico">✨</span>
                <div className="bt-label">Services Offered</div>
                <div className="bt-val">{services.length || 'Various'}</div>
              </div>
              <div className="bt span2">
                <span className="bt-ico">🕐</span>
                <div className="bt-label">Business hours</div>
                <div className="hours-mini">
                  {DAYS.map(day => {
                    const hours = business_hours[day.toLowerCase()]
                    const isClosed = !hours || hours.closed
                    const isToday = day === today
                    return (
                      <div key={day} className="hm-row">
                        <span className={`hm-day ${isToday ? 'hm-today' : ''}`}>
                          {isToday && <span className="today-pip"></span>}
                          {day}
                        </span>
                        <span className={`hm-time ${isToday && !isClosed ? 'hm-today' : ''}`} style={isClosed ? { color: 'var(--dim)' } : {}}>
                          {!isClosed ? `${hours.open} – ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bt">
                <span className="bt-ico">📍</span>
                <div className="bt-label">Location</div>
                <div className="bt-val">{governorate ? governorate.name_en : 'Muscat, Oman'}</div>
                <div className="bt-sub">{address}</div>
              </div>
              <div className="bt">
                <span className="bt-ico">📞</span>
                <div className="bt-label">Contact</div>
                <div className="bt-val">{phone || whatsapp || 'Contact from booking'}</div>
                <div className="bt-sub">{email || 'N/A'}</div>
                {website && <div className="bt-sub text-blue-600 mt-1"><a href={website} target="_blank" rel="noreferrer">Website</a></div>}
              </div>
              {has_deal && (
                <div className="bt" style={{ borderColor: '#15803D', background: '#F0FDF4' }}>
                  <span className="bt-ico">🎁</span>
                  <div className="bt-label" style={{ color: '#166534' }}>Special Deal</div>
                  <div className="bt-val" style={{ color: '#14532D', fontSize: '13px' }}>{deal_text || 'Ask about our current promotions!'}</div>
                </div>
              )}
            </div>

            <div className="desc-block">
              <div className="section-title">About</div>
              <p className="desc-text">{description || short_description || 'No description provided.'}</p>
              {tags.length > 0 && (
                <div className="desc-tags">
                  {tags.map(t => <span key={t} className="dtag">{t}</span>)}
                </div>
              )}
            </div>

            <div className="reviews-block" id="reviews">
              <div className="section-title">Reviews ({totalReviews})</div>
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="review-card">
                  <div className="rv-av" style={{ background: '#475569' }}>
                    {(r.reviewer_name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="rv-name">{r.reviewer_name || 'Anonymous'}</div>
                    <div className="rv-meta">
                      <span className="rv-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span>·</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <div className="rv-text">{r.comment}</div>}
                  </div>
                </div>
              ))}

              <div className="write-review">
                <div className="wr-title">Write a review</div>
                <form onSubmit={e => {
                  e.preventDefault()
                  if (!reviewForm.rating) return toast.error('Please select a rating')
                  submitReview.mutate({ ...reviewForm, business_id: business.id })
                }}>
                  <StarPicker value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
                  <input type="text" className="wr-input" placeholder="Your name" required
                    value={reviewForm.reviewer_name} onChange={e => setReviewForm(f => ({ ...f, reviewer_name: e.target.value }))} />
                  <textarea className="wr-input" placeholder="Share your experience..." rows="3"
                    value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}></textarea>
                  <button type="submit" disabled={submitReview.isPending} className="wr-btn">
                    {submitReview.isPending ? 'Submitting...' : 'Submit review'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
              <div className="booking-card p-8 text-center bg-white shadow-2xl border border-gray-100 rounded-[32px] overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
                
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <Calendar size={32} />
                </div>
                
                <h3 className="text-xl font-black text-ink mb-3">Instant Booking</h3>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                  Choose your preferred service, date, and time. Secure your spot in seconds.
                </p>
  
                <Link to={`/business/${slug}/book`} className="w-full bg-ink text-white py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 active:scale-95 transition-all text-sm block">
                   Book Services Online
                </Link>
                
                <div className="mt-8 pt-8 border-t border-gray-100">
                   <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Or Reach Directly</p>
                   <div className="flex flex-col gap-3">
                     {whatsapp && (
                       <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:opacity-90">
                          Chat on WhatsApp
                       </a>
                     )}
                     {phone && (
                       <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 py-3 border border-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50">
                          Call {phone}
                       </a>
                     )}
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-gray-50">
                      <img 
                         src="https://img.freepik.com/premium-vector/vectors-women-various-situations_753212-1401.jpg?w=360" 
                         alt="Booking Illustration" 
                         className="w-full rounded-2xl opacity-80"
                      />
                   </div>
                </div>
              </div>

            <div className="services-block mt-8">
           
              {services.length === 0 ? (
                <p className="text-sm text-gray-500"></p>
              ) : (
                services.map(s => (
                  <div key={s.id || s.name} className="svc-row">
                    <div className="svc-left">
                      <div className="svc-name text-sm">{s.name}</div>
                      <div className="svc-desc text-xs">{s.description || 'Professional service'}</div>
                    </div>
                    <div className="svc-right">
                      <span className="svc-price text-sm">{s.price || 'Ask for price'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        <Lightbox
          images={displayGallery}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onPrev={() => setLbIndex(prev => (prev > 0 ? prev - 1 : displayGallery.length - 1))}
          onNext={() => setLbIndex(next => (next < displayGallery.length - 1 ? next + 1 : 0))}
        />

        {/* Success Modal */}
        <div className={`succ-bg ${isBooked ? 'open' : ''}`}>
          <div className="succ-card">
            <div className="succ-ico text-white">✓</div>
            <div className="succ-title">Booking Request Sent</div>
            <div className="succ-sub">The business will contact you shortly to confirm your appointment.</div>
            <button className="succ-btn sb-home" onClick={() => setIsBooked(false)}>Close</button>
          </div>
        </div>
      </div>
    </>
  )
}
