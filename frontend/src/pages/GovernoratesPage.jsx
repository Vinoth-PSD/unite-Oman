import { useQuery } from '@tanstack/react-query'
import { governorateApi } from '@/lib/api'
import { GovernorateIconCard, Spinner } from '@/components/ui'

export default function GovernoratesPage() {
  const { data: govs = [], isLoading } = useQuery({
    queryKey: ['governorates-all'],
    queryFn: () => governorateApi.list()
  })

  return (
    <div className="min-h-screen pt-16" style={{ background: '#F5F2EC' }}>
      <div className="max-w-[1240px] mx-auto px-6 py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#E8317A' }}>
            ✦ BROWSE BY LOCATION
          </p>
          <h1 className="font-display text-[clamp(30px,4.5vw,52px)] font-normal text-ink tracking-tight">
            Explore All 11 Governorates
          </h1>
          <p className="text-sm text-gray-500 mt-2">Discover verified businesses from Muscat to Salalah</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {govs.map((gov, i) => (
              <GovernorateIconCard key={gov.id} governorate={gov} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
