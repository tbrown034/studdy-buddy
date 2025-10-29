#!/bin/bash
# Documentation Fetcher Script
# Fetches latest docs from official repositories
# Run: bash docs/fetch-docs.sh

set -e

DOCS_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_DIR="$DOCS_DIR/.temp"

echo "[doc-collector] Starting documentation fetch..."
mkdir -p "$TEMP_DIR"
mkdir -p "$DOCS_DIR"/{react,nextjs,tailwind,nodejs,pnpm,typescript,python}

# React - fetch from official repo
echo "[1/7] Fetching React docs..."
cd "$TEMP_DIR"
git clone --depth 1 --filter=blob:none --sparse https://github.com/reactjs/react.dev.git 2>/dev/null || true
cd react.dev
git sparse-checkout set src/content
cp -r src/content/learn/* "$DOCS_DIR/react/" 2>/dev/null || true
cp -r src/content/reference/* "$DOCS_DIR/react/" 2>/dev/null || true
cd "$TEMP_DIR"
rm -rf react.dev

# Next.js - fetch from official repo
echo "[2/7] Fetching Next.js docs..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/vercel/next.js.git 2>/dev/null || true
cd next.js
git sparse-checkout set docs
cp -r docs/* "$DOCS_DIR/nextjs/" 2>/dev/null || true
cd "$TEMP_DIR"
rm -rf next.js

# Tailwind CSS - fetch from official repo
echo "[3/7] Fetching Tailwind CSS docs..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/tailwindlabs/tailwindcss.com.git 2>/dev/null || true
cd tailwindcss.com
git sparse-checkout set src/pages/docs
cp -r src/pages/docs/* "$DOCS_DIR/tailwind/" 2>/dev/null || true
cd "$TEMP_DIR"
rm -rf tailwindcss.com

# Node.js - fetch from official repo
echo "[4/7] Fetching Node.js docs..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/nodejs/node.git 2>/dev/null || true
cd node
git sparse-checkout set doc/api
cp -r doc/api/* "$DOCS_DIR/nodejs/" 2>/dev/null || true
cd "$TEMP_DIR"
rm -rf node

# pnpm - fetch from official repo
echo "[5/7] Fetching pnpm docs..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/pnpm/pnpm.io.git 2>/dev/null || true
cd pnpm.io
git sparse-checkout set docs
cp -r docs/* "$DOCS_DIR/pnpm/" 2>/dev/null || true
cd "$TEMP_DIR"
rm -rf pnpm.io

# TypeScript - fetch from official repo
echo "[6/7] Fetching TypeScript docs..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/microsoft/TypeScript-Website.git 2>/dev/null || true
cd TypeScript-Website
git sparse-checkout set packages/documentation/copy/en
cp -r packages/documentation/copy/en/* "$DOCS_DIR/typescript/" 2>/dev/null || true
cd "$TEMP_DIR"
rm -rf TypeScript-Website

# Python - fetch from official repo
echo "[7/7] Fetching Python docs..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/python/cpython.git 2>/dev/null || true
cd cpython
git sparse-checkout set Doc
cp -r Doc/* "$DOCS_DIR/python/" 2>/dev/null || true
cd "$TEMP_DIR"
rm -rf cpython

# Cleanup
echo "[doc-collector] Cleaning up..."
cd "$DOCS_DIR"
rm -rf "$TEMP_DIR"

echo "[doc-collector] Documentation fetch complete!"
echo "Docs saved to: $DOCS_DIR"
