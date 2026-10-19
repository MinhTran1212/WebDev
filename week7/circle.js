const canvas = document.querySelector("#scene");
const context = canvas.getContext("2d");
document.body.style.margin = "0";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rectangle = {
	x: 2,
	y: canvas.height * 0.1,
	width: canvas.width / 2,
	height: canvas.height - canvas.height * 0.1,
};

const circle = {
	x: rectangle.x + 50,
	y: rectangle.y + 45,
	radius: 40,
	velocityY: 0,
};

	const framesPerSecond = 60;
	const frameDuration = 1000 / framesPerSecond;
	const gravity = 0.45;
	const bounceDamping = 0.8;
	const floor = rectangle.y + rectangle.height - circle.radius;
	let lastFrameTime = 0;

function animate(timestamp) {
	if (timestamp - lastFrameTime >= frameDuration) {
		lastFrameTime = timestamp - ((timestamp - lastFrameTime) % frameDuration);

		circle.velocityY += gravity;
		circle.y += circle.velocityY;

		if (circle.y >= floor) {
			circle.y = floor;
			circle.velocityY = -circle.velocityY * bounceDamping;

			if (Math.abs(circle.velocityY) < 1) {
				circle.velocityY = 0;
			}
		}

	context.clearRect(0, 0, canvas.width, canvas.height);

	context.strokeStyle = "black";
	context.lineWidth = 2;
	context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

	context.beginPath();
	context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
	context.fillStyle = "red";
	context.fill();

		if (circle.velocityY !== 0 || circle.y < floor) {
			requestAnimationFrame(animate);
		}
		return;
	}

	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
