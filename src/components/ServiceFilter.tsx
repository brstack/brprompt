import { usePromptStore } from '@/stores/promptStore'

export function ServiceFilter() {
  const { getAiServices, filterService, setFilterService } = usePromptStore()
  const aiServices = getAiServices()

  if (aiServices.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => setFilterService(null)}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${
          filterService === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
        }`}
      >
        All
      </button>
      {aiServices.map((service) => (
        <button
          key={service}
          onClick={() => setFilterService(filterService === service ? null : service)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filterService === service
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          {service}
        </button>
      ))}
    </div>
  )
}
