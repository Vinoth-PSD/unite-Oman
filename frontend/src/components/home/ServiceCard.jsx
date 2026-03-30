import { motion } from 'framer-motion'

export default function ServiceCard({ type = 'A', item }) {
  if (type === 'A' || type === 'B') {
    // Card A & B — Minimalist design from screenshot
    const isWide = type === 'B'
    
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        className={`${isWide ? 'md:w-[240px]' : 'w-full'} shrink-0 cursor-pointer group snap-start`}
        onClick={item.onClick}
      >
        {/* Image Container */}
        <div className={`relative overflow-hidden rounded-[20px] mb-3 ${isWide ? 'h-[160px]' : 'h-[220px]'} bg-gray-100`}>
          <img 
            src={item.img} 
            alt={item.name} 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'
              e.target.onerror = null
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          
          {/* Badge (Red Pill) */}
          {item.badge && (
            <div className="absolute top-3 left-3 bg-[#FF4B55] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
              {item.badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-0.5">
          <h3 className="text-[15px] font-bold text-[#0A0A0A] leading-tight group-hover:text-[#E8317A] tr truncate">
            {item.name}
          </h3>
          
          <div className="flex items-baseline gap-1.5 text-[14px]">
            <span className="font-bold text-[#0A0A0A]">OMR {item.priceOnly || item.price}</span>
            {item.oldPrice && (
              <span className="text-[#A0A0A0] font-medium">
                · <span className="opacity-80">was {item.oldPrice}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-[#A0A0A0] font-medium">
            <span className="text-[#F59E0B] text-[14px]">★</span>
            <span>{item.rating}</span>
            <span>·</span>
            <span>{item.reviews}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  if (type === 'C') {
    // Card C — Circle design but matching the minimalist feel
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        className="w-[120px] shrink-0 cursor-pointer text-center group snap-start"
        onClick={item.onClick}
      >
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden mx-auto mb-3 bg-gray-100 border border-gray-100 p-0.5">
          <img 
            src={item.img} 
            alt={item.name} 
            className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-110" 
          />
        </div>
        <h4 className="text-[13px] font-bold text-[#0A0A0A] leading-tight truncate group-hover:text-[#E8317A] tr">
          {item.name}
        </h4>
        <div className="text-[12px] font-bold text-[#6B6B6B] mt-0.5">{item.price || item.count}</div>
      </motion.div>
    )
  }

  return null
}


