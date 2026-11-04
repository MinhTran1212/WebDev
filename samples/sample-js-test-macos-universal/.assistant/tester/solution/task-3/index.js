// Delegált eseménykezelés
function delegate(parent, child, when, what) {
  function eventHandlerFunction(event) {
    const eventTarget = event.target;
    const eventHandler = this;
    const closestChild = eventTarget.closest(child);

    if (eventHandler.contains(closestChild)) {
      what(event, closestChild);
    }
  }

  parent.addEventListener(when, eventHandlerFunction);
}

// Ide írd a megoldásodat! / Write your solution here!ff
const status = document.querySelector('#status');
const table = document.querySelector('#map') //# for id selector

for (let i = 0; i < library.rows; i++) {
  const tr = document.createElement('tr');
  for (let j = 0; j < library.cols; j++) {
    const td = document.createElement('td');
    tr.appendChild(td);
  }
  table.appendChild(tr);
}
//creating tables done use nested loop

//access to the direct cell
library.shelves.forEach(shelve => {
  const cell = table.rows[shelve.row].cells[shelve.col]
  cell.classList.add('shelf');
  cell.dataset.author = shelve.author;
})

//putting element inside a cell
library.books.forEach(book => {
  const cell = table.rows[book.row].cells[book.col]
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('book');
  btn.textContent = book.title;
  btn.title = `${book.author}: ${book.title}`;
  btn.dataset.author = book.author
  cell.appendChild(btn);
})

delegate(table, '.book', 'click', (event, book) => {
  if (book.closest('.shelf')) {
    return;
  }

  const selectedBook = book.classList.contains('selected');

  const currentSelecting = document.querySelector('.book.selected');
  if (currentSelecting) {
    currentSelecting.classList.remove('selected');
  }

  if (!selectedBook) {
    book.classList.add('selected');
  }

});

delegate(table, 'td', 'click', (event, cell) => {
  if (event.target.classList.contains('book')) {
    return;
  }

  const selectedBook = document.querySelector('.book.selected');
  if (!selectedBook) {
    return;
  }

  if (!cell.classList.contains('shelf')) {
    if (!cell.querySelector('.book')) {
      cell.appendChild(selectedBook);
      selectedBook.classList.remove('selected');
    }
  } else {
    if (selectedBook.dataset.author === cell.dataset.author) {
      cell.appendChild(selectedBook);
      selectedBook.classList.remove('selected');
      const allBooksCount = table.querySelectorAll('.book').length;
      const shelvedBooksCount = table.querySelectorAll('.shelf .book').length;
      if (allBooksCount === shelvedBooksCount) {
        status.textContent = 'All books are in place!';
      }
    } else {
      return
    }
  }


})
