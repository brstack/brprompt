import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PromptCard } from './PromptCard'
import { usePromptStore, type BlockSection as BlockSectionType } from '@/stores/promptStore'

interface BlockSectionProps {
  section: BlockSectionType
}

export function BlockSection({ section }: BlockSectionProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(section.title)
  const [showAddCard, setShowAddCard] = useState(false)
  const [newServices, setNewServices] = useState<string[]>([])
  const [newServiceInput, setNewServiceInput] = useState('')
  const [newCardTitle, setNewCardTitle] = useState('')

  const { updateSectionTitle, deleteSection, addCard, getAiServices, filterService } = usePromptStore()
  const aiServices = getAiServices()

  const filteredCards = filterService
    ? section.cards.filter((card) => card.aiServices.includes(filterService))
    : section.cards

  // Hide section if no cards match filter
  if (filterService && filteredCards.length === 0) {
    return null
  }

  const handleSaveTitle = () => {
    updateSectionTitle(section.id, title)
    setIsEditingTitle(false)
  }

  const handleCancelEdit = () => {
    setTitle(section.title)
    setIsEditingTitle(false)
  }

  const handleAddService = () => {
    const service = newServiceInput.trim()
    if (service && !newServices.includes(service)) {
      setNewServices([...newServices, service])
    }
    setNewServiceInput('')
  }

  const handleRemoveService = (service: string) => {
    setNewServices(newServices.filter((s) => s !== service))
  }

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(section.id, newServices, newCardTitle)
      setNewServices([])
      setNewServiceInput('')
      setNewCardTitle('')
      setShowAddCard(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') handleCancelEdit()
              }}
            />
            <Button size="sm" onClick={handleSaveTitle}>Save</Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold flex-1">{section.title}</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingTitle(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => deleteSection(section.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </Button>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCards.map((card) => (
          <PromptCard key={card.id} card={card} />
        ))}

        {showAddCard ? (
          <div className="p-4 border border-dashed rounded-lg space-y-3">
            {/* AI Services - tag style */}
            <div>
              <label className="text-sm font-medium mb-2 block">AI Services</label>
              <div className="flex flex-wrap items-center gap-2">
                {newServices.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/20 text-primary"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service)}
                      className="hover:text-destructive transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <Input
                    placeholder="Add service..."
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddService()
                      }
                    }}
                    list="ai-services-new"
                    className="h-7 w-32 text-xs"
                  />
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAddService}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </Button>
                </div>
                <datalist id="ai-services-new">
                  {aiServices.map((service) => (
                    <option key={service} value={service} />
                  ))}
                </datalist>
              </div>
            </div>
            <Input
              placeholder="Card Title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCard()
                if (e.key === 'Escape') setShowAddCard(false)
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddCard}>Add Card</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddCard(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="h-48 border-dashed"
            onClick={() => setShowAddCard(true)}
          >
            + Add Card
          </Button>
        )}
      </div>
    </div>
  )
}
