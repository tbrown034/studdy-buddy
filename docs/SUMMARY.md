# Documentation Summary

**Last Updated:** 2025-10-28

## Fetched Documentation

Successfully fetched **1,381 files** from official repositories:

| Technology | Files | Format | Status |
|------------|-------|--------|--------|
| React      | 177   | MDX    | ✓ Complete |
| Next.js    | 375   | MDX    | ✓ Complete |
| Node.js    | 66    | MD     | ✓ Complete |
| pnpm       | 98    | MD     | ✓ Complete |
| TypeScript | 141   | MD     | ✓ Complete |
| Python     | 618   | RST    | ✓ Complete |
| Tailwind   | 0     | MDX    | ⚠ Failed (repo structure changed) |

**Total:** 1,475 documentation files

## Curated Minimal Docs

Located in `docs/curated/`:
- React 19.2 - Core concepts
- Next.js 16 - App Router essentials
- Tailwind 4.0 - Utility classes
- TypeScript 5.9 - Type system
- Python 3.12 - Language fundamentals

## Usage

### View Curated Docs
Navigate to `/docs` and select `[curated]` view.

### Search Full Docs
All 1,381 files are available in their respective directories for:
- Full-text search
- AI context injection
- Offline reference
- Version control

### Update Docs
```bash
bash docs/fetch-docs.sh
```

## File Locations

```
docs/
├── curated/           # Minimal brutalist docs (5 files)
│   ├── react.md
│   ├── nextjs.md
│   ├── tailwind.md
│   ├── typescript.md
│   └── python.md
├── react/             # Full React docs (177 files)
├── nextjs/            # Full Next.js docs (375 files)
├── nodejs/            # Full Node.js docs (66 files)
├── pnpm/              # Full pnpm docs (98 files)
├── typescript/        # Full TypeScript docs (141 files)
└── python/            # Full Python docs (618 files)
```

## Notes

- Docs are markdown/MDX/RST format
- Sourced from official repositories
- Using sparse checkout to minimize size
- Can be used for AI prompt context
- Searchable with grep/ripgrep
- Version controlled in git
