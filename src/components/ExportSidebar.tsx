import { useDroppable } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePromptStore } from '@/stores/promptStore'
import { copyPromptsToClipboard } from '@/utils/clipboard'
import { useState } from 'react'

interface ExportSidebarProps {
  open: boolean
  onClose: () => void
}

export function ExportSidebar({ open, onClose }: ExportSidebarProps) {
  const { getSelectedCards, deselectCard, clearSelection } = usePromptStore()
  const selectedCards = getSelectedCards()
  const [copied, setCopied] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: 'export-drawer'
  })

  const handleCopy = async () => {
    await copyPromptsToClipboard(selectedCards)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed top-0 right-0 h-full w-[360px] bg-background border-l flex flex-col z-40">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold">Export Prompts</h2>
          <p className="text-sm text-muted-foreground">
            Drag cards here or use checkboxes
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 m-4 p-4 border-2 border-dashed rounded-lg overflow-y-auto transition-colors ${
          isOver ? 'border-primary bg-primary/10' : 'border-muted'
        }`}
      >
        {selectedCards.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-center">
            <p>No cards selected.<br />Drag or check cards to add them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedCards.map((card) => (
              <Card key={card.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{card.aiServices.join(', ')}</p>
                    <p className="font-medium">{card.cardTitle}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {card.promptBlocks.length} prompt block(s)
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => deselectCard(card.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 p-4 border-t">
        <Button
          className="flex-1"
          onClick={handleCopy}
          disabled={selectedCards.length === 0}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
        <Button
          variant="outline"
          onClick={clearSelection}
          disabled={selectedCards.length === 0}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
