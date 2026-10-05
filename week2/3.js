const numA = document.querySelector("#a");
const numB = document.querySelector("#b");
const clickButton = document.querySelector("button");
const operator = document.querySelector("select");
const result = document.querySelector("span");


function calculate(){
    const a = parseFloat(numA.value) || 0;
    const b = parseFloat(numB.value) || 0;
    let answer;

    switch (operator.value){
        case "add":
            answer = a + b;
            break;
        case "sub":
            answer = a - b;
            break;
        case "mul":
            answer = a * b;
            break;
        case "div":
            answer = a / b;
            break;
    }

    result.innerHTML = answer;
}

clickButton.addEventListener("click", calculate);