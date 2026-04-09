import type { PromptCard } from '@/stores/promptStore'

export function copyPromptsToClipboard(cards: PromptCard[]): Promise<void> {
  const prompts = cards
    .flatMap((card) => card.promptBlocks.map((block) => block.prompt))
    .filter((prompt) => prompt.trim() !== '')
    .join('\n\n')

  return navigator.clipboard.writeText(prompts)
}
