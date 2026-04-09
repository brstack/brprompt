# brPrompts

A frontend tool for managing AI image/video generation prompts. Organize, filter, and export prompts with ease.

## Features

- **Hierarchical Organization**: Sections > Cards > Prompt Blocks
- **Multi-service Support**: Tag cards with multiple AI services (Midjourney, DALL-E, Grok, etc.)
- **Service Filtering**: Filter cards by AI service tags
- **Drag & Drop Export**: Drag cards to sidebar or use checkboxes to select
- **Copy to Clipboard**: Export selected prompts with one click
- **CSV Import/Export**: Backup and restore your prompt library
- **Local Storage**: Auto-saves to browser, no server needed
- **Card Duplication**: Quickly duplicate cards with all prompt blocks

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- @dnd-kit (drag and drop)
- PapaParse (CSV handling)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Add Section**: Click "+ Add Section" to create a category (e.g., "character", "style")
2. **Add Card**: Click "+ Add Card" within a section
3. **Add Prompt Blocks**: Click a card to edit and add prompt blocks
4. **Export**: Check cards or drag them to the sidebar, then "Copy to Clipboard"
5. **Backup**: Use "Export CSV" in header to download your data

## Data Structure

```
Section (e.g., "character")
└── Card (e.g., "alice", services: ["midjourney", "grok"])
    ├── Block (e.g., "hair": "blonde long hair")
    └── Block (e.g., "outfit": "blue dress")
```

## License

MIT
