import { useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { Header } from '@/components/Header'
import { BlockSection } from '@/components/BlockSection'
import { ExportSidebar } from '@/components/ExportSidebar'
import { ExportDropZone } from '@/components/ExportDropZone'
import { ServiceFilter } from '@/components/ServiceFilter'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePromptStore, type PromptCard } from '@/stores/promptStore'

function App() {
  const [exportOpen, setExportOpen] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [activeCard, setActiveCard] = useState<PromptCard | null>(null)

  const { sections, addSection, selectCard } = usePromptStore()

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      addSection(newSectionTitle)
      setNewSectionTitle('')
      setShowAddSection(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if ((over?.id === 'export-drawer' || over?.id === 'export-zone') && active.data.current?.type === 'card') {
      selectCard(active.id as string)
    }
  }

  const handleDropZoneDragOver = () => {
    if (!exportOpen) {
      setExportOpen(true)
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`min-h-screen bg-background transition-all ${exportOpen ? 'mr-[360px]' : ''}`}>
        <Header onOpenExport={() => setExportOpen(true)} />

        <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <ServiceFilter />

          {sections.map((section) => (
            <BlockSection key={section.id} section={section} />
          ))}

          {showAddSection ? (
            <div className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3">
              <Input
                placeholder="Section Title (e.g., composition, character)"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                autoFocus
                className="max-w-md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSection()
                  if (e.key === 'Escape') setShowAddSection(false)
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSection}>Add Section</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddSection(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button
              className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors"
              onClick={() => setShowAddSection(true)}
            >
              + Add Section
            </button>
          )}
        </main>

        {!exportOpen && <ExportDropZone visible={!!activeCard} onDragOver={handleDropZoneDragOver} />}
        <ExportSidebar open={exportOpen} onClose={() => setExportOpen(false)} />

        <DragOverlay>
          {activeCard && (
            <Card className="p-3 w-64 shadow-lg opacity-80">
              <p className="text-xs text-muted-foreground">{activeCard.aiServices.join(', ')}</p>
              <p className="font-medium">{activeCard.cardTitle}</p>
            </Card>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

export default App
