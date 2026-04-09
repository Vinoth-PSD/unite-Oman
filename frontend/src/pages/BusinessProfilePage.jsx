import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessApi, reviewApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { Spinner } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)} 
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${
            n <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function RatingStars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`text-sm ${
          n <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}>★</span>
      ))}
    </div>
  )
}

function Lightbox({ images, index, onClose, onPrev, onNext }) {
  if (index === null) return null
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/60 hover:text-white transition-colors bg-white/10 p-2 rounded-full z-10"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button 
            onClick={onPrev} 
            className="absolute left-2 md:left-6 text-white/40 hover:text-white transition-colors z-10"
          >
            <ChevronLeft size={40} />
          </button>
          <button 
            onClick={onNext} 
            className="absolute right-2 md:right-6 text-white/40 hover:text-white transition-colors z-10"
          >
            <ChevronRight size={40} />
          </button>
        </>
      )}

      <img 
        src={images[index]} 
        alt="" 
        className="max-w-full max-h-[85vh] object-contain rounded-lg"
      />

      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2">
        <span className="text-white/60 text-sm font-medium">
          {index + 1} / {images.length}
        </span>
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
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="w-10 h-10" />
    </div>
  )
  
  if (error || !business) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-5xl mb-4">🏢</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Business not found</h2>
        <Link to="/businesses" className="text-blue-600 text-sm font-bold">
          ← Back to listings
        </Link>
      </div>
    </div>
  )

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? import.meta.env.VITE_API_URL + url : url;
  }

  const { name_en, description, short_description, category, governorate,
    cover_image_url: rawCover, gallery_urls: rawGallery, phone, whatsapp, email, website,
    address, is_verified, listing_type, rating_avg, rating_count, view_count, has_deal, deal_text,
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
  
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : Number(rating_avg || 0).toFixed(1)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* BREADCRUMB */}
        <div className={`flex items-center gap-2 text-sm py-3 overflow-x-auto whitespace-nowrap ${
          isStuck ? 'sticky top-0 bg-white/95 backdrop-blur-sm z-30 shadow-sm' : ''
        }`}>
          <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/businesses" className="text-gray-500 hover:text-gray-700">Services</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{name_en}</span>
        </div>

        {/* PHOTO MOSAIC */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 gap-2 mb-6 md:mb-8">
          {isOwner && (
            <Link 
              to={`/vendor/edit-shop/${business.id}`} 
              className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur shadow-sm p-2 md:p-3 rounded-lg md:rounded-xl border border-gray-200 flex items-center gap-2 text-xs md:text-sm font-bold hover:bg-white transition-all"
            >
              ⚙️ Manage Images
            </Link>
          )}
          
          <div 
            className="col-span-2 row-span-2 md:col-span-2 md:row-span-2 cursor-pointer"
            onClick={() => setLbIndex(0)}
          >
            <img 
              src={displayGallery[0]} 
              alt="Main" 
              className="w-full h-48 md:h-96 object-cover rounded-lg"
            />
          </div>
          
          {displayGallery.slice(1, 3).map((img, i) => (
            <div 
              key={i} 
              className="cursor-pointer"
              onClick={() => setLbIndex(i+1)}
            >
              <img 
                src={img} 
                alt="" 
                className="w-full h-24 md:h-[188px] object-cover rounded-lg"
              />
            </div>
          ))}
          
          <button 
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium shadow-md hover:bg-white transition-all"
            onClick={() => setLbIndex(0)}
          >
            ⊞ View all photos
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity Section */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2">
                  {is_verified && (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      ✓ Verified Business
                    </span>
                  )}
                  {listing_type !== 'standard' && (
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {name_en}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">{'★'.repeat(Math.round(avgRating))}</span>
                  <span className="text-gray-400">{'★'.repeat(5 - Math.round(avgRating))}</span>
                  <strong className="ml-1">{avgRating}</strong> ({totalReviews} reviews)
                </span>
                <span className="hidden sm:inline text-gray-300">·</span>
                <span>📍 {address || (governorate ? governorate.name_en : 'Oman')}</span>
                {category && (
                  <>
                    <span className="hidden sm:inline text-gray-300">·</span>
                    <span>🏷️ {category.name_en}</span>
                  </>
                )}
              </div>
            </div>

            {/* AI Block */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl md:rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-base md:text-lg font-semibold">
                  <span className="text-purple-600">✦</span> AI Summary
                </div>
                <button 
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-purple-600 text-xs md:text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  onClick={handleAiGen} 
                  disabled={aiLoading}
                >
                  {aiLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
              <div className="text-sm md:text-base text-gray-700 min-h-[60px]">
                {aiLoading ? (
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                ) : aiText}
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="col-span-2 md:col-span-1 bg-white rounded-xl p-3 md:p-4 border border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Rating</div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">{avgRating}</div>
                  <div>
                    <RatingStars rating={avgRating} />
                    <div className="text-xs text-gray-500 mt-1">{totalReviews} reviews</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span>👀</span>
                  <span className="text-xs text-gray-500">Profile Views</span>
                </div>
                <div className="text-xl md:text-2xl font-semibold text-gray-900">{view_count || 1}</div>
              </div>
              
              <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span>✨</span>
                  <span className="text-xs text-gray-500">Services</span>
                </div>
                <div className="text-xl md:text-2xl font-semibold text-gray-900">
                  {services.length || 'Various'}
                </div>
              </div>
              
              <div className="col-span-2 bg-white rounded-xl p-3 md:p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span>🕐</span>
                  <span className="text-xs text-gray-500">Business hours</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {DAYS.map(day => {
                    const hours = business_hours[day.toLowerCase()]
                    const isClosed = !hours || hours.closed
                    const isToday = day === today
                    return (
                      <div key={day} className="flex justify-between text-sm">
                        <span className={`${isToday ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                          {day.substring(0, 3)}
                          {isToday && <span className="ml-1 inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
                        </span>
                        <span className={isClosed ? 'text-gray-400' : 'text-gray-900'}>
                          {!isClosed ? `${hours.open} – ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span>📍</span>
                  <span className="text-xs text-gray-500">Location</span>
                </div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {governorate ? governorate.name_en : 'Muscat, Oman'}
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">{address}</div>
              </div>
              
              <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100">
                {/* <div className="flex items-center gap-2 mb-1">
                  <span>📞</span>
                  <span className="text-xs text-gray-500">Contact</span>
                </div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {phone || whatsapp || 'Contact via booking'}
                </div> */}
                <div className="text-xs text-gray-500 mt-1 truncate">{email || 'N/A'}</div>
                {website && (
                  <div className="mt-2">
                    <a 
                      href={website} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Visit Website →
                    </a>
                  </div>
                )}
              </div>
              
              {has_deal && (
                <div className="col-span-2 bg-green-50 rounded-xl p-3 md:p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span>🎁</span>
                    <span className="text-xs font-medium text-green-700">Special Deal</span>
                  </div>
                  <div className="text-sm text-green-800">
                    {deal_text || 'Ask about our current promotions!'}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">About</h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {description || short_description || 'No description provided.'}
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map(t => (
                    <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div id="reviews">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                Reviews ({totalReviews})
              </h2>
              
              <div className="space-y-4 mb-6">
                {reviews.slice(0, 5).map(r => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {(r.reviewer_name || 'A')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {r.reviewer_name || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="text-yellow-400">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </span>
                        <span>·</span>
                        <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && (
                        <p className="text-sm text-gray-700">{r.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Write Review Form */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Write a review</h3>
                <form 
                  className="space-y-3"
                  onSubmit={e => {
                    e.preventDefault()
                    if (!reviewForm.rating) return toast.error('Please select a rating')
                    submitReview.mutate({ ...reviewForm, business_id: business.id })
                  }}
                >
                  <StarPicker 
                    value={reviewForm.rating} 
                    onChange={v => setReviewForm(f => ({ ...f, rating: v }))} 
                  />
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name" 
                    required
                    value={reviewForm.reviewer_name} 
                    onChange={e => setReviewForm(f => ({ ...f, reviewer_name: e.target.value }))} 
                  />
                  <textarea 
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Share your experience..." 
                    rows="3"
                    value={reviewForm.comment} 
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  ></textarea>
                  <button 
                    type="submit" 
                    disabled={submitReview.isPending} 
                    className="w-full md:w-auto px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {submitReview.isPending ? 'Submitting...' : 'Submit review'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 md:h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
              
              <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-100 text-pink-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Calendar size={24} className="md:w-8 md:h-8" />
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 text-center">
                Instant Booking
              </h3>
              <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8 text-center leading-relaxed">
                Choose your preferred service, date, and time. Secure your spot in seconds.
              </p>

              <Link 
                to={`/business/${slug}/book`} 
                className="w-full bg-gray-900 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition-all text-xs md:text-sm block text-center"
              >
                Book Services Online
              </Link>
              
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-100">
                {/* <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 md:mb-4 text-center">
                  Or Reach Directly
                </p>
                <div className="flex flex-col gap-2 md:gap-3">
                  {whatsapp && (
                    <a 
                      href={`https://wa.me/${whatsapp}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-center gap-2 py-2.5 md:py-3 bg-[#25D366] text-white rounded-lg md:rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      Chat on WhatsApp
                    </a>
                  )}
                  {phone && (
                    <a 
                      href={`tel:${phone}`} 
                      className="flex items-center justify-center gap-2 py-2.5 md:py-3 border border-gray-200 text-gray-600 rounded-lg md:rounded-xl text-xs md:text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                      Call {phone}
                    </a>
                  )}
                </div> */}
                
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-50">
                  <img 
                    src="https://img.freepik.com/premium-vector/vectors-women-various-situations_753212-1401.jpg?w=360" 
                    alt="Booking Illustration" 
                    className="w-full rounded-xl md:rounded-2xl opacity-80"
                  />
                </div>
              </div>
            </div>

            {/* Services List */}
            {services.length > 0 && (
              <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Services Offered</h3>
                <div className="space-y-3">
                  {services.map(s => (
                    <div key={s.id || s.name} className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {s.description || 'Professional service'}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                        {s.price || 'Ask'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        {isBooked && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-bold text-center mb-2">Booking Request Sent</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                The business will contact you shortly to confirm your appointment.
              </p>
              <button 
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                onClick={() => setIsBooked(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}