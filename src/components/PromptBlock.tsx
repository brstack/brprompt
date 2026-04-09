import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { usePromptStore, type PromptBlock as PromptBlockType } from '@/stores/promptStore'

interface PromptBlockProps {
  block: PromptBlockType
}

export function PromptBlock({ block }: PromptBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(block.blockTitle)
  const [prompt, setPrompt] = useState(block.prompt)
  const { updateBlock, deleteBlock } = usePromptStore()

  const handleSave = () => {
    updateBlock(block.id, { blockTitle: title, prompt })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTitle(block.blockTitle)
    setPrompt(block.prompt)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2 p-3 bg-muted/50 rounded-md">
        <Input
          placeholder="Block title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm"
        />
        <Textarea
          placeholder="Enter prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="text-sm min-h-32"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {block.blockTitle && (
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {block.blockTitle}
            </p>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">
            {block.prompt || <span className="text-muted-foreground italic">Empty prompt</span>}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setIsEditing(true)}
          >
            <span className="sr-only">Edit</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={() => deleteBlock(block.id)}
          >
            <span className="sr-only">Delete</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
