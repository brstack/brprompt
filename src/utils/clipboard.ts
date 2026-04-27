import type { PromptCard } from '@/stores/promptStore'

export function generatePromptText(cards: PromptCard[]): string {
  return cards
    .flatMap((card) => card.promptBlocks.map((block) => block.prompt))
    .filter((prompt) => prompt.trim() !== '')
    .join('\n\n')
}

export function copyPromptsToClipboard(cards: PromptCard[]): Promise<void> {
  const prompts = generatePromptText(cards)
  return navigator.clipboard.writeText(prompts)
}
