import { useQuery } from '@tanstack/react-query'
import { businessApi } from '@/lib/api'
import { motion } from 'framer-motion'
import ServiceCard from '@/components/home/ServiceCard'
import { useNavigate } from 'react-router-dom'

export default function DealsSection() {
  const navigate = useNavigate()
  
  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['home-deals'],
    queryFn: () => businessApi.list({ has_deal: true, per_page: 8 })
  })

  if (isLoading || !dealsData?.items?.length) return null

  const mapBusiness = (b) => {
    const bgImg = b.cover_image_url || b.logo_url
    const imgSrc = bgImg ? (bgImg.startsWith('/') ? import.meta.env.VITE_API_URL + bgImg : bgImg) : 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=420&q=85'
    
    // Extract percentage from deal_text if possible, otherwise use a placeholder
    const dealMatch = b.deal_text?.match(/(\d+)%/)
    const badge = dealMatch ? `${dealMatch[1]}% off` : 'Special'
    
    // Calculate dummy old price for visual excellence
    const price = b.plan === 'enterprise' ? 40 : b.plan === 'professional' ? 20 : 12
    const oldPrice = Math.round(price * 1.4)

    return {
      name: b.name_en,
      img: imgSrc,
      priceOnly: price,
      oldPrice: oldPrice,
      rating: parseFloat(b.rating_avg || 4.8).toFixed(1),
      reviews: `${(b.rating_count || 1200).toLocaleString()}`,
      badge: badge,
      slug: b.slug,
      onClick: () => navigate(`/business/${b.slug}`)
    }
  }

  const items = dealsData.items.map(mapBusiness)

  return (
    <section className="py-12 bg-white">
      <div className="c">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[28px] font-bold text-[#0A0A0A] font-['Bricolage_Grotesque'] tracking-tight">
            Today's deals
          </h2>
          <button 
            onClick={() => navigate('/search?has_deal=true')}
            className="flex items-center gap-1 text-[13px] font-bold text-[#FF4B55] hover:opacity-80 transition-opacity"
          >
            See all →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pb-4">
          {items.slice(0, 5).map((item, i) => (
            <ServiceCard key={i} type="A" item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

