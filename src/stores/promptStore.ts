import { create } from 'zustand'
import pb from '../lib/pocketbase'

export interface PromptBlock {
  id: string
  blockTitle: string
  prompt: string
}

export interface PromptCard {
  id: string
  aiServices: string[]
  cardTitle: string
  promptBlocks: PromptBlock[]
}

export interface BlockSection {
  id: string
  title: string
  cards: PromptCard[]
}

interface PromptStore {
  sections: BlockSection[]
  selectedCardIds: Set<string>
  filterService: string | null
  isLoading: boolean
  error: string | null
  recordId: string | null

  // Server operations
  loadFromServer: (signal?: AbortSignal) => Promise<void>
  saveToServer: () => Promise<void>

  // Section operations
  addSection: (title: string) => void
  updateSectionTitle: (sectionId: string, title: string) => void
  deleteSection: (sectionId: string) => void

  // Card operations
  addCard: (sectionId: string, aiServices: string[], cardTitle: string) => void
  updateCard: (cardId: string, updates: Partial<Pick<PromptCard, 'aiServices' | 'cardTitle'>>) => void
  deleteCard: (cardId: string) => void
  duplicateCard: (cardId: string) => void

  // Block operations
  addBlock: (cardId: string, blockTitle: string, prompt: string) => void
  updateBlock: (blockId: string, updates: Partial<Pick<PromptBlock, 'blockTitle' | 'prompt'>>) => void
  deleteBlock: (blockId: string) => void

  // Selection operations
  toggleCardSelection: (cardId: string) => void
  clearSelection: () => void
  selectCard: (cardId: string) => void
  deselectCard: (cardId: string) => void

  // Data operations
  importData: (sections: BlockSection[]) => void
  getSelectedCards: () => PromptCard[]
  getAiServices: () => string[]

  // Filter operations
  setFilterService: (service: string | null) => void
}

const generateId = () => Math.random().toString(36).substring(2, 11)

// Debounced save to avoid too many requests
let saveTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSave = (saveToServer: () => Promise<void>) => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveToServer()
  }, 500)
}

export const usePromptStore = create<PromptStore>()((set, get) => ({
  sections: [],
  selectedCardIds: new Set<string>(),
  filterService: null,
  isLoading: false,
  error: null,
  recordId: null,

  // Server operations
  loadFromServer: async (signal?: AbortSignal) => {
    // Skip if already aborted
    if (signal?.aborted) return

    set({ isLoading: true, error: null })
    try {
      const records = await pb.collection('prompt_data').getList(1, 1)

      // Don't update state if aborted during request
      if (signal?.aborted) return

      if (records.items.length > 0) {
        const record = records.items[0]
        set({
          sections: record.sections || [],
          recordId: record.id,
          isLoading: false
        })
      } else {
        if (signal?.aborted) return
        const record = await pb.collection('prompt_data').create({
          sections: []
        })
        if (signal?.aborted) return
        set({ recordId: record.id, isLoading: false })
      }
    } catch (error) {
      // Ignore if aborted
      if (signal?.aborted) return
      console.error('Failed to load from server:', error)
      set({ error: 'Failed to load data from server', isLoading: false })
    }
  },

  saveToServer: async () => {
    const { recordId, sections } = get()
    if (!recordId) return

    try {
      await pb.collection('prompt_data').update(recordId, { sections })
    } catch (error) {
      console.error('Failed to save to server:', error)
      set({ error: 'Failed to save data to server' })
    }
  },

  // Section operations
  addSection: (title) => {
    set((state) => ({
      sections: [
        ...state.sections,
        { id: generateId(), title, cards: [] }
      ]
    }))
    debouncedSave(get().saveToServer)
  },

  updateSectionTitle: (sectionId, title) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      )
    }))
    debouncedSave(get().saveToServer)
  },

  deleteSection: (sectionId) => {
    set((state) => ({
      sections: state.sections.filter((section) => section.id !== sectionId)
    }))
    debouncedSave(get().saveToServer)
  },

  // Card operations
  addCard: (sectionId, aiServices, cardTitle) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              cards: [
                ...section.cards,
                { id: generateId(), aiServices, cardTitle, promptBlocks: [] }
              ]
            }
          : section
      )
    }))
    debouncedSave(get().saveToServer)
  },

  updateCard: (cardId, updates) => {
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        cards: section.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        )
      }))
    }))
    debouncedSave(get().saveToServer)
  },

  deleteCard: (cardId) => {
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        cards: section.cards.filter((card) => card.id !== cardId)
      })),
      selectedCardIds: new Set(
        [...state.selectedCardIds].filter((id) => id !== cardId)
      )
    }))
    debouncedSave(get().saveToServer)
  },

  duplicateCard: (cardId) => {
    set((state) => ({
      sections: state.sections.map((section) => {
        const cardIndex = section.cards.findIndex((card) => card.id === cardId)
        if (cardIndex === -1) return section

        const originalCard = section.cards[cardIndex]
        const newCard: PromptCard = {
          id: generateId(),
          aiServices: [...originalCard.aiServices],
          cardTitle: `${originalCard.cardTitle} (copy)`,
          promptBlocks: originalCard.promptBlocks.map((block) => ({
            id: generateId(),
            blockTitle: block.blockTitle,
            prompt: block.prompt
          }))
        }

        const newCards = [...section.cards]
        newCards.splice(cardIndex + 1, 0, newCard)
        return { ...section, cards: newCards }
      })
    }))
    debouncedSave(get().saveToServer)
  },

  // Block operations
  addBlock: (cardId, blockTitle, prompt) => {
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        cards: section.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                promptBlocks: [
                  ...card.promptBlocks,
                  { id: generateId(), blockTitle, prompt }
                ]
              }
            : card
        )
      }))
    }))
    debouncedSave(get().saveToServer)
  },

  updateBlock: (blockId, updates) => {
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        cards: section.cards.map((card) => ({
          ...card,
          promptBlocks: card.promptBlocks.map((block) =>
            block.id === blockId ? { ...block, ...updates } : block
          )
        }))
      }))
    }))
    debouncedSave(get().saveToServer)
  },

  deleteBlock: (blockId) => {
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        cards: section.cards.map((card) => ({
          ...card,
          promptBlocks: card.promptBlocks.filter((block) => block.id !== blockId)
        }))
      }))
    }))
    debouncedSave(get().saveToServer)
  },

  // Selection operations
  toggleCardSelection: (cardId) => {
    set((state) => {
      const newSet = new Set(state.selectedCardIds)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return { selectedCardIds: newSet }
    })
  },

  clearSelection: () => {
    set({ selectedCardIds: new Set() })
  },

  selectCard: (cardId) => {
    set((state) => {
      const newSet = new Set(state.selectedCardIds)
      newSet.add(cardId)
      return { selectedCardIds: newSet }
    })
  },

  deselectCard: (cardId) => {
    set((state) => {
      const newSet = new Set(state.selectedCardIds)
      newSet.delete(cardId)
      return { selectedCardIds: newSet }
    })
  },

  // Data operations
  importData: (sections) => {
    set({ sections, selectedCardIds: new Set() })
    debouncedSave(get().saveToServer)
  },

  getSelectedCards: () => {
    const state = get()
    const cards: PromptCard[] = []
    state.sections.forEach((section) => {
      section.cards.forEach((card) => {
        if (state.selectedCardIds.has(card.id)) {
          cards.push(card)
        }
      })
    })
    return cards
  },

  getAiServices: () => {
    const state = get()
    const services = new Set<string>()
    state.sections.forEach((section) => {
      section.cards.forEach((card) => {
        card.aiServices.forEach((service) => {
          if (service.trim()) {
            services.add(service)
          }
        })
      })
    })
    return Array.from(services).sort()
  },

  setFilterService: (service) => {
    set({ filterService: service })
  }
}))
