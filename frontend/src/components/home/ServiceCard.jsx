export default function ServiceCard({ type = 'A', item }) {
  if (type === 'A') {
    // Card A — standard square (e.g., Today's Deals)
    return (
      <div className="ca shrink-0 w-[204px] cursor-pointer group snap-start tr hover-lift" onClick={item.onClick}>
        <div className="ca-img w-[204px] h-[240px] rounded-[var(--r)] overflow-hidden bg-[var(--bg)] relative mb-[12px] border border-[var(--line)]">
          <img 
            src={item.img} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          {item.badge && (
            <span className={`ca-flag tr ${item.badgeClass || 'cf-d'}`}>
              {item.badge}
            </span>
          )}
          {item.rank && (
            <span className="absolute top-[10px] left-[10px] w-[24px] h-[24px] bg-[#F05A28] text-white text-[11px] font-bold flex items-center justify-center rounded-[6px] shadow-sm z-20">
              #{item.rank}
            </span>
          )}
        </div>
        <div className="ca-name text-[14px] font-bold text-[var(--ink)] leading-[1.3] mb-[4px] whitespace-nowrap overflow-hidden text-ellipsis tr group-hover:text-[var(--brand)]">{item.name}</div>
        <div className="ca-price text-[13px] text-[var(--mid)] font-medium">
          {item.oldPrice ? (
            <><strong className="text-[var(--ink)] font-bold">{item.price}</strong> · <span className="text-[var(--dim)] line-through">was {item.oldPrice}</span></>
          ) : (
            <strong className="text-[var(--ink)] font-bold">{item.price}</strong>
          )}
        </div>
        {(item.rating || item.reviews) && (
          <div className="ca-rat flex items-center gap-[4px] text-[12px] text-[var(--dim)] mt-[2px] font-medium">
            <span className="text-[#F59E0B]">★</span> {item.rating} · {item.reviews}
          </div>
        )}
      </div>
    )
  }

  if (type === 'B') {
    // Card B — wide cinematic (e.g., Beauty & Wellness)
    return (
      <div className="cb shrink-0 w-[262px] cursor-pointer group snap-start tr hover-lift" onClick={item.onClick}>
        <div className="cb-img w-[262px] h-[190px] rounded-[var(--r)] overflow-hidden relative mb-[12px] bg-neutral-100 border border-[var(--line)]">
          <img 
            src={item.img} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>
          <div className="cb-info absolute bottom-0 left-0 right-0 p-[14px] z-10 transition-transform duration-300 group-hover:translate-y-[-2px]">
            <div className="cb-name text-[15px] font-bold text-white leading-[1.2] mb-[2px]">{item.name}</div>
            <div className="cb-price text-[13px] text-white/90 font-medium whitespace-nowrap overflow-hidden text-ellipsis">From {item.price}</div>
          </div>
        </div>
        <div className="ca-rat flex items-center gap-[4px] text-[12px] text-[var(--dim)] font-medium">
          <span className="text-[#F59E0B]">★</span> {item.rating} · {item.reviews}
        </div>
      </div>
    )
  }

  if (type === 'C') {
    // Card C — circle (e.g., Home Essentials)
    return (
      <div className="cc shrink-0 w-[120px] text-center group snap-start cursor-pointer tr hover-lift" onClick={item.onClick}>
        <div className="cc-cir w-[88px] h-[88px] rounded-full overflow-hidden mx-auto mb-[10px] bg-[var(--bg)] border border-[var(--line)] shadow-inner">
          <img 
            src={item.img} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" 
          />
        </div>
        <div className="cc-n text-[13px] font-bold text-[var(--ink)] mb-[2px] leading-[1.2] tr group-hover:text-[var(--brand)]">{item.name}</div>
        <div className="cc-p text-[12px] font-bold text-[var(--mid)] tracking-tight">{item.price || item.count}</div>
      </div>
    )
  }

  return null
}
