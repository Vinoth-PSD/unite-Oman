import { Link } from 'react-router-dom'
import ServiceCard from '@/components/home/ServiceCard'

export default function ServiceShelf({ title, items, cardType = 'A' }) {
  return (
    <div className="shelf pt-12">
      <div className="shelf-hd flex items-center justify-between mb-8 px-0.5">
        <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-bold text-[#0A0A0A] tracking-tight">
          {title}
        </h2>
        <a 
          href="#" 
          className="text-[13px] font-bold text-[#FF4B55] hover:opacity-80 transition-opacity"
        >
          See all →
        </a>
      </div>

      <div className={`shelf-track grid gap-4 pb-4 pt-1 ${
        cardType === 'B' ? 'grid-cols-2 lg:grid-cols-4' : 
        cardType === 'C' ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8' : 
        'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
      }`}>
        {items.slice(0, cardType === 'B' ? 4 : cardType === 'C' ? 8 : 5).map((item, i) => (
          <ServiceCard key={i} type={cardType} item={item} />
        ))}
      </div>
    </div>
  )
}
