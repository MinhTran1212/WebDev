// A szonda aktuális helyzete / Current position of the probe
let probeRow = 0
let probeCol = 0

// A táblázat adott sorában és oszlopában lévő cella / The cell in the given row and column of the table
function getCell(row, col) {
  return document.querySelector('#sector').rows[row].cells[col]
}

// Az oldal elemei / Elements of the page
const targetInput = document.querySelector('#target-input')
const addTargetButton = document.querySelector('#add-target')
const route = document.querySelector('#route')
const routeCount = document.querySelector('#route-count')
const probeSelect = document.querySelector('#probe-select')
const probeImage = document.querySelector('#probe-image')
const sector = document.querySelector('#sector')
const moveUpButton = document.querySelector('#move-up')
const moveDownButton = document.querySelector('#move-down')
const moveLeftButton = document.querySelector('#move-left')
const moveRightButton = document.querySelector('#move-right')
const missionStatus = document.querySelector('#status')

const cell = sector.rows[probeRow].cells[probeCol];
cell.classList.add("probe");

function addTarget() {
  const name = targetInput.value.trim();

  if (name === "") {
    return
  }

  const li = document.createElement("li");
  li.innerHTML = name;
  route.appendChild(li);
  targetInput.value = "";
  routeCount.innerHTML = route.children.length;

  if (route.children.length === 5) {
    addTargetButton.disabled = true;
  }
}

function changeImage() {
  const option = probeSelect.selectedOptions[0].value;
  probeImage.src = `img/${option}.svg`
}

function move(dRow, dCol) {
  const newRol = probeRow + dRow;
  const newCell = probeCol + dCol;

  if (newRol < 0 || newRol >= 7 || newCell < 0 || newCell >= 7) {
    return
  }

  const asteroid = getCell(newRol, newCell)

  if (asteroid.classList.contains('asteroid')) {
    return
  }

  getCell(probeRow, probeCol).classList.remove("probe");
  probeRow = newRol
  probeCol = newCell
  getCell(newRol, newCell).classList.add("probe")

  // Only check if landing on a planet cell
  if (asteroid.classList.contains('planet')) {
    const planetName = asteroid.dataset.name;
    Array.from(route.children).forEach((li) => {
      if (li.textContent === planetName) { // Exact match, case-sensitive!
        li.classList.add("visited");
      }
    });
  }

  // Only complete if route is NOT empty and all items are visited
  if (route.children.length > 0 && Array.from(route.children).every((li) => li.classList.contains("visited"))) {
    missionStatus.innerHTML = `Mission complete!`;
  }
}

moveRightButton.addEventListener("click", () => move(0, 1));
moveLeftButton.addEventListener("click", () => move(0, -1));
moveUpButton.addEventListener("click", () => move(-1, 0));
moveDownButton.addEventListener("click", () => move(1, 0));
probeSelect.addEventListener("change", changeImage);
addTargetButton.addEventListener("click", addTarget);