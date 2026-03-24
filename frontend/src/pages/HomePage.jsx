import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { businessApi } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { 
  Brush, 
  Wrench, 
  HeartPulse, 
  Sparkles, 
  Monitor, 
  Package, 
  PartyPopper, 
  GraduationCap,
  Utensils
} from 'lucide-react'
import HomeHero from '@/components/home/HomeHero'
import ServiceShelf from '@/components/home/ServiceShelf'
import { CategoryGrid, WhySection, Testimonials, CTABand } from '@/components/home/HomeInfoSections'

export default function HomePage() {
  const navigate = useNavigate()
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.rv').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Fetch Live Data
  const { data: featuredData } = useQuery({
    queryKey: ['home-featured'],
    queryFn: () => businessApi.list({ sort: 'featured', per_page: 8 })
  })
  
  const { data: newData } = useQuery({
    queryKey: ['home-new'],
    queryFn: () => businessApi.list({ sort: 'newest', per_page: 8 })
  })

  const { data: techData } = useQuery({
    queryKey: ['home-tech'],
    queryFn: () => businessApi.list({ category: 'it-software', per_page: 8 })
  })

  const { data: autoData } = useQuery({
    queryKey: ['home-auto'],
    queryFn: () => businessApi.list({ category: 'automotive', per_page: 8 })
  })
  
  const { data: beautyData } = useQuery({
    queryKey: ['home-beauty'],
    queryFn: () => businessApi.list({ category: 'beauty', per_page: 8 })
  })

  // Mapper
  const mapBusiness = (b, index, extras = {}) => {
    const bgImg = b.cover_image_url || b.logo_url;
    const imgSrc = bgImg ? (bgImg.startsWith('/') ? import.meta.env.VITE_API_URL + bgImg : bgImg) : 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=420&q=85';
    const priceText = b.plan === 'enterprise' ? 'OMR 50+' : b.plan === 'professional' ? 'OMR 20+' : 'OMR 5+';

    return {
      name: b.name_en,
      img: imgSrc,
      price: priceText,
      rating: parseFloat(b.rating_avg || 0).toFixed(1),
      reviews: `${b.rating_count || 0}`,
      rank: extras.rank ? index + 1 : undefined,
      badge: extras.badge || (b.is_verified ? 'Verified' : b.listing_type === 'sponsored' ? 'Sponsored' : null),
      badgeClass: extras.badgeClass || (b.is_verified ? 'cf-h' : b.listing_type === 'sponsored' ? 'cf-d' : null),
      slug: b.slug,
      onClick: () => navigate(`/business/${b.slug}`)
    }
  }

  const trending = featuredData?.items?.map((b, i) => mapBusiness(b, i, { rank: true })) || []
  const justAdded = newData?.items?.map((b, i) => mapBusiness(b, i, { badge: 'New', badgeClass: 'cf-n' })) || []
  const tech = techData?.items?.map((b, i) => mapBusiness(b, i)) || []
  const auto = autoData?.items?.map((b, i) => mapBusiness(b, i)) || []
  const beauty = beautyData?.items?.map((b, i) => mapBusiness(b, i)) || []

  return (
    <main className="min-h-screen pt-[60px] bg-white overflow-hidden">
      <HomeHero />
      
      <div className="shelves pb-[100px] mt-[40px]">
        <div className="c space-y-[64px]">
          {trending.length > 0 && <ServiceShelf title="Trending this week" items={trending} cardType="A" />}
          {justAdded.length > 0 && <ServiceShelf title="Just added" items={justAdded} cardType="A" />}
          {beauty.length > 0 && <ServiceShelf title="Beauty & grooming" items={beauty} cardType="B" />}
          {tech.length > 0 && <ServiceShelf title="Tech & Software" items={tech} cardType="B" />}
          {auto.length > 0 && <ServiceShelf title="Automotive Essentials" items={auto} cardType="C" />}
        </div>
      </div>

      <CategoryGrid />
      <WhySection />
      <Testimonials />
      <CTABand />
    </main>
  )
}
