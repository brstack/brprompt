import Papa from 'papaparse'
import type { BlockSection, PromptCard, PromptBlock } from '@/stores/promptStore'

interface CsvRow {
  sectionId: string
  sectionTitle: string
  cardId: string
  aiServices: string  // pipe-separated
  cardTitle: string
  blockId: string
  blockTitle: string
  prompt: string
}

export function exportToCsv(sections: BlockSection[]): string {
  const rows: CsvRow[] = []

  sections.forEach((section) => {
    if (section.cards.length === 0) {
      // Section with no cards - still export it
      rows.push({
        sectionId: section.id,
        sectionTitle: section.title,
        cardId: '',
        aiServices: '',
        cardTitle: '',
        blockId: '',
        blockTitle: '',
        prompt: ''
      })
    } else {
      section.cards.forEach((card) => {
        if (card.promptBlocks.length === 0) {
          // Card with no blocks
          rows.push({
            sectionId: section.id,
            sectionTitle: section.title,
            cardId: card.id,
            aiServices: card.aiServices.join('|'),
            cardTitle: card.cardTitle,
            blockId: '',
            blockTitle: '',
            prompt: ''
          })
        } else {
          card.promptBlocks.forEach((block) => {
            rows.push({
              sectionId: section.id,
              sectionTitle: section.title,
              cardId: card.id,
              aiServices: card.aiServices.join('|'),
              cardTitle: card.cardTitle,
              blockId: block.id,
              blockTitle: block.blockTitle,
              prompt: block.prompt
            })
          })
        }
      })
    }
  })

  return Papa.unparse(rows)
}

export function importFromCsv(csvString: string): BlockSection[] {
  const result = Papa.parse<CsvRow>(csvString, {
    header: true,
    skipEmptyLines: true
  })

  const sectionsMap = new Map<string, BlockSection>()
  const cardsMap = new Map<string, PromptCard>()

  result.data.forEach((row) => {
    // Get or create section
    if (!sectionsMap.has(row.sectionId)) {
      sectionsMap.set(row.sectionId, {
        id: row.sectionId,
        title: row.sectionTitle,
        cards: []
      })
    }

    // Skip if no card
    if (!row.cardId) return

    // Get or create card
    if (!cardsMap.has(row.cardId)) {
      const card: PromptCard = {
        id: row.cardId,
        aiServices: row.aiServices ? row.aiServices.split('|').filter((s) => s) : [],
        cardTitle: row.cardTitle,
        promptBlocks: []
      }
      cardsMap.set(row.cardId, card)
      sectionsMap.get(row.sectionId)!.cards.push(card)
    }

    // Add block if exists
    if (row.blockId) {
      const block: PromptBlock = {
        id: row.blockId,
        blockTitle: row.blockTitle,
        prompt: row.prompt
      }
      cardsMap.get(row.cardId)!.promptBlocks.push(block)
    }
  })

  return Array.from(sectionsMap.values())
}

export function downloadCsv(sections: BlockSection[], filename = 'prompts.csv') {
  const csv = exportToCsv(sections)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function readCsvFile(file: File): Promise<BlockSection[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const sections = importFromCsv(csv)
        resolve(sections)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
