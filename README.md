# Puzzle Playtime Pro

A fun and interactive puzzle game built with React.

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Supabase** - Backend & database

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Features

- Interactive puzzle gameplay
- Timer and elapsed time tracking
- Leaderboard system
- Avatar selection
- Audio feedback
- Confetti celebrations
- Tutorial overlay for new players

## Project Structure

```
src/
├── components/     # UI components
│   ├── game/       # Game-specific components
│   └── ui/         # Reusable UI components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── types/          # TypeScript types
└── integrations/   # External service integrations
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
