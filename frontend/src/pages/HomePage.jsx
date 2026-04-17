import { useEffect } from 'react'
import { useQueries } from '@tanstack/react-query'
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
import DealsSection from '@/components/home/DealsSection'

// Cache shelves for 5 minutes — home page content rarely changes
const HOME_STALE_TIME = 5 * 60 * 1000

const HOME_SHELF_QUERIES = [
  { queryKey: ['home-featured'],   queryFn: () => businessApi.list({ sort: 'featured', per_page: 8 }) },
  { queryKey: ['home-new'],        queryFn: () => businessApi.list({ sort: 'newest', per_page: 8 }) },
  { queryKey: ['home-tech'],       queryFn: () => businessApi.list({ category: 'it-software', per_page: 8 }) },
  { queryKey: ['home-essentials'], queryFn: () => businessApi.list({ category: 'retail', per_page: 8 }) },
  { queryKey: ['home-grooming'],   queryFn: () => businessApi.list({ category: 'grooming-for-men', per_page: 8 }) },
  { queryKey: ['home-beauty'],     queryFn: () => businessApi.list({ category: 'spa', per_page: 8 }) },
]

export default function HomePage() {
  const navigate = useNavigate()

  // All shelf queries fire in parallel, cached for 5 minutes
  const results = useQueries({
    queries: HOME_SHELF_QUERIES.map(q => ({ ...q, staleTime: HOME_STALE_TIME }))
  })
  const [featuredData, newData, techData, homeEssentialsData, groomingData, beautyData] =
    results.map(r => r.data)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
        }
      })
    }, { threshold: 0.1 })
    
    // Select all elements with .rv on mount and after data loads
    document.querySelectorAll('.rv').forEach(el => observer.observe(el))
    
    return () => observer.disconnect()
  }, [featuredData, newData, techData, homeEssentialsData, beautyData, groomingData])

  // Mapper
  const mapBusiness = (b, index, extras = {}) => {
    const bgImg = b.cover_image_url || b.logo_url;
    
    // Deterministic fallback images for visual variety
    const fallbacks = [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80', // Cafe
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80', // Restaurant
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80', // Home Service
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', // Modern interior
      'https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=600&q=80'  // Cleaning
    ]
    const fallbackImg = fallbacks[index % fallbacks.length];
    
    const imgSrc = bgImg ? (bgImg.startsWith('/') ? import.meta.env.VITE_API_URL + bgImg : bgImg) : fallbackImg;
    
    // Simulate pricing for "Exact Design" demo if not real
    const currentPrice = b.plan === 'enterprise' ? 40 : b.plan === 'professional' ? 20 : 12;
    const oldPrice = extras.badge === 'New' ? null : Math.round(currentPrice * 1.3);

    return {
      name: b.name_en,
      img: imgSrc,
      priceOnly: currentPrice,
      oldPrice: oldPrice,
      rating: parseFloat(b.rating_avg || 4.8).toFixed(1),
      reviews: `${(b.rating_count || 1200).toLocaleString()}`,
      rank: extras.rank ? index + 1 : undefined,
      badge: extras.badge || (b.is_verified ? 'Verified' : b.listing_type === 'sponsored' ? 'Sponsored' : null),
      badgeClass: extras.badgeClass,
      slug: b.slug,
      onClick: () => navigate(`/business/${b.slug}`)
    }
  }

  const trending = featuredData?.items?.map((b, i) => mapBusiness(b, i, { rank: true })) || []
  const justAdded = newData?.items?.map((b, i) => mapBusiness(b, i, { badge: 'New', badgeClass: 'cf-n' })) || []
  const tech = techData?.items?.map((b, i) => mapBusiness(b, i)) || []
  const homeEssentials = homeEssentialsData?.items?.map((b, i) => mapBusiness(b, i)) || []
  const grooming = groomingData?.items?.map((b, i) => mapBusiness(b, i)) || []
  const beauty = beautyData?.items?.map((b, i) => mapBusiness(b, i)) || []

  return (
    <main className="min-h-screen pt-[60px] bg-white overflow-hidden">
      <HomeHero />
      
      <DealsSection />
      
      <div className="shelves pb-[48px] ">
        <div className="c ">
          {trending.length > 0 && <ServiceShelf title="Trending this week" items={trending} cardType="A" />}
          {justAdded.length > 0 && <ServiceShelf title="Just added" items={justAdded} cardType="A" />}
          {beauty.length > 0 && <ServiceShelf title="Beauty & wellness for women" items={beauty} cardType="B" />}
          {tech.length > 0 && <ServiceShelf title="Tech & Software" items={tech} cardType="B" />}
          {homeEssentials.length > 0 && <ServiceShelf title="Home Essentials" items={homeEssentials} cardType="C" />}
          {grooming.length > 0 && <ServiceShelf title="Grooming for men" items={grooming} cardType="B" />}
        </div>
      </div>

      <CategoryGrid />
      <WhySection />
      <Testimonials />
      <CTABand />
    </main>
  )
}
