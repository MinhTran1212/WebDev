# JavaScript Data Exercise Tips

This is your quick reminder for the kind of data tasks in this project.

## The big idea

The data is an array of objects like this:

```js
{ title: "Artist - Song", year: 2024, views: 41 }
```

So your job is usually:

1. look through each item
2. apply a condition
3. filter/find/reduce as needed
4. write the result into the page

---

## 1) Choose the right function

### If you need one matching item
Use `find()`.

```js
const item = data.find(song => song.year < 2000)
```

Use it for:
- first match only
- one answer

### If you need many matching items
Use `filter()`.

```js
const matches = data.filter(song => song.views > 100)
```

Use it for:
- all songs over 100 million views
- all songs from 2024
- all titles containing "Love"

### If you need a count
Use `filter()` and then `.length`.

```js
const count = data.filter(song => song.title.includes("Love")).length
```

### If you need a total
Use `reduce()`.

```js
const totalViews = data.reduce((sum, song) => sum + song.views, 0)
```

### If you need an average
Use `filter()` + `reduce()` + divide.

```js
const filtered = data.filter(song => song.year === 2024)
const average = filtered.reduce((sum, song) => sum + song.views, 0) / filtered.length
const rounded = average.toFixed(2)
```

### If you need to check text
Use `includes()`.

```js
song.title.includes("Love")
```

### If you need to split a title
Use `split("-")`.

```js
const parts = song.title.split("-")
```

This helps when you need:
- text before the dash
- text after the dash

### If you need to sort values
Use `sort()`.

```js
data.sort((a, b) => b.views - a.views)
```

---

## 2) The most common patterns

### Pattern A: one result

```js
const result = data.find(item => item.year < 2000)
console.log(result.title)
```

### Pattern B: many results

```js
const results = data.filter(item => item.views > 100)
console.log(results.length)
```

### Pattern C: count matches

```js
const count = data.filter(item => item.title.includes("Love")).length
```

### Pattern D: average a group

```js
const filtered = data.filter(item => item.year === 2024)
const average = filtered.reduce((sum, item) => sum + item.views, 0) / filtered.length
```

### Pattern E: display on the page

```js
const taskA = document.querySelector('#taskA')
taskA.textContent = result.title
```

---

## 3) Quick decision guide

- One item only? → `find()`
- Many matching items? → `filter()`
- Need a number of matches? → `filter().length`
- Need a total? → `reduce()`
- Need an average? → `filter()` + `reduce()` + divide
- Need text check? → `includes()`
- Need title split? → `split("-")`
- Need sorting? → `sort()`

---

## 4) A simple reminder sentence

When you get stuck, ask:

> What kind of answer do I need: one item, many items, a count, a total, or an average?

That usually tells you which JavaScript function to use.

---

## 5) Example phrases to remember

- “Find the first item matching this rule” → `find()`
- “Get all items matching this rule” → `filter()`
- “How many match?” → `filter().length`
- “Add all values together” → `reduce()`
- “Check if text contains X” → `includes()`
- “Split the title around the dash” → `split("-")`
- “Show the answer on the page” → `.textContent`

This file is meant to help you review without giving away the exact task solutions.
