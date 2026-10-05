const matrix = [
    [4,6,7,8],
    [10,15,20,25],
    [1,2,3,4]
]


// Task 1: when the page loads, display the matrix as a table

// Task 2: using event delegation (adding 1 event listener)
// double the number in the cell that is clicked 

const table = document.querySelector("table");
table.innerHTML = matrix
  .map(row => `<tr>${row.map(num => `<td>${num}</td>`).join('')}</tr>`).join('');

function handleClick(e){
    if (e.target.matches("td")){
        e.target.innerText = Number(e.target.innerText) * 2;
    }
}

table.addEventListener("click", handleClick);

// Task 3: When moving mouse over a row, change the background color of that row


// code from lecture 3, slide 43

function delegate(parent, type, selector, handle){
    parent.addEventListener(type, function (event){
        const targetElement = event.target.closest(selector);

        if (this.contains(targetElement)){
            handler.call(targetElement, event);
        }
    });
}

