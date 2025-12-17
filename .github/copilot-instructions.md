# Copilot Instructions for muffin-cmi

## Project Overview
**muffin-cmi** (Cross Meeting Intelligence) is a Next.js 16 + Prisma application for analyzing meeting transcripts, extracting insights, and managing action items. The project uses React 19 with the React Compiler, TypeScript in strict mode, and Tailwind CSS v4.

## Architecture

### Data Model (Prisma + SQLite)
Core entities defined in [prisma/schema.prisma](../prisma/schema.prisma):
- **User**: Supports roles (employee, host, manager, admin) with meeting ownership and action item assignments
- **Meeting**: Central entity with status flow: `processing` → `ready` (or `failed`). Stores video/audio URLs and summaries
- **TranscriptChunk**: Time-stamped transcript segments with speaker labels and optional emotion analysis (score + label)
- **Chapter**: Meeting segmentation with ordering (`orderIndex`) and time ranges
- **ActionItem**: Linked to meetings, assignees, and optional source chunks. Status: `todo` → `in_progress` → `done`
- **Decision**: Meeting decisions extracted from transcripts with source chunk references
- **QaLog** + **QaSource**: Question-answering system with source attribution to transcript chunks

### App Structure (Next.js App Router)
```
app/
  api/                          # API routes (planned structure, not yet implemented)
    auth/{login,me}/            # Authentication endpoints
    meetings/[id]/{             # Meeting-specific operations
      action-items, ask, chapters, decisions,
      emotions, media-url, send-report, status, transcript
    }
    chat/ask/                   # Cross-meeting chat/RAG
    my/action-items/            # User action items
  dashboard/                    # Dashboard UI (currently has duplicate layout.tsx - needs cleanup)
  meetings/[id]/{chat,live,summary}/  # Meeting detail views
  tasks/                        # Task management UI
```

### External Integrations
- **VNPT Services**: Placeholder directories exist at `src/lib/vnpt/` and `src/lib/rag/` (empty - likely for Vietnamese telecom provider integrations and RAG capabilities)
- **Vercel Analytics**: Integrated in root layout via `@vercel/analytics/next`

## Development Conventions

### Database & ORM
- **Prisma seeding**: Run with `pnpm prisma db seed` (executes [prisma/seed.ts](../prisma/seed.ts))
- **Client generation**: Prisma client outputs to `/src/generated/prisma` (gitignored)
- **Migrations**: Located in `prisma/migrations/` - use `pnpm prisma migrate dev`

### TypeScript Configuration
- Path alias: `@/*` maps to project root - use for imports across the app
- Target: ES2017 with strict mode enabled
- React JSX: Uses new `react-jsx` transform (no import React needed)

### Styling
- **Tailwind v4**: Uses new `@import "tailwindcss"` syntax in [app/globals.css](../app/globals.css)
- **Theme variables**: CSS variables defined in `:root` with dark mode support via `prefers-color-scheme`
- **Fonts**: Geist and Geist Mono from `next/font/google` (defined but not currently applied in layout)

### React Patterns
- **React Compiler**: Enabled in [next.config.ts](../next.config.ts) via `reactCompiler: true` - avoid manual memoization, let the compiler optimize
- **Server Components**: Default in App Router - use `"use client"` only when needed for interactivity
- **Type imports**: Prefer `import type` for type-only imports (e.g., `import type { Metadata }`)

## Critical Workflows

### Development
```bash
pnpm dev          # Start dev server on localhost:3000
pnpm build        # Production build
pnpm lint         # Run ESLint
```

### Database Operations
```bash
pnpm prisma generate              # Regenerate Prisma Client after schema changes
pnpm prisma migrate dev --name <description>  # Create and apply migration
pnpm prisma db seed               # Seed database with test data
pnpm prisma studio                # Open Prisma Studio GUI
```

## Key Implementation Notes

1. **API Routes Not Yet Implemented**: Directory structure exists under `app/api/` but route handlers (`route.ts` files) are missing - create them following Next.js 16 Route Handler conventions

2. **Dashboard Layout Duplicate**: [app/dashboard/page.tsx](../app/dashboard/page.tsx) incorrectly contains layout code instead of page content - needs refactoring

3. **Empty Service Directories**: `src/lib/rag/` and `src/lib/vnpt/` exist but contain no implementations yet

4. **Emotion Analysis**: TranscriptChunk model has optional `emotionScore` and `emotionLabel` fields - implement analysis service when adding transcript processing

5. **Source Attribution**: ActionItems and Decisions can reference their source TranscriptChunk via `sourceChunkId` - maintain this linkage for traceability

6. **Meeting Status Flow**: Always transition meetings from `processing` → `ready` or `failed` - never leave in processing indefinitely

## Dependencies of Note
- **Zod v4.2.1**: Use for request validation in API routes
- **Axios v1.13.2**: HTTP client (prefer native fetch unless specific Axios features needed)
- **React 19**: Bleeding edge - check compatibility when adding new libraries
- **Prisma 7.1**: Latest major version - refer to v7 docs for breaking changes

## When Adding Features

### API Routes
Create `route.ts` files with named exports (`GET`, `POST`, etc.):
```ts
export async function GET(request: Request) {
  // Implementation
}
```

### New Prisma Models
1. Update `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name <description>`
3. Regenerate client: `pnpm prisma generate`
4. Update seed file if needed

### UI Components
- Place shared components in a `components/` directory (not yet created)
- Use Server Components by default, add `"use client"` only when necessary
- Leverage Tailwind's utility classes, avoiding custom CSS when possible
