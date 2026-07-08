# syntax=docker/dockerfile:1

FROM node:22-slim

# Install pnpm
RUN npm install -g pnpm@10.32.1

WORKDIR /app

# Copy whole monorepo for workspace resolution
COPY . .

# Install dependencies (uses pnpm-workspace.yaml at root)
RUN pnpm install --frozen-lockfile

# Build packages/types (no-op, source-only) and engine
RUN pnpm --filter @flowra/engine build

# Note: do NOT prune --prod here. pnpm's strict node_modules layout does not
# hoist transitive runtime deps (e.g. dotenv used via `import 'dotenv/config'`)
# into the engine's resolvable tree, so pruning breaks the runtime. We keep the
# full install to guarantee all runtime modules resolve.

WORKDIR /app/apps/engine

EXPOSE 3005

CMD ["node", "dist/index.js"]
