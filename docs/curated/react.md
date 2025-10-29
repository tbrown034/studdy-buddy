# React 19.2 - Core Concepts

## Components

Functions that return UI elements.

```jsx
function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}
```

## Props

Data passed to components.

```jsx
<Button text="Click me" onClick={() => alert('clicked')} />
```

## State

Component memory that triggers re-renders.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## Effects

Run code after render or when dependencies change.

```jsx
import { useEffect } from 'react';

useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

## Refs

Access DOM elements or persist values without re-rendering.

```jsx
import { useRef } from 'react';

const inputRef = useRef(null);
inputRef.current.focus();
```

## Context

Share data without prop drilling.

```jsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
```

## Custom Hooks

Reusable stateful logic.

```jsx
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  return { count, increment };
}
```

## Server Components (19+)

Components that render on the server, reducing client bundle.

```jsx
// app/page.jsx (Server Component by default)
async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}
```

## Actions (19+)

Server-side mutations with automatic form handling.

```jsx
async function submitForm(formData) {
  'use server';
  const name = formData.get('name');
  await saveToDatabase(name);
}

function Form() {
  return (
    <form action={submitForm}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  );
}
```

## use Hook (19+)

Read promises and context during render.

```jsx
import { use } from 'react';

function Component({ dataPromise }) {
  const data = use(dataPromise);
  return <div>{data}</div>;
}
```

## Key Rules

1. Components must start with capital letter
2. Hooks must be called at top level
3. State updates are asynchronous
4. Keys must be stable, unique per list
5. Don't mutate state directly

## Common Patterns

**Conditional rendering:**
```jsx
{isLoggedIn ? <Dashboard /> : <Login />}
{error && <ErrorMessage error={error} />}
```

**Lists:**
```jsx
{items.map(item => <Item key={item.id} {...item} />)}
```

**Event handlers:**
```jsx
<button onClick={(e) => handleClick(e)}>Click</button>
```

**Controlled inputs:**
```jsx
<input value={text} onChange={(e) => setText(e.target.value)} />
```

---

[Official React Docs →](https://react.dev/)
