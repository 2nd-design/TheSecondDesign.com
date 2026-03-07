# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **The Second Design** website, built with Astro 5.0 and Tailwind CSS. It's a static site for a design and technology studio, based on the AstroWind template.

## Commands

```bash
npm run dev          # Start dev server at localhost:4321
npm run build        # Production build to ./dist/
npm run preview      # Preview production build locally

npm run check        # Run all checks (astro + eslint + prettier)
npm run fix          # Auto-fix eslint + prettier issues
```

## Architecture

### Content System

- **Blog posts**: `src/data/post/*.md|mdx` - uses Astro Content Collections with Zod validation
- **Video episodes**: `src/data/episode/*.md|mdx` - "Proof of Work" show content
- **Structured data**: `src/data/*.json` (persons, partners, products)
- **Content schemas**: `src/content/config.ts` - defines post and episode collection schemas

### Configuration

- **Site config**: `src/config.yaml` - main site settings, SEO metadata, blog config, analytics
- **Navigation**: `src/navigation.ts` - header and footer link structure
- **Custom integration**: `vendor/integration/` - loads YAML config at build time, exposes via `astrowind:config` virtual module

### Component Organization

```
src/components/
├── widgets/     # Page sections (Hero, Features, FAQs, Header, Footer, etc.)
├── ui/          # Atomic UI components (Button, Image, Background, etc.)
├── blog/        # Blog-specific components (SinglePost, ListItem, etc.)
└── common/      # Utilities (ToggleTheme, ToggleMenu)
```

### Layouts

- `Layout.astro` - Base layout with head, meta tags, analytics
- `PageLayout.astro` - Standard page wrapper with header/footer
- `MarkdownLayout.astro` - For markdown content pages
- `LandingLayout.astro` - Minimal layout for landing pages

### Routing

Uses Astro file-based routing in `src/pages/`. Blog routes at `[...blog]/` support pagination, categories, and tags.

### Styling

- Tailwind CSS with custom CSS variables in `tailwind.config.js`
- Dark mode support via class-based switching
- Global styles in `src/assets/styles/tailwind.css`

## Key Files

- `astro.config.ts` - Astro integrations (Tailwind, MDX, Sitemap, Icons)
- `src/utils/blog.ts` - Blog post fetching and filtering utilities
- `src/utils/permalinks.ts` - URL generation helpers

## Deployment

Configured for Netlify deployment via `netlify.toml`. Build output goes to `dist/`.
