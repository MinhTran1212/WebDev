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

// Ide írd a megoldásodat! / Write your solution here!
const status1 = document.querySelector("#status")
const table = document.querySelector("#map");
for (let i = 0; i < library.rows; i++){
  const tr = document.createElement("tr")
  for (let j = 0; j < library.cols; j++){
    const td = document.createElement("td");
    tr.appendChild(td)
  }
  table.appendChild(tr);
}

library.shelves.forEach(shelve => {
  const cell = table.rows[shelve.row].cells[shelve.col]
  cell.classList.add("shelf");
  cell.dataset.author = shelve.author;
});

library.books.forEach(book => {
  const cell = table.rows[book.row].cells[book.col]

  const button1 = document.createElement("button");
  button1.classList.add("book");
  button1.type = 'button';
  button1.textContent = `${book.title}`;
  button1.title = `${book.author}: ${book.title}`;
  button1.dataset.author = `${book.author}`
  cell.appendChild(button1)
  
});

delegate(table, '.book', 'click', (event, book) => {
  if (book.closest('.shelf')){
    return;
  }

  const selectedBook = book.classList.contains('selected');

  const currentSelected = document.querySelector(".book.selected");
  if (currentSelected){
    currentSelected.classList.remove("selected");
  }

  if (!selectedBook) {
    book.classList.add('selected');
  }
});

delegate(table, 'td', 'click', (event, cell) => {
  const selectedBook = document.querySelector(".book.selected");
  if (!selectedBook){
    return;
  }

  if (!cell.classList.contains("shelf")){
    if (!cell.querySelector(".book")){
      cell.appendChild(selectedBook);
      selectedBook.classList.remove("selected");
    }
  } else {
    if (selectedBook.dataset.author === cell.dataset.author){
      cell.appendChild(selectedBook);
      selectedBook.classList.remove("selected");
      const allBooksCount = table.querySelectorAll('.book').length;
      const shelvedBooksCount = table.querySelectorAll('.shelf .book').length;
      if (allBooksCount === shelvedBooksCount) {
        status1.textContent = 'All books are in place!';
      } else {
        return
      }
    }
  }
});





