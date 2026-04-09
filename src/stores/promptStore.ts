import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      sections: [],
      selectedCardIds: new Set<string>(),
      filterService: null,

      // Section operations
      addSection: (title) => {
        set((state) => ({
          sections: [
            ...state.sections,
            { id: generateId(), title, cards: [] }
          ]
        }))
      },

      updateSectionTitle: (sectionId, title) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId ? { ...section, title } : section
          )
        }))
      },

      deleteSection: (sectionId) => {
        set((state) => ({
          sections: state.sections.filter((section) => section.id !== sectionId)
        }))
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
    }),
    {
      name: 'prompt-storage',
      partialize: (state) => ({ sections: state.sections }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persisted: any, current) => {
        // Migrate old aiService to aiServices
        if (persisted?.sections) {
          persisted.sections.forEach((section: any) => {
            section.cards?.forEach((card: any) => {
              if ('aiService' in card && !('aiServices' in card)) {
                card.aiServices = card.aiService ? [card.aiService] : []
                delete card.aiService
              }
              if (!card.aiServices) {
                card.aiServices = []
              }
            })
          })
        }

        return {
          ...current,
          ...persisted,
          selectedCardIds: new Set()
        }
      }
    }
  )
)
