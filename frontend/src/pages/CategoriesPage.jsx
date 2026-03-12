import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import { CategoryIconCard, Spinner } from '@/components/ui'

export default function CategoriesPage() {
  const { data: cats = [], isLoading } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryApi.list()
  })

  return (
    <div className="min-h-screen pt-16" style={{ background: '#F5F2EC' }}>
      <div className="max-w-[1240px] mx-auto px-6 py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#C5963A' }}>
            ✦ BROWSE BY CATEGORY
          </p>
          <h1 className="font-display text-[clamp(30px,4.5vw,52px)] font-normal text-ink tracking-tight">
            All Services in One Place
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cats.map((cat, i) => (
              <CategoryIconCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
