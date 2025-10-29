# Next.js 16 - Core Concepts

## App Router

File-system based routing with layouts and nested routes.

```
app/
├── layout.tsx        # Root layout
├── page.tsx          # Home page (/)
├── about/page.tsx    # /about
└── blog/
    ├── layout.tsx    # Blog layout
    └── [slug]/page.tsx  # /blog/:slug
```

## Server Components

Default component type. Run on server, zero client JS.

```tsx
// app/page.tsx (Server Component)
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data.title}</div>;
}
```

## Client Components

Interactive components with hooks. Add `'use client'` directive.

```tsx
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## Server Actions

Server-side mutations called from client.

```tsx
// app/actions.ts
'use server';
export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ title });
  revalidatePath('/posts');
}

// app/page.tsx
import { createPost } from './actions';
export default function Page() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Dynamic Routes

File names with brackets create dynamic segments.

```tsx
// app/blog/[slug]/page.tsx
export default function Post({ params }: { params: { slug: string } }) {
  return <div>Post: {params.slug}</div>;
}
```

## Layouts

Shared UI that doesn't re-render on navigation.

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <nav>Navigation</nav>
        {children}
      </body>
    </html>
  );
}
```

## Loading States

Automatic loading UI with `loading.tsx`.

```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

## Error Handling

Catch errors with `error.tsx`.

```tsx
// app/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Metadata

SEO and social sharing metadata.

```tsx
// app/page.tsx
export const metadata = {
  title: 'My Page',
  description: 'Page description',
};
```

## Data Fetching

Server Components can fetch directly.

```tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  return <div>{data.title}</div>;
}
```

## Streaming

Send UI progressively with `<Suspense>`.

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  );
}
```

## Route Handlers

API routes in App Router.

```tsx
// app/api/posts/route.ts
export async function GET() {
  const posts = await db.posts.findMany();
  return Response.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await db.posts.create(body);
  return Response.json(post);
}
```

## Middleware

Run code before request completes.

```tsx
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const token = request.cookies.get('token');
  if (!token) {
    return NextResponse.redirect('/login');
  }
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

## Image Optimization

Automatic image optimization with `<Image>`.

```tsx
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Photo"
  width={500}
  height={300}
  priority
/>
```

## Link Prefetching

Client-side navigation with automatic prefetching.

```tsx
import Link from 'next/link';

<Link href="/about" prefetch={false}>About</Link>
```

## Key Rules

1. Server Components by default
2. Add `'use client'` for interactivity
3. Don't import Server Components into Client Components
4. Use Server Actions for mutations
5. Files must export default for pages

## Common Patterns

**Protected routes:**
```tsx
// middleware.ts
export function middleware(request: Request) {
  const isAuthenticated = request.cookies.get('auth');
  if (!isAuthenticated) return NextResponse.redirect('/login');
}
```

**Data revalidation:**
```tsx
import { revalidatePath, revalidateTag } from 'next/cache';

await revalidatePath('/posts');
await revalidateTag('posts');
```

**Parallel routes:**
```
app/
├── @modal/
│   └── page.tsx
└── layout.tsx  # Receives modal as prop
```

---

[Official Next.js Docs →](https://nextjs.org/docs)
