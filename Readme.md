# Flowra Monorepo

A production-grade Turborepo monorepo containing the Flowra AI-powered Agile orchestration platform.

## Structure

```
flowra/
├── apps/
│   ├── web/          # Next.js 16 frontend (port 3000)
│   └── engine/       # Node.js connectivity engine (port 3005)
├── packages/
│   ├── types/        # Shared TypeScript type definitions
│   ├── config-eslint/ # Shared ESLint config
│   └── config-typescript/ # Shared tsconfig bases
├── turbo.json        # Turborepo pipeline
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 10 (`npm install -g pnpm`)

### Installation
```bash
pnpm install
```

### Development
```bash
# Start all apps in parallel
pnpm dev

# Or start individually
pnpm --filter @flowra/web dev
pnpm --filter @flowra/engine dev
```

### Build
```bash
pnpm build
```

### Lint
```bash
pnpm lint
```

## Environment Variables

Each app has its own `.env` file:
- `apps/web/.env` — Next.js frontend environment variables
- `apps/engine/.env` — Engine service environment variables

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS |
| Backend | Node.js, Express 5, TypeScript |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini, Groq |
| Integrations | GitHub App, Jira OAuth, Slack Bolt, Discord.js |
| Monorepo | Turborepo + pnpm workspaces |
