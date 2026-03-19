import { Check, Star, Zap, Crown, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const tiers = [
  {
    name: 'Starter',
    price: '0',
    description: 'Perfect for small businesses just getting started in Oman.',
    features: [
      'Up to 5 Business Listings',
      'Basic Profile (Name, Address, Contact)',
      'Standard Visibility in Search',
      'Basic Analytics',
      '1 Photo Upload'
    ],
    cta: 'Get Started Free',
    icon: <Zap className="w-6 h-6 text-orange-500" />,
    color: 'from-orange-500/20 to-orange-600/5'
  },
  {
    name: 'Professional',
    price: '25',
    description: 'Elevate your presence with enhanced visibility and tools.',
    features: [
      'Unlimited Business Listings',
      'Enhanced Profile (Hours, Services, Map)',
      'Higher Search Ranking',
      'Premium Dashboard Analytics',
      '10 Photo Uploads',
      '2 Verified Badges',
      'Social Media Links',
      'Customer Reviews Access'
    ],
    cta: 'Upgrade Now',
    icon: <Star className="w-6 h-6 text-pink-500" />,
    popular: true,
    color: 'from-pink-500/20 to-purple-600/5'
  },
  {
    name: 'Enterprise',
    price: 'Contact',
    description: 'Custom solutions for large agencies and organizations.',
    features: [
      'Priority Search Placement',
      'API Access',
      'Dedicated Account Manager',
      'Advanced Analytics & Reporting',
      'Custom Branding Options',
      'Featured Listing Slots (3/month)',
      'Bulk Data Export'
    ],
    cta: 'Talk to Sales',
    icon: <Crown className="w-6 h-6 text-purple-500" />,
    color: 'from-purple-500/20 to-indigo-600/5'
  }
]

const FAQs = [
  { q: 'How do list my business?', a: 'Just click on "List Your Business" and follow the simple steps to create your profile.' },
  { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard.' },
  { q: 'Is there a setup fee?', a: 'No, there are no hidden setup fees. All our plans are straightforward.' }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden" style={{ background: '#0A0614' }}>
      {/* Layer 1: Standard Website Dot Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40 -z-20" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }} />

      {/* Layer 2: Mesh Gradient Base (Static) */}
      <div className="absolute inset-0 pointer-events-none -z-10" style={{
        background: `radial-gradient(ellipse 70% 60% at 15% 60%, rgba(232,49,122,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 85% 30%, rgba(91,45,142,0.15) 0%, transparent 55%)`
      }} />

      {/* Layer 10: Dynamic S-Curve Glowing Blobs (SUBTLE ACCENTS) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-pink/10 rounded-full blur-[180px] animate-s-1 animate-pulse-glow mix-blend-screen" />
        <div className="absolute top-[30%] right-[-5%] w-[45vw] h-[45vw] bg-purple/10 rounded-full blur-[200px] animate-s-2 animate-pulse-glow mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[55vw] h-[55vw] bg-orange-600/5 rounded-full blur-[220px] animate-s-2 animate-pulse-glow mix-blend-screen" style={{ animationDelay: '-10s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 transition-all hover:bg-white/10">
            <span className="w-2 h-2 rounded-full bg-pink animate-ping" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">Flexible Plans for Every Business</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight mb-6">
            Elevate Your Business <br />
            <span className="brand-text">Presence in Oman</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/50 text-lg leading-relaxed">
            Choose the perfect plan to boost your visibility and connect with the Omani market. 
            From startups to enterprises, we have you covered.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {tiers.map((tier, idx) => (
            <div 
              key={tier.name}
              className={`group relative p-8 rounded-3xl border transition-all duration-500 hover:-translate-y-2 flex flex-col ${
                tier.popular 
                  ? 'bg-white/5 border-pink/30 shadow-[0_0_40px_-15px_rgba(232,49,122,0.3)]' 
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              {/* Card Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-pink to-orange text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {tier.icon}
                  </div>
                  {tier.name === 'Starter' && <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Free</span>}
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-white/50 mb-6 leading-relaxed">{tier.description}</p>

                <div className="flex items-baseline gap-1 mb-8">
                  {tier.price === 'Contact' ? (
                    <span className="text-3xl font-bold text-white">Contact Sales</span>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-white/40 mb-1">OMR</span>
                      <span className="text-5xl font-bold text-white tracking-tight">{tier.price}</span>
                      <span className="text-sm font-medium text-white/30">/mo</span>
                    </>
                  )}
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {tier.features.map(feat => (
                    <div key={feat} className="flex items-start gap-3 group/item">
                      <div className="mt-1 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-pink/40 transition-colors">
                        <Check className="w-3 h-3 text-pink" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-white/70 group-hover/item:text-white transition-colors">{feat}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={tier.cta === 'Talk to Sales' ? '/contact' : '/vendor/login'}
                  className={`block w-full py-4 rounded-2xl text-center font-bold text-sm transition-all duration-300 ${
                    tier.popular 
                      ? 'brand-btn shadow-lg shadow-pink/20 hover:shadow-pink/40' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Got Questions?</h2>
            <div className="w-12 h-1 mx-auto brand-btn rounded-full" />
          </div>
          <div className="space-y-4">
            {FAQs.map(faq => (
              <div key={faq.q} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-default group">
                <h4 className="text-white font-bold mb-2 flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-pink transition-all group-hover:translate-x-1" />
                </h4>
                <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-32 p-12 rounded-[40px] bg-gradient-to-r from-ink via-pink/5 to-ink border border-white/5 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">Ready to scale your business?</h2>
          <p className="text-white/50 mb-10 max-w-lg mx-auto">Join hundreds of businesses already thriving on UniteOman.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/vendor/login" className="brand-btn px-10 py-4 rounded-2xl shadow-xl shadow-pink/20">Get Started Now</Link>
            <Link to="/contact" className="px-10 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">View All FAQ</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
