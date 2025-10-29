# Python 3.12 - Core Concepts

## Variables & Types

Dynamic typing with type hints.

```python
name: str = "John"
age: int = 30
price: float = 19.99
is_active: bool = True
items: list[str] = ["apple", "banana"]
scores: dict[str, int] = {"math": 95, "english": 88}
```

## Functions

Define reusable code blocks.

```python
def greet(name: str) -> str:
    return f"Hello, {name}"

# Default parameters
def power(base: int, exp: int = 2) -> int:
    return base ** exp

# Multiple return values
def get_user() -> tuple[str, int]:
    return "John", 30

name, age = get_user()
```

## Lists

Ordered, mutable collections.

```python
numbers = [1, 2, 3, 4, 5]
numbers.append(6)
numbers.extend([7, 8])
numbers.insert(0, 0)
numbers.remove(3)
first = numbers[0]
last = numbers[-1]
slice = numbers[1:4]
```

## Dictionaries

Key-value pairs.

```python
user = {
    "name": "John",
    "age": 30,
    "email": "john@example.com"
}

user["age"] = 31
user.get("phone", "N/A")  # Default if not found
user.pop("email")
```

## List Comprehensions

Concise list creation.

```python
# Basic
squares = [x**2 for x in range(10)]

# With condition
evens = [x for x in range(10) if x % 2 == 0]

# Nested
matrix = [[i*j for j in range(3)] for i in range(3)]
```

## Classes

Object-oriented programming.

```python
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
        self._private = "hidden"

    def greet(self) -> str:
        return f"Hello, I'm {self.name}"

    @property
    def is_adult(self) -> bool:
        return self.age >= 18

person = Person("John", 30)
print(person.greet())
```

## Inheritance

Extend classes.

```python
class Student(Person):
    def __init__(self, name: str, age: int, grade: str):
        super().__init__(name, age)
        self.grade = grade

    def study(self) -> str:
        return f"{self.name} is studying"
```

## Error Handling

Try/except blocks.

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
finally:
    print("Cleanup")
```

## File Operations

Read and write files.

```python
# Read
with open("file.txt", "r") as f:
    content = f.read()
    lines = f.readlines()

# Write
with open("file.txt", "w") as f:
    f.write("Hello\n")
    f.writelines(["Line 1\n", "Line 2\n"])
```

## Decorators

Modify function behavior.

```python
def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"Time: {end - start}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
```

## Lambda Functions

Anonymous functions.

```python
add = lambda x, y: x + y
numbers = [1, 2, 3, 4]
doubled = list(map(lambda x: x * 2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
```

## Generators

Memory-efficient iterators.

```python
def count_up_to(n: int):
    count = 1
    while count <= n:
        yield count
        count += 1

for num in count_up_to(5):
    print(num)
```

## Context Managers

Resource management.

```python
class DatabaseConnection:
    def __enter__(self):
        print("Opening connection")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Closing connection")

with DatabaseConnection() as db:
    # Use connection
    pass
```

## Type Hints

Static type checking with mypy.

```python
from typing import Optional, Union, List, Dict

def process(
    data: List[int],
    config: Dict[str, str],
    user: Optional[str] = None
) -> Union[int, str]:
    if user:
        return f"Processed for {user}"
    return sum(data)
```

## Async/Await

Asynchronous programming.

```python
import asyncio

async def fetch_data(url: str) -> str:
    await asyncio.sleep(1)  # Simulate IO
    return f"Data from {url}"

async def main():
    result = await fetch_data("example.com")
    print(result)

asyncio.run(main())
```

## Dataclasses

Simple class definitions.

```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int
    email: str = ""

    def is_adult(self) -> bool:
        return self.age >= 18

user = User(name="John", age=30)
```

## Pattern Matching (3.10+)

Structural pattern matching.

```python
def handle_response(response):
    match response:
        case {"status": 200, "data": data}:
            return data
        case {"status": 404}:
            return "Not found"
        case {"status": code} if code >= 500:
            return "Server error"
        case _:
            return "Unknown response"
```

## Key Rules

1. Use 4 spaces for indentation
2. Follow PEP 8 style guide
3. Use type hints for clarity
4. Prefer list comprehensions over loops
5. Use `with` for file operations

## Common Patterns

**API request:**
```python
import requests

response = requests.get("https://api.example.com/data")
if response.status_code == 200:
    data = response.json()
```

**Environment variables:**
```python
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("API_KEY")
```

**Date/time:**
```python
from datetime import datetime, timedelta

now = datetime.now()
tomorrow = now + timedelta(days=1)
formatted = now.strftime("%Y-%m-%d %H:%M:%S")
```

**JSON handling:**
```python
import json

# Parse
data = json.loads('{"name": "John"}')

# Serialize
json_str = json.dumps({"name": "John"}, indent=2)
```

---

[Official Python Docs →](https://docs.python.org/3/)
