import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { usePromptStore } from '@/stores/promptStore'
import { downloadCsv, readCsvFile } from '@/utils/csv'

interface HeaderProps {
  onOpenExport: () => void
}

export function Header({ onOpenExport }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { sections, importData, selectedCardIds } = usePromptStore()

  const handleExportCsv = () => {
    downloadCsv(sections)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const importedSections = await readCsvFile(file)
        importData(importedSections)
      } catch (error) {
        console.error('Failed to import CSV:', error)
        alert('Failed to import CSV file')
      }
    }
    e.target.value = ''
  }

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="brPrompts" className="w-6 h-6" />
          <h1 className="text-lg font-semibold">brPrompts</h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export CSV
          </Button>
          <Button size="sm" onClick={onOpenExport}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
            Export
            {selectedCardIds.size > 0 && (
              <span className="ml-1 bg-primary-foreground text-primary rounded-full px-1.5 text-xs">
                {selectedCardIds.size}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
