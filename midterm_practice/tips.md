# Web Programming (JavaScript) Midterm Cheat Sheet & Tips 🚀

A comprehensive reference for common JavaScript functions, patterns, and traps that appear on ELTE Web Programming exams.

---

## Table of Contents
1. [Array Methods (The Core of Part 1)](#1-array-methods)
2. [Array Sorting (Critical for Tables)](#2-array-sorting)
3. [Strings & Text Manipulation](#3-strings--text-manipulation)
4. [Numbers & Math Operations](#4-numbers--math-operations)
5. [DOM Selection & Traversal](#5-dom-selection--traversal)
6. [DOM Manipulation (Content, Styles, Classes)](#6-dom-manipulation)
7. [Events & Event Delegation (Critical for Part 2 & 3)](#7-events--event-delegation)
8. [Timers (`setInterval` & `setTimeout`)](#8-timers)
9. [Forms, Inputs & Radio Buttons](#9-forms-inputs--radio-buttons)
10. [Top 5 Traps & Pitfalls in Exams](#10-top-5-traps--pitfalls-in-exams)

---

## 1. Array Methods

Assume we have:
```javascript
const songs = [
  { id: 1, title: "ABBA - Waterloo", year: 1974, views: 3.2 },
  { id: 2, title: "Loreen - Euphoria", year: 2012, views: 69.0 },
  { id: 3, title: "Slimane - Mon Amour", year: 2024, views: 26.0 }
];
```

| Method | What it returns | When to use | Example |
| :--- | :--- | :--- | :--- |
| **`find(fn)`** | The **first matching element** (or `undefined`) | When you need 1 item that matches a rule | `songs.find(s => s.year < 2000)` |
| **`findIndex(fn)`**| The **index** of the first match (or `-1`) | When you need the position or index to remove/update | `songs.findIndex(s => s.id === 2)` |
| **`filter(fn)`** | A **new array** of all matching items | When you need a subset of items | `songs.filter(s => s.views > 50)` |
| **`map(fn)`** | A **new array** of transformed items | Extracting a property or creating HTML tags | `songs.map(s => s.title)` |
| **`some(fn)`** | `true` or `false` | Is **at least one** item matching? | `songs.some(s => s.year === 2024)` |
| **`every(fn)`** | `true` or `false` | Do **ALL** items match the condition? | `songs.every(s => s.views > 0)` |
| **`includes(val)`**| `true` or `false` | Does array contain a primitive value? | `[1, 2, 3].includes(2)` (true) |
| **`reduce(fn, init)`** | A **single accumulated value** | Summing, calculating totals or averages | `songs.reduce((acc, s) => acc + s.views, 0)` |

### Common Aggregations with `reduce`:
```javascript
// Summing views:
const totalViews = songs.reduce((sum, song) => sum + song.views, 0);

// Finding Maximum:
const maxViews = songs.reduce((max, song) => song.views > max ? song.views : max, 0);

// Counting occurrences by category:
const countByYear = songs.reduce((acc, song) => {
    acc[song.year] = (acc[song.year] || 0) + 1;
    return acc;
}, {});
```

---

## 2. Array Sorting

> ⚠️ **Warning:** `.sort()` modifies the original array in place! To keep the original array unchanged, make a copy first: `[...data].sort(...)`.

### Numeric Sorting
- **Ascending (smallest to largest):**
  ```javascript
  songs.sort((a, b) => a.views - b.views);
  ```
- **Descending (largest to smallest):**
  ```javascript
  songs.sort((a, b) => b.views - a.views);
  ```

### Alphabetical (String) Sorting
- **A to Z (Ascending):**
  ```javascript
  songs.sort((a, b) => a.title.localeCompare(b.title));
  ```
- **Z to A (Descending):**
  ```javascript
  songs.sort((a, b) => b.title.localeCompare(a.title));
  ```

---

## 3. Strings & Text Manipulation

| Method | What it does | Example |
| :--- | :--- | :--- |
| **`split(separator)`** | Splits a string into an array | `"ABBA - Waterloo".split("-")` $\rightarrow$ `["ABBA ", " Waterloo"]` |
| **`trim()`** | Removes whitespace from edges | `"  hello  ".trim()` $\rightarrow$ `"hello"` |
| **`includes(text)`** | Case-sensitive search (`true`/`false`) | `"Waterloo".includes("loo")` $\rightarrow$ `true` |
| **`toLowerCase()`** | Converts to lowercase (useful for case-insensitive search) | `title.toLowerCase().includes("love")` |
| **`toUpperCase()`** | Converts to uppercase | `"abc".toUpperCase()` $\rightarrow$ `"ABC"` |
| **`startsWith(text)`**| Checks if string begins with prefix | `"https://...".startsWith("https")` |
| **`endsWith(text)`** | Checks if string ends with suffix | `"file.png".endsWith(".png")` |
| **`slice(start, end)`**| Extracts a substring | `"Eurovision".slice(0, 4)` $\rightarrow$ `"Euro"` |
| **`replace(old, new)`**| Replaces the first occurrence | `"foo-bar".replace("-", " ")` |
| **`replaceAll(old, new)`**| Replaces all occurrences | `"a-b-c".replaceAll("-", " ")` |

### Testing with Regular Expressions:
- Does string contain any digit? $\rightarrow$ `/\d/.test(str)`
- Does string contain only letters? $\rightarrow$ `/^[a-zA-Z]+$/.test(str)`
- Case-insensitive test: $\rightarrow$ `/love/i.test(str)`

---

## 4. Numbers & Math Operations

### Converting Strings to Numbers
```javascript
Number("42.5")       // 42.5
parseInt("42px", 10) // 42 (stops at non-digit)
parseFloat("42.5px") // 42.5
+"42.5"              // 42.5 (unary plus shortcut)
```

### Rounding & Formatting
```javascript
num.toFixed(2)           // "25.66" (Returns a STRING! Ideal for innerHTML display)
Math.round(25.66)        // 26 (round to nearest integer)
Math.floor(25.66)        // 25 (round down)
Math.ceil(25.01)         // 26 (round up)
Math.max(10, 20, 5)      // 20
Math.min(10, 20, 5)      // 5
```

### Random Integers
Generate random integer between `min` and `max` (inclusive):
```javascript
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

---

## 5. DOM Selection & Traversal

### Selection
```javascript
// Single element (returns first match or null):
const taskA = document.querySelector("#taskA");
const table = document.querySelector("table");

// Multiple elements (returns a NodeList):
const rows = document.querySelectorAll("tr");

// Convert NodeList to regular Array to use map/filter/find:
const rowsArray = [...document.querySelectorAll("tr")];
// or: Array.from(document.querySelectorAll("tr"))
```

### Traversal (Moving around the DOM tree)
```javascript
element.parentElement          // Parent node
element.children               // Array-like list of child elements
element.firstElementChild      // First child element
element.lastElementChild       // Last child element
element.nextElementSibling     // Next sibling element

// ⭐ MOST IMPORTANT FOR EXAMS: .closest()
// Finds closest ancestor matching selector (great for clicks inside <td>)
const tr = event.target.closest("tr");
```

---

## 6. DOM Manipulation

### Content
```javascript
element.innerHTML = "<b>Bold</b>";   // Parses HTML tags
element.textContent = "Plain text";  // Treats everything as raw text
input.value = "New value";           // For <input>, <textarea>, <select>
```

### CSS Classes
```javascript
element.classList.add("selected");       // Add class
element.classList.remove("selected");    // Remove class
element.classList.toggle("selected");    // Toggle on/off
element.classList.contains("selected");  // true/false
```

### Inline Styles
*(Use camelCase for CSS properties with hyphens)*
```javascript
element.style.backgroundColor = "red";
element.style.top = `${y}px`;
element.style.left = `${x}px`;
element.style.display = "none";          // Hide
element.style.display = "";              // Show (restore default)
```

### Dynamic Element Creation
```javascript
const li = document.createElement("li");
li.textContent = "New Song";
li.classList.add("item");
ul.appendChild(li); // Appends to list
```

---

## 7. Events & Event Delegation

### Standard Event Listener
```javascript
button.addEventListener("click", (e) => {
    // e is the Event object
});
```

### Important Event Properties
- `e.target`: The **exact element** clicked (e.g., could be a `<td>`, `<span>`, or `<i>`).
- `e.currentTarget`: The element the listener is attached to (e.g., the `<table>`).
- `e.offsetX`, `e.offsetY`: Click coordinates **relative to the element** (Task 3 Christmas tree coordinates!).
- `e.clientX`, `e.clientY`: Click coordinates relative to the browser window.
- `e.preventDefault()`: Prevents default browser action (e.g. form submission or link jump).
- `e.stopPropagation()`: Stops event bubbling up to parent elements.

### ⭐ Event Delegation (Crucial for Tables & Lists)
Instead of adding 100 listeners to every `<tr>`, add **ONE** listener to `<table>` or `<tbody>`:
```javascript
const table = document.querySelector("#video-table");

table.addEventListener("click", (e) => {
    // Find which table row was clicked
    const row = e.target.closest("tr");
    
    // Ignore if click was outside a row or on the table header
    if (!row || row.parentElement.tagName === "THEAD") return;

    // Toggle selected class
    row.classList.toggle("selected");
});
```

---

## 8. Timers

### `setInterval` (Repeating Timer)
Repeats every $N$ milliseconds ($1000\text{ ms} = 1\text{ s}$):
```javascript
let timerId = null;

function startTimer() {
    timerId = setInterval(() => {
        // Runs every 1 second
        changeColors();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerId);
    timerId = null;
}
```

### `setTimeout` (One-Time Delay)
Runs once after $N$ milliseconds:
```javascript
setTimeout(() => {
    console.log("Executed after 2 seconds");
}, 2000);
```

---

## 9. Forms, Inputs & Radio Buttons

### Text / Number Inputs
```javascript
const amountInput = document.querySelector("#amount");
const value = Number(amountInput.value); // Convert string to number!
```

### Checkboxes
```javascript
const checkbox = document.querySelector("#my-check");
console.log(checkbox.checked); // true or false
```

### Radio Button Groups
```javascript
// Get currently selected radio value:
const selectedRadio = document.querySelector('input[name="color"]:checked');
const color = selectedRadio ? selectedRadio.value : null;

// Select the next radio item cyclically:
const radios = [...document.querySelectorAll('input[name="color"]')];
const currentIndex = radios.findIndex(r => r.checked);
const nextIndex = (currentIndex + 1) % radios.length; // Wraps around to 0 at the end!
radios[nextIndex].checked = true;
```

---

## 10. Top 5 Traps & Pitfalls in Exams ⚠️

1. **`input.value` is ALWAYS a string!**
   ```javascript
   amount.value + 5     // If amount.value is "10" -> "105" (BUG!)
   Number(amount.value) + 5 // -> 15 (Correct)
   ```

2. **`.toFixed()` returns a string!**
   - Fine for `innerHTML = avg.toFixed(2)`
   - Never do math with it: `avg.toFixed(2) + 1` is string concatenation!

3. **NodeLists are not Arrays!**
   - `document.querySelectorAll('tr').filter(...)` throws an error!
   - Convert first: `[...document.querySelectorAll('tr')].filter(...)`

4. **Arrow Function Return with `{}`**
   - One line: `data.find(v => v.year < 2000)` (Implicit return)
   - Multiple lines:
     ```javascript
     data.find(v => {
         return v.year < 2000; // Must have 'return'!
     })
     ```

5. **Circular indexing with modulo `%`**
   - To cycle through array elements: `(index + 1) % array.length`
   - Example: if length is 4: `0 -> 1 -> 2 -> 3 -> 0 -> 1...`
