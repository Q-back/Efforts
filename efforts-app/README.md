# Efforts - Focus Session Tracker

A focus session tracker app designed specifically for people with ADHD to help gamify their day by adding points for each focused session.

## Features

- **Session Tracking**: Start, edit, and end focus sessions with customizable goals
- **Points System**: Earn points based on session quality and duration
- **Quality Rating**: Rate sessions as Poor, Normal, Great, or Deep Focus
- **Statistics**: View daily, weekly, and monthly stats with comparison to previous periods
- **Export**: Copy your daily reports to clipboard in Markdown format for easy integration with note-taking apps like Obsidian
- **Offline-First**: All data is stored locally using IndexedDB

## Tech Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Pinia** for state management
- **Vue Router** for navigation
- **Dexie.js** for IndexedDB access
- **Day.js** for date handling

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [pnpm](https://pnpm.io/)

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the `master` branch via GitHub Actions CI/CD.

### Manual Deployment

You can manually deploy the app to GitHub Pages using:

```bash
# Build and deploy to GitHub Pages
pnpm deploy
```

## Contributing

Please feel free to submit issues or pull requests to help improve the application.
