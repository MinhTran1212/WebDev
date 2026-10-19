const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "Cyan";
ctx.fillRect(20, 60, 100, 50);

ctx.strokeStyle = "blue";
ctx.lineWidth = 4;
ctx.strokeRect(40, 80, 100, 50);

ctx.font = "80px Arial"
ctx.fillText("Dmm", 200, 200);
ctx.strokeText("Hello", 200, 250)

ctx.beginPath();
ctx.moveTo(250, 10);
ctx.lineTo(350, 80);
ctx.lineTo(230, 130);
ctx.lineTo(250, 10);
ctx.fill();