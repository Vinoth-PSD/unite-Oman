import { Link } from 'react-router-dom'
import ServiceCard from '@/components/home/ServiceCard'

export default function ServiceShelf({ title, items, cardType = 'A' }) {
  return (
    <div className="shelf pt-[52px] rv">
      <div className="shelf-hd flex items-baseline justify-between mb-[22px]">
        <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-bold text-[var(--ink)] tracking-tight">
          {title}
        </h2>
        <a 
          href="#" 
          className="text-[13px] font-bold text-[var(--mid)] tr hover:text-[var(--brand)] relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1.5px] after:bg-[var(--brand)] after:transition-all hover:after:w-full"
        >
          View all
        </a>
      </div>

      <div className="shelf-track flex gap-[20px] overflow-x-auto pb-[20px] snap-x snap-mandatory scrollbar-hide no-scrollbar -mx-[48px] px-[48px]">
        {items.map((item, i) => (
          <div key={i} className={`rv d${Math.min(i + 1, 8)}`}>
            <ServiceCard type={cardType} item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}
