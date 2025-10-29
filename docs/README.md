# Documentation Source of Truth

This directory contains official documentation from supported technologies.

## Structure

```
docs/
├── react/          # React 19.2 documentation
├── nextjs/         # Next.js 16 documentation
├── tailwind/       # Tailwind CSS 4.0 documentation
├── nodejs/         # Node.js 23 documentation
├── pnpm/           # pnpm 9 documentation
├── typescript/     # TypeScript 5.9 documentation
├── python/         # Python 3.12 documentation
├── fetch-docs.sh   # Script to fetch latest docs
└── metadata.json   # Documentation metadata
```

## Usage

### Fetch Documentation

```bash
bash docs/fetch-docs.sh
```

This will:
1. Clone official repositories (shallow, sparse checkout)
2. Extract documentation files (Markdown/MDX/RST)
3. Place them in respective directories
4. Clean up temporary files

### Manual Update

To update a specific technology:

```bash
# Example: Update React docs
cd docs/.temp
git clone --depth 1 --sparse https://github.com/reactjs/react.dev.git
cd react.dev
git sparse-checkout set src/content
cp -r src/content/learn/* ../../react/
cp -r src/content/reference/* ../../react/
```

## Use Cases

1. **AI Context Injection**: Load docs into system prompts for accurate, version-specific responses
2. **Offline Reference**: Browse docs without internet
3. **Search/Index**: Build search functionality over documentation
4. **Version Control**: Track documentation changes over time

## File Formats

- **React/Next.js**: MDX (Markdown + JSX)
- **Tailwind**: MDX
- **Node.js**: Markdown
- **pnpm**: Markdown
- **TypeScript**: Markdown
- **Python**: reStructuredText (.rst)

## Notes

- Docs are fetched from official repositories
- Using sparse checkout to minimize download size
- Depth=1 for latest commits only
- Update frequency: As needed (monthly recommended)

## Gitignore

Documentation files are tracked in git for:
- Version control
- Deployment availability
- No runtime fetching needed

If you want to exclude them:
```
docs/react/**/*.mdx
docs/nextjs/**/*.mdx
docs/tailwind/**/*.mdx
docs/nodejs/**/*.md
docs/pnpm/**/*.md
docs/typescript/**/*.md
docs/python/**/*.rst
```

## Last Updated

See `metadata.json` for fetch timestamps and file counts.
