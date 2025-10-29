# TypeScript 5.9 - Core Concepts

## Basic Types

Primitive type annotations.

```ts
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;
let value: null = null;
let data: undefined = undefined;
```

## Arrays

Typed arrays.

```ts
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];
```

## Objects

Object type definitions.

```ts
let user: { name: string; age: number } = {
  name: "John",
  age: 30
};
```

## Interfaces

Reusable type definitions.

```ts
interface User {
  id: number;
  name: string;
  email?: string;  // Optional property
  readonly createdAt: Date;  // Read-only
}

const user: User = {
  id: 1,
  name: "John",
  createdAt: new Date()
};
```

## Type Aliases

Alternative to interfaces.

```ts
type Point = { x: number; y: number };
type ID = string | number;
```

## Union Types

Value can be one of several types.

```ts
let id: string | number;
id = "abc123";  // OK
id = 123;       // OK

type Status = "pending" | "approved" | "rejected";
```

## Functions

Typed function parameters and returns.

```ts
function add(a: number, b: number): number {
  return a + b;
}

const multiply = (a: number, b: number): number => a * b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}`;
}
```

## Generics

Type-safe reusable code.

```ts
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello");
identity(42);  // Type inferred

// Generic interfaces
interface Box<T> {
  value: T;
}

const stringBox: Box<string> = { value: "hello" };
```

## Type Guards

Narrow types at runtime.

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(input)) {
  console.log(input.toUpperCase());  // TypeScript knows it's string
}
```

## Utility Types

Built-in type transformations.

```ts
// Partial - make all properties optional
type PartialUser = Partial<User>;

// Required - make all properties required
type RequiredUser = Required<User>;

// Pick - select specific properties
type UserPreview = Pick<User, "id" | "name">;

// Omit - exclude specific properties
type UserWithoutEmail = Omit<User, "email">;

// Record - create object type with specific keys
type UserRoles = Record<string, "admin" | "user">;
```

## Enums

Named constants.

```ts
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

let dir: Direction = Direction.Up;
```

## Type Assertions

Tell TypeScript the type you know.

```ts
const input = document.getElementById("input") as HTMLInputElement;
input.value = "text";

// Alternative syntax
const input2 = <HTMLInputElement>document.getElementById("input");
```

## Classes

Typed classes with access modifiers.

```ts
class Person {
  private id: number;
  public name: string;
  protected age: number;

  constructor(id: number, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}
```

## Async/Await

Typed promises.

```ts
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

## Mapped Types

Transform existing types.

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};
```

## Conditional Types

Types that depend on conditions.

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
```

## Template Literal Types

Type-safe string templates.

```ts
type Color = "red" | "blue" | "green";
type HexColor = `#${string}`;
type ColorProp = `${Color}Color`;  // "redColor" | "blueColor" | "greenColor"
```

## Key Rules

1. Explicitly type function parameters and returns
2. Use interfaces for objects, type aliases for unions
3. Avoid `any`, use `unknown` instead
4. Enable strict mode in tsconfig.json
5. Let TypeScript infer types when obvious

## Common Patterns

**React component props:**
```ts
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ text, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{text}</button>;
}
```

**API response:**
```ts
interface ApiResponse<T> {
  data: T;
  error?: string;
  loading: boolean;
}

const response: ApiResponse<User[]> = {
  data: [],
  loading: false
};
```

**Event handlers:**
```ts
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget);
};
```

**Type narrowing:**
```ts
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}
```

---

[Official TypeScript Docs →](https://www.typescriptlang.org/docs/)
