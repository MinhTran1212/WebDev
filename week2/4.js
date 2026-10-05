const changeR = document.querySelector("#r");
const changeG = document.querySelector("#g");
const changeB = document.querySelector("#b");
//const body = document.querySelector("body");
//document.body

function changeColor(){
	const red = changeR.value;
	const green = changeG.value;
	const blue = changeB.value;

	document.body.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
}

changeR.addEventListener("input", changeColor);
changeG.addEventListener("input", changeColor);
changeB.addEventListener("input", changeColor);

