# Tailwind CSS 4.0 - Core Concepts

## Utility Classes

Style elements with single-purpose classes.

```html
<div class="flex items-center justify-between p-4 bg-black text-white">
  <h1 class="text-2xl font-bold">Title</h1>
  <button class="px-4 py-2 border border-white hover:bg-white hover:text-black">
    Click
  </button>
</div>
```

## Responsive Design

Mobile-first breakpoint prefixes.

```html
<div class="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

Breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

## Dark Mode

Dark mode with class strategy.

```html
<div class="bg-white dark:bg-black text-black dark:text-white">
  Adapts to theme
</div>
```

## Hover & Focus States

State variants with prefixes.

```html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
  Button
</button>
```

## Flexbox

Flexible layouts.

```html
<div class="flex flex-col md:flex-row gap-4 items-center justify-between">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Grid

Grid layouts.

```html
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

## Spacing

Consistent spacing scale (4px increments).

```html
<div class="p-4 m-2 space-y-4">
  <!-- padding: 1rem, margin: 0.5rem, vertical gap: 1rem -->
</div>
```

Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

## Typography

Text styling utilities.

```html
<h1 class="text-4xl font-bold tracking-tight">
  Heading
</h1>
<p class="text-base leading-relaxed text-gray-600">
  Paragraph text
</p>
```

## Colors

Predefined color palette.

```html
<div class="bg-blue-500 text-white border-blue-700">
  Blue themed
</div>
```

Shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

## Borders

Border utilities.

```html
<div class="border-2 border-black rounded-lg">
  With border
</div>

<div class="border-t border-b-2 border-gray-300">
  Top and bottom borders
</div>
```

## Shadows

Box shadows.

```html
<div class="shadow-sm hover:shadow-lg transition-shadow">
  Elevated card
</div>
```

## Transitions

Smooth transitions.

```html
<button class="transition-all duration-200 hover:scale-105">
  Animated button
</button>
```

## Custom Properties (v4)

CSS-first configuration with `@theme`.

```css
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --font-display: 'Inter', sans-serif;
}
```

```html
<div class="bg-brand text-display">
  Uses custom theme
</div>
```

## Arbitrary Values

One-off custom values.

```html
<div class="w-[137px] top-[117px] bg-[#1da1f2]">
  Custom values
</div>
```

## Container

Responsive container.

```html
<div class="container mx-auto px-4">
  Centered content with padding
</div>
```

## Aspect Ratio

Maintain aspect ratios.

```html
<div class="aspect-video bg-gray-200">
  16:9 aspect ratio
</div>
```

## Key Rules

1. Mobile-first (base styles, then add breakpoints)
2. Utility classes over custom CSS
3. Use arbitrary values sparingly
4. Compose utilities for complex patterns
5. Dark mode requires class strategy config

## Common Patterns

**Card:**
```html
<div class="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
  Card content
</div>
```

**Button:**
```html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-colors">
  Button
</button>
```

**Input:**
```html
<input class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

**Centered layout:**
```html
<div class="min-h-screen flex items-center justify-center">
  Centered
</div>
```

**Sticky header:**
```html
<header class="sticky top-0 bg-white border-b z-10">
  Header
</header>
```

---

[Official Tailwind Docs →](https://tailwindcss.com/docs)
