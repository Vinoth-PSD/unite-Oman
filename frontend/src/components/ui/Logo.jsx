export default function Logo({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 50" fill="none"
      height="42" className={className} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8317A"/>
          <stop offset="48%" stopColor="#F05A28"/>
          <stop offset="100%" stopColor="#5B2D8E"/>
        </linearGradient>
        <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8317A"/>
          <stop offset="100%" stopColor="#5B2D8E"/>
        </linearGradient>
      </defs>
      <path d="M11 3C6.03 3 2 7.03 2 12c0 7.25 9 17 9 17s9-9.75 9-17c0-4.97-4.03-9-9-9z"
        fill="url(#lg2)" opacity="0.92"/>
      <circle cx="11" cy="12" r="3.8" fill="white" opacity="0.95"/>
      <text x="28" y="30" fontFamily="Georgia,serif" fontSize="24"
        fontStyle="italic" fontWeight="700" fill="url(#lg1)">Unite</text>
      <text x="89" y="30" fontFamily="Georgia,serif" fontSize="24"
        fontStyle="italic" fontWeight="700" fill="#9B59D0">Oman</text>
      <text x="28" y="44" fontFamily="Arial,sans-serif" fontSize="7"
        fontWeight="600" fill="rgba(255,255,255,0.38)" letterSpacing="2.2">CONNECTING BUSINESSES</text>
    </svg>
  )
}
