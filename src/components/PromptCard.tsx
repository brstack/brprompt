import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { PromptBlock } from './PromptBlock'
import { usePromptStore, type PromptCard as PromptCardType } from '@/stores/promptStore'

interface PromptCardProps {
  card: PromptCardType
}

export function PromptCard({ card }: PromptCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editServices, setEditServices] = useState<string[]>(card.aiServices)
  const [newServiceInput, setNewServiceInput] = useState('')
  const [cardTitle, setCardTitle] = useState(card.cardTitle)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newBlockTitle, setNewBlockTitle] = useState('')
  const [newBlockPrompt, setNewBlockPrompt] = useState('')
  const [showAddBlock, setShowAddBlock] = useState(false)

  const { updateCard, deleteCard, duplicateCard, addBlock, toggleCardSelection, selectedCardIds, getAiServices } = usePromptStore()
  const isSelected = selectedCardIds.has(card.id)
  const aiServices = getAiServices()

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { type: 'card', card }
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1
      }
    : undefined

  const handleSaveCard = () => {
    updateCard(card.id, { aiServices: editServices, cardTitle })
  }

  const handleAddService = () => {
    const service = newServiceInput.trim()
    if (service && !editServices.includes(service)) {
      const newServices = [...editServices, service]
      setEditServices(newServices)
      updateCard(card.id, { aiServices: newServices })
    }
    setNewServiceInput('')
  }

  const handleRemoveService = (service: string) => {
    const newServices = editServices.filter((s) => s !== service)
    setEditServices(newServices)
    updateCard(card.id, { aiServices: newServices })
  }

  const handleOpenEdit = () => {
    setEditServices(card.aiServices)
    setCardTitle(card.cardTitle)
    setIsEditingTitle(false)
    setIsEditing(true)
  }

  const handleCloseEdit = () => {
    setIsEditing(false)
    setShowAddBlock(false)
    setNewBlockTitle('')
    setNewBlockPrompt('')
  }

  const handleAddBlock = () => {
    addBlock(card.id, newBlockTitle, newBlockPrompt)
    setNewBlockTitle('')
    setNewBlockPrompt('')
    setShowAddBlock(false)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open edit if clicking on buttons, checkbox, or drag handle
    if ((e.target as HTMLElement).closest('button, [data-drag-handle], [data-checkbox]')) {
      return
    }
    handleOpenEdit()
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        onClick={handleCardClick}
        className={`transition-all h-48 flex flex-col cursor-pointer hover:bg-muted/30 ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''} ${isDragging ? 'shadow-lg opacity-50' : ''}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="text-muted-foreground cursor-grab active:cursor-grabbing p-1 -m-1 hover:bg-muted rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
              </div>
              {card.aiServices.map((service) => (
                <span key={service} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                  {service}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <div data-checkbox onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleCardSelection(card.id)}
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  duplicateCard(card.id)
                }}
              >
                <span className="sr-only">Duplicate</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteCard(card.id)
                }}
              >
                <span className="sr-only">Delete</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </Button>
            </div>
          </div>
          <h4 className="font-semibold text-base">{card.cardTitle}</h4>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {card.promptBlocks.map((block) => (
              <div key={block.id} className="p-2 bg-muted/30 rounded text-sm">
                {block.blockTitle && (
                  <p className="text-xs font-medium text-muted-foreground mb-1">{block.blockTitle}</p>
                )}
                <p className="whitespace-pre-wrap break-words line-clamp-3">
                  {block.prompt || <span className="text-muted-foreground italic">Empty</span>}
                </p>
              </div>
            ))}
            {card.promptBlocks.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No prompts</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Title - click to edit */}
            <div>
              {isEditingTitle ? (
                <Input
                  placeholder="Card Title"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  onBlur={() => {
                    handleSaveCard()
                    setIsEditingTitle(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveCard()
                      setIsEditingTitle(false)
                    }
                  }}
                  autoFocus
                  className="text-lg font-semibold"
                />
              ) : (
                <h3
                  className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {cardTitle || <span className="text-muted-foreground italic">Click to add title</span>}
                </h3>
              )}
            </div>

            {/* AI Services - tag style */}
            <div>
              <label className="text-sm font-medium mb-2 block">AI Services</label>
              <div className="flex flex-wrap items-center gap-2">
                {editServices.map((service) => (
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
                    list="ai-services-edit"
                    className="h-7 w-32 text-xs"
                  />
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAddService}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </Button>
                </div>
                <datalist id="ai-services-edit">
                  {aiServices.map((service) => (
                    <option key={service} value={service} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prompt Blocks</label>
              <div className="space-y-3">
                {card.promptBlocks.map((block) => (
                  <PromptBlock key={block.id} block={block} />
                ))}

                {showAddBlock ? (
                  <div className="space-y-2 p-4 border border-dashed rounded-lg">
                    <Input
                      placeholder="Block title (optional)"
                      value={newBlockTitle}
                      onChange={(e) => setNewBlockTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Prompt"
                      value={newBlockPrompt}
                      onChange={(e) => setNewBlockPrompt(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddBlock}>Add Block</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddBlock(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setShowAddBlock(true)}
                  >
                    + Add Prompt Block
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
