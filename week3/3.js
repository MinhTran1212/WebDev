const clickButton = document.querySelector("button");
const num = document.querySelector("input");
const table = document.querySelector("table");

function calculate() {
    const n = parseInt(num.value) || 0;
    if (n < 1) {
        table.innerHTML = "";
        return;
    }
    const matrix = [];
    for (let i = 1; i <= n; i++) {
        const row = [];
        for (let j = 1; j <= n; j++) {
            row.push(i * j);
        }
        matrix.push(row);
    }
    console.log(matrix);
    table.innerHTML = matrix
      .map(row => `<tr>${row.map(val => `<td>${val}</td>`).join('')}</tr>`)
      .join('');
}

clickButton.addEventListener("click", calculate);
