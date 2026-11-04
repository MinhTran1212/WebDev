# JavaScript Practice Exam – Master Study Guide & Cheat Sheet
*ELTE Web Programming – Midterm / Practice Exam Preparation*

---

## Table of Contents
1. [Overview of the 3 Exam Pillars](#overview-of-the-3-exam-pillars)
2. [Task 1: Array Higher-Order Functions & Data Processing](#task-1-array-higher-order-functions--data-processing)
3. [Task 2: Form Inputs, Dynamic Styling & Live DOM Events](#task-2-form-inputs-dynamic-styling--live-dom-events)
4. [Task 3: Dynamic 2D Table Generation & Event Delegation](#task-3-dynamic-2d-table-generation--event-delegation)
5. [Top Common Mistakes & Exam Traps to Avoid](#top-common-mistakes--exam-traps-to-avoid)
6. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## Overview of the 3 Exam Pillars

| Task | Core Focus | Key Concepts & Functions | Points |
| :--- | :--- | :--- | :---: |
| **Task 1: Library Overview** | Pure Data Processing | `filter`, `map`, `flat`/`flatMap`, `some`, `every`, `reduce` | 12 pts |
| **Task 2: Evening Planner** | Forms, Sliders & Direct Events | Forms, `input`/`change`/`click` events, `.dataset`, `.style`, `.classList`, validation | 14 pts |
| **Task 3: Putting Books Back** | Dynamic 2D Grids & Delegation | `createElement`, `table.rows[r].cells[c]`, `appendChild` (moving), `delegate()`, `.closest()` | 14 pts |
| **Total** | | | **40 pts** |

---

## Task 1: Array Higher-Order Functions & Data Processing

Task 1 tests functional programming in JavaScript without using `for` loops.

### 1. The Decision Tree: Which Array Method to Use?
* **"Does at least one element match?"** $\rightarrow$ `.some(item => condition)` (returns `Boolean`)
* **"Do all elements match?"** $\rightarrow$ `.every(item => condition)` (returns `Boolean`)
* **"Get all items that match a condition"** $\rightarrow$ `.filter(item => condition)` (returns a filtered array)
* **"Transform/extract properties from every item"** $\rightarrow$ `.map(item => transformed)` (returns array of same length)
* **"Flatten an array of arrays (e.g. authors' books)"** $\rightarrow$ `.flat()` or `.flatMap(...)`
* **"Calculate a single value (sum, count, max, average)"** $\rightarrow$ `.reduce((acc, curr) => ..., initialValue)`

---

### 2. Concrete Examples from Task 1

#### A. Existential Search (`.some` with nested `.filter`)
> *Is there an author who has at least two books published before 1900?*
```javascript
const authorBefore1900 = authors.some(author => {
  const booksBefore1900 = author.books.filter(book => book.year < 1900);
  return booksBefore1900.length >= 2;
});
```

#### B. Universal Search (`.every` with nested `.some`)
> *Does every author have at least one book in the "novel" genre?*
```javascript
const everyAuthorHasNovel = authors.every(author =>
  author.books.some(book => book.genres.includes('novel'))
);
```

#### C. Flattening Nested Data
> *Collect all books across all authors:*
```javascript
// Method 1: map + flat
const allBooks = authors.map(author => author.books).flat();

// Method 2: flatMap
const allBooks = authors.flatMap(author => author.books);
```

#### D. Summing with `.reduce`
> *Total pages across all books:*
```javascript
const totalPages = allBooks.reduce((sum, book) => sum + book.pages, 0);
```

#### E. Finding Maximum Object with `.reduce`
> *Find the author with the highest total page count:*
```javascript
const getAuthorTotalPages = author =>
  author.books.reduce((sum, b) => sum + b.pages, 0);

const topAuthor = authors.reduce((maxAuthor, currentAuthor) => {
  const maxTotal = getAuthorTotalPages(maxAuthor);
  const currentTotal = getAuthorTotalPages(currentAuthor);
  return currentTotal > maxTotal ? currentAuthor : maxAuthor;
});
// Result: topAuthor.name
```

#### F. Calculating Averages
> *Average page count of books published before 1900 with genre "novel", rounded to 2 decimals:*
```javascript
const filtered = allBooks.filter(book => book.year < 1900 && book.genres.includes('novel'));
const sum = filtered.reduce((total, book) => total + book.pages, 0);
const average = (sum / filtered.length).toFixed(2);
```

---

## Task 2: Form Inputs, Dynamic Styling & Live DOM Events

Task 2 tests user input, form validation, dynamic CSS changes, and UI state locking.

### 1. Form Controls & Event Types
| Element | Event | How to Read Value |
| :--- | :--- | :--- |
| `<input type="text">` | `'input'` or on button `'click'` | `elem.value.trim()` |
| `<input type="range">` | **`'input'`** (continuous live update) | `Number(elem.value)` |
| `<select>` | **`'change'`** | `select.value` (option value) |
| `<select>` option text | `'change'` | `select.selectedOptions[0].textContent.trim()` |
| `<button>` | `'click'` | Trigger action |

---

### 2. Input Validation Patterns
Always validate before modifying the DOM or clearing input:

```javascript
function handleAddWork() {
  // 1. Guard against max capacity
  if (readingList.children.length >= 4) return;

  // 2. Trim whitespace & check non-empty
  const title = workInput.value.trim();
  if (title === '') return;

  // 3. Duplicate check (case-insensitive)
  const exists = Array.from(readingList.children).some(
    li => li.textContent.toLowerCase() === title.toLowerCase()
  );
  if (exists) return; // Keep input content if rejected!

  // 4. Success: Create DOM element, append, update counter, clear input
  const li = document.createElement('li');
  li.textContent = title;
  readingList.appendChild(li);

  workInput.value = '';
  workCount.textContent = readingList.children.length;

  if (readingList.children.length >= 4) {
    addWork.disabled = true;
  }
}
```

---

### 3. Dynamic Styles and CSS Classes
* **Inline styles must always have units (`px`, `%`):**
  ```javascript
  timeBar.style.height = `${min}px`;
  page.style.width = `${speed * 20}px`;
  ```
* **Iterating over `querySelectorAll` (`NodeList`):**
  `document.querySelectorAll('.page')` returns a `NodeList`. You **cannot** do `pages.style.width` or `pages.classList.add()`. You must iterate:
  ```javascript
  pages.forEach(page => {
    page.style.width = `${speed * 20}px`;
    page.classList.toggle('fast', speed >= 4);
  });
  ```
* **Reading `data-*` attributes from `<option>`:**
  ```javascript
  // HTML: <option data-pages="160">
  const pages = Number(edition.selectedOptions[0].dataset.pages);
  ```

---

### 4. Comparison and Disabling Controls
* Compare using the **unrounded** number; display using `.toFixed(2)`:
  ```javascript
  const requiredTime = (pagesToRead / speed) + (titlesCount * 5);
  const fits = Number(minutes.value) >= requiredTime;

  status.textContent = fits
    ? `The program fits! (${requiredTime.toFixed(2)} minutes)`
    : `Not enough time! (${requiredTime.toFixed(2)} minutes)`;

  planner.classList.toggle('ready', fits);

  if (fits) {
    // Disable all inputs
    [minutes, pace, edition, workInput, addWork, check].forEach(el => el.disabled = true);
  }
  ```

---

## Task 3: Dynamic 2D Table Generation & Event Delegation

Task 3 tests building DOM structures from data models, event delegation, and moving elements between parents.

### 1. Generating 2D Grids
Always use nested loops:
```javascript
for (let r = 0; r < library.rows; r++) {
  const tr = document.createElement('tr');
  for (let c = 0; c < library.cols; c++) {
    const td = document.createElement('td');
    tr.appendChild(td);
  }
  table.appendChild(tr);
}
```
**Accessing any cell instantly:**
```javascript
const targetCell = table.rows[rowIndex].cells[colIndex];
```

---

### 2. Creating Embedded Movable Elements
Create the button inside the cell:
```javascript
library.books.forEach(book => {
  const cell = table.rows[book.row].cells[book.col];
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('book');
  btn.textContent = book.title;
  btn.title = `${book.author}: ${book.title}`;
  btn.dataset.author = book.author;
  cell.appendChild(btn);
});
```

---

### 3. Understanding Event Delegation (`delegate`)
Instead of attaching dozens of event listeners, delegate to the parent:
```javascript
delegate(parent, childSelector, eventType, (event, matchedElement) => { ... });
```

#### Why Delegation?
1. Single event listener in memory.
2. Works automatically on elements moved or created dynamically later.

---

### 4. Toggling Selection (At Most One)
```javascript
delegate(table, '.book', 'click', (event, book) => {
  // If book is on a shelf, prevent selection:
  if (book.closest('.shelf')) return;

  const wasSelected = book.classList.contains('selected');

  // Clear any existing selection
  const current = table.querySelector('.book.selected');
  if (current) current.classList.remove('selected');

  // If it was not selected, select it now
  if (!wasSelected) {
    book.classList.add('selected');
  }
});
```

---

### 5. Moving Elements in DOM (`appendChild`)
When an element that already exists in the document is passed to `appendChild`, the browser **moves** it:
```javascript
delegate(table, 'td', 'click', (event, cell) => {
  // Don't trigger move when clicking a book
  if (event.target.classList.contains('book')) return;

  const selectedBook = table.querySelector('.book.selected');
  if (!selectedBook) return;

  if (!cell.classList.contains('shelf')) {
    // Normal cell: move if empty
    if (!cell.querySelector('.book')) {
      cell.appendChild(selectedBook);
      selectedBook.classList.remove('selected');
    }
  } else {
    // Shelf: move only if author matches
    if (selectedBook.dataset.author === cell.dataset.author) {
      cell.appendChild(selectedBook);
      selectedBook.classList.remove('selected');

      // Check win condition
      const totalBooks = table.querySelectorAll('.book').length;
      const shelvedBooks = table.querySelectorAll('.shelf .book').length;
      if (totalBooks === shelvedBooks) {
        status.textContent = 'All books are in place!';
      }
    }
  }
});
```

---

## Top Common Mistakes & Exam Traps to Avoid

1. **`=` vs `===` inside `if` statements:**
   - ❌ `if (title = "")` (assigns empty string to `title` or throws TypeError on `const`!)
   - ✅ `if (title === "")`
2. **Missing units in inline styles:**
   - ❌ `elem.style.height = min;` (ignored by browser!)
   - ✅ `elem.style.height = `${min}px`;`
3. **Calling DOM methods on a `NodeList`:**
   - ❌ `pages.classList.add('fast');` (pages is a list, classList is undefined!)
   - ✅ `pages.forEach(p => p.classList.add('fast'));`
4. **Range slider event type:**
   - ❌ `slider.addEventListener('change', ...)` (only triggers when mouse is released)
   - ✅ `slider.addEventListener('input', ...)` (triggers live while sliding)
5. **Reading `<input>` text:**
   - ❌ `input.textContent` or `input.innerHTML`
   - ✅ `input.value`
6. **Reusing existing variables as function names:**
   - If line 2 is `const addWork = document.querySelector('#add-work');`, writing `function addWork() {}` crashes the script with `Identifier 'addWork' has already been declared`.
7. **Guard checks order:**
   - Empty checks (`if (list.length === 0)`) must happen **before** calculations and early return (`return;`).

---

## Quick Reference Cheat Sheet

```javascript
// DOM Selection
document.querySelector('#id')              // Single element or null
document.querySelectorAll('.class')        // NodeList (use .forEach)

// Attributes & Data
elem.dataset.author                        // Reads data-author="..."
elem.getAttribute('attr') / setAttribute

// Classes
elem.classList.add('active')
elem.classList.remove('active')
elem.classList.toggle('active', condition) // Adds if condition is true, removes if false
elem.classList.contains('active')          // Returns boolean

// Traversing & Hierarchy
elem.closest('.parent-class')              // Finds closest ancestor matching selector
elem.children                              // HTMLCollection of direct children
elem.children.length                       // Direct child count
table.rows[r].cells[c]                     // Cell at row r, column c

// Creation & Movement
const el = document.createElement('div')
parent.appendChild(el)                     // Appends new child or MOVES existing child

// Formatting Numbers
num.toFixed(2)                             // String with 2 decimals (e.g. "85.00")
Number("123") / parseInt("123", 10)
```

