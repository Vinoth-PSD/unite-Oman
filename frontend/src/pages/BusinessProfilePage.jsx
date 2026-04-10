import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessApi, reviewApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { Spinner } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { 
  MapPin, Phone, Mail, Globe, Clock, Shield, Star, Heart, 
  Share2, ChevronRight, MessageCircle, Check, X, ChevronLeft,
  Award, Sparkles, Calendar, Users
} from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

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
          className={`text-2xl transition-all ${
            n <= (hover || value) ? 'text-[#e8317a] scale-110' : 'text-gray-200'
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
        <Star 
          key={n} 
          className={`w-3.5 h-3.5 ${
            n <= Math.round(rating) ? 'fill-[#e8317a] text-[#e8317a]' : 'text-gray-200'
          }`} 
        />
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
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('services')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const [reviewForm, setReviewForm] = useState({ reviewer_name: '', rating: 0, comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)

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
      toast.success('Review submitted!')
      setReviewForm({ reviewer_name: '', rating: 0, comment: '' })
      setShowReviewForm(false)
      qc.invalidateQueries({ queryKey: ['reviews', business.id] })
      qc.invalidateQueries({ queryKey: ['business', slug] })
    },
    onError: (e) => toast.error(getErrorMessage(e))
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner className="w-10 h-10 text-[#e8317a]" />
    </div>
  )
  
  if (error || !business) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-4">🏢</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Business not found</h2>
        <Link to="/businesses" className="text-[#e8317a] font-medium">
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
    address, is_verified, listing_type, rating_avg, rating_count, has_deal, deal_text,
    business_hours: rawHours = {}, tags: rawTags = [], services: rawServices = [], owner_id } = business

  const isOwner = user?.id === owner_id || isAdmin

  const coverUrl = getImageUrl(rawCover)
  const galleryUrls = rawGallery || []
  const validGallery = [coverUrl, ...galleryUrls.map(getImageUrl)].filter(Boolean)
  
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
  const services = rawServices?.length > 0 ? rawServices : [
    { id: 1, name: 'Standard Service', price: '12', duration: '30 min' },
    { id: 2, name: 'Premium Service', price: '25', duration: '60 min' },
    { id: 3, name: 'Express Service', price: '35', duration: '45 min' },
  ]

  const today = DAYS[new Date().getDay()]
  const todayHours = business_hours[today.toLowerCase()]
  const isOpenNow = todayHours && !todayHours.closed
  
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : Number(rating_avg || 4.8).toFixed(1)
  const totalReviews = reviews.length || rating_count || 0

  const handleAiSummary = () => {
    setAiLoading(true)
    setTimeout(() => {
      setAiLoading(false)
      setAiSummary(`${name_en} is a highly-rated ${category?.name_en || 'service provider'} serving ${governorate?.name_en || 'Oman'}. With ${avgRating} stars from ${totalReviews} reviews, customers praise their professionalism and quality service.`)
    }, 1200)
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success('Link copied!')
  }

  const handleWhatsApp = () => {
    if (whatsapp) {
      window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}`, '_blank')
    } else if (phone) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank')
    }
  }

  // Helper function to format hours display
  const formatHours = (hours) => {
    if (!hours || hours.closed) return 'Closed'
    if (hours.open && hours.close) return `${hours.open} – ${hours.close}`
    return 'Closed'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Mobile */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to="/businesses" className="text-gray-600">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-2">
            <Share2 size={20} className="text-gray-600" />
          </button>
          <button onClick={() => setIsLiked(!isLiked)} className="p-2">
            <Heart size={20} className={isLiked ? 'fill-[#e8317a] text-[#e8317a]' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Breadcrumb - Desktop */}
        <div className="hidden lg:flex items-center gap-2 text-sm mb-6">
          <Link to="/" className="text-gray-400 hover:text-gray-600">Home</Link>
          <span className="text-gray-300">/</span>
          <Link to="/businesses" className="text-gray-400 hover:text-gray-600">Directory</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700">{name_en}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Header Card */}
            <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    <Shield size={12} /> Verified
                  </span>
                )}
                {listing_type !== 'standard' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF3E0] text-[#e8317a] text-xs font-medium rounded-full">
                    <Award size={12} /> Featured
                  </span>
                )}
                {category && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {category.name_en}
                  </span>
                )}
                {isOpenNow ? (
                  <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Open Now
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                    Closed
                  </span>
                )}
              </div>

              {/* Title & Rating */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {name_en}
              </h1>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={avgRating} />
                  <span className="font-semibold text-gray-900">{avgRating}</span>
                </div>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500 text-sm">{totalReviews} reviews</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <MapPin size={14} />
                  {governorate?.name_en || 'Oman'}
                </span>
              </div>

              {/* AI Summary */}
              <div className="bg-gradient-to-r from-[#e8317a3a] to-[#8d2de20d] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#e8317a]" />
                    <span className="text-sm font-semibold text-gray-800">AI Summary</span>
                  </div>
                  <button 
                    onClick={handleAiSummary}
                    disabled={aiLoading}
                    className="text-xs text-[#e8317a] font-medium hover:underline"
                  >
                    {aiLoading ? 'Generating...' : aiSummary ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
                {aiLoading ? (
                  <div className="flex gap-1 py-2">
                    <span className="w-2 h-2 bg-[#e8317a] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#e8317a] rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-[#e8317a] rounded-full animate-bounce delay-200"></span>
                  </div>
                ) : aiSummary ? (
                  <p className="text-sm text-gray-700">{aiSummary}</p>
                ) : (
                  <p className="text-sm text-gray-500">Click Generate for an AI-powered overview</p>
                )}
              </div>

              {/* Contact Actions */}
              <div className="flex flex-wrap gap-2">
                {/* {phone && (
                  <a href={`tel:${phone}`} className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                    <Phone size={16} /> Call
                  </a>
                )} */}
                <button 
                  onClick={handleWhatsApp}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-medium hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
                {website && (
                  <a href={website} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                    <Globe size={16} /> Website
                  </a>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {['services', 'about', 'hours', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab 
                        ? 'text-[#e8317a] border-b-2 border-[#e8317a]' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    {tab === 'reviews' && totalReviews > 0 && (
                      <span className="ml-1.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {totalReviews}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5 lg:p-6">
                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Services Offered</h3>
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div key={service.id || service.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{service.description || service.duration || 'Professional service'}</p>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            OMR {service.price || '12'}
                          </div>
                        </div>
                      ))}
                    </div>
                    {has_deal && (
                      <div className="mt-4 p-4 bg-[#FFF3E0] rounded-xl">
                        <span className="text-sm font-semibold text-[#e8317a]">🎁 Special Deal</span>
                        <p className="text-sm text-gray-700 mt-1">{deal_text || 'Limited time offer available!'}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {description || short_description || 'No description provided.'}
                    </p>
                    {address && (
                      <div className="flex items-start gap-3 mb-3">
                        <MapPin size={18} className="text-gray-400 mt-0.5" />
                        <span className="text-gray-700">{address}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-3 mb-3">
                        <Mail size={18} className="text-gray-400" />
                        <a href={`mailto:${email}`} className="text-[#e8317a]">{email}</a>
                      </div>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {tags.map((tag) => (
                          <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Hours Tab */}
                {activeTab === 'hours' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={18} className="text-gray-500" />
                      <span className="font-medium text-gray-900">Business Hours</span>
                    </div>
                    <div className="space-y-2">
                      {DAYS.map((day) => {
                        const hours = business_hours[day.toLowerCase()]
                        const isToday = day === today
                        const hoursDisplay = formatHours(hours)
                        
                        return (
                          <div key={day} className={`flex justify-between py-2 ${isToday ? 'bg-[#FFF5F5] -mx-2 px-2 rounded-lg' : ''}`}>
                            <span className={`${isToday ? 'font-semibold text-[#e8317a]' : 'text-gray-700'}`}>
                              {day}
                            </span>
                            <span className={hoursDisplay === 'Closed' ? 'text-gray-400' : 'text-gray-900'}>
                              {hoursDisplay}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
                        <div>
                          <RatingStars rating={avgRating} />
                          <span className="text-sm text-gray-500">{totalReviews} reviews</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-4 py-2 bg-[#e8317a] text-white text-sm font-medium rounded-lg hover:bg-[#ff5252] transition-colors"
                      >
                        Write Review
                      </button>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          if (!reviewForm.rating) return toast.error('Please select a rating')
                          submitReview.mutate({ ...reviewForm, business_id: business.id })
                        }}>
                          <StarPicker value={reviewForm.rating} onChange={(v) => setReviewForm(f => ({ ...f, rating: v }))} />
                          <input
                            type="text"
                            placeholder="Your name"
                            required
                            value={reviewForm.reviewer_name}
                            onChange={(e) => setReviewForm(f => ({ ...f, reviewer_name: e.target.value }))}
                            className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e8317a]"
                          />
                          <textarea
                            placeholder="Share your experience..."
                            rows={3}
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e8317a] resize-none"
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              type="submit"
                              disabled={submitReview.isPending}
                              className="px-4 py-2 bg-[#e8317a] text-white text-sm font-medium rounded-lg hover:bg-[#ff5252] disabled:opacity-50"
                            >
                              {submitReview.isPending ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowReviewForm(false)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.length > 0 ? (
                        reviews.slice(0, 5).map((review) => (
                          <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#e8317a] to-[#ff8a8a] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {(review.reviewer_name || 'A')[0].toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{review.reviewer_name || 'Anonymous'}</span>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 my-1">
                                  <RatingStars rating={review.rating} />
                                </div>
                                {review.comment && (
                                  <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="space-y-6">
            {/* Instant Booking Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-[#e8317a]" />
                <h3 className="font-semibold text-gray-900">Instant Booking</h3>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                Book your service instantly. Choose time and confirm in seconds.
              </p>

              <Link
                to={`/business/${slug}/book`}
                className="block w-full py-3.5 bg-[#e8317a] text-white text-center font-semibold rounded-xl hover:bg-[#ff5252] transition-colors mb-4"
              >
                Book Services Online
              </Link>

              <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                <Shield size={12} />
                <span>Secure booking · Free cancellation</span>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{avgRating}</div>
                    <div className="text-xs text-gray-500">Avg Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">1k+</div>
                    <div className="text-xs text-gray-500">Bookings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery - AT THE BOTTOM (Original Size & Layout) */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
          
          <div className="relative grid grid-cols-2 md:grid-cols-3 gap-2">
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
    </div>
  )
}