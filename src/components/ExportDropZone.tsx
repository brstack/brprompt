import { useDroppable } from '@dnd-kit/core'

interface ExportDropZoneProps {
  visible: boolean
  onDragOver: () => void
}

export function ExportDropZone({ visible, onDragOver }: ExportDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'export-zone'
  })

  if (!visible) return null

  if (isOver) {
    onDragOver()
  }

  return (
    <div
      ref={setNodeRef}
      className={`fixed top-0 right-0 h-full w-20 z-50 flex items-center justify-center transition-all ${
        isOver ? 'bg-primary/20 w-24' : 'bg-muted/50'
      }`}
    >
      <div className={`flex flex-col items-center gap-2 transition-transform ${isOver ? 'scale-110' : ''}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isOver ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
        <span className={`text-xs font-medium writing-mode-vertical ${isOver ? 'text-primary' : 'text-muted-foreground'}`}>
          Export
        </span>
      </div>
    </div>
  )
}
