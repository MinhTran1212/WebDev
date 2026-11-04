// Magyar nevekhez az index.html-ben dataEN.js helyett data.js-t tölts be!
// For Hungarian names, load data.js instead of dataEN.js in index.html.

// Delegált eseménykezelés (az előadásból) / Delegated event handling (from the lecture)
function delegate(parent, type, selector, handler) {
  parent.addEventListener(type, function (event) {
    const targetElement = event.target.closest(selector);

    if (this.contains(targetElement)) {
      handler.call(targetElement, event);
    }
  });
}

// Távolság: millió km → pixel / Distance: million km → pixels
function distanceToPx(distance) {
  return Math.round(Math.sqrt(distance) * 7);
}

// Átmérő: km → pixel / Diameter: km → pixels
function diameterToPx(diameter) {
  return Math.round(Math.sqrt(diameter) / 12) + 5;
}

// Az oldal elemei / Elements of the page
const inputFields = document.querySelector("#input-fields");
const planetsDiv = document.querySelector("#planets");

// Ide írd a megoldásodat! / Write your solution here!
planets.forEach((planet, index) => {
  const div1 = document.createElement("div");
  div1.classList.add("planet-control")
  const h3 = document.createElement("h3");
  const select = document.createElement("select");
  const option1 = document.createElement("option");
  const option2 = document.createElement("option");
  const option3 = document.createElement("option");

  option1.type = "option";
  option2.type = "option";
  option3.type = "option";

  option1.value = 0;
  option2.value = 1;
  option3.value = 2;

  option1.textContent = "rocky planet";
  option2.textContent = "gas giant";
  option3.textContent = "ice giant";

  select.type = "select";
  select.classList.add("planet-color")
  select.dataset.index = index;

  select.appendChild(option1);
  select.appendChild(option2);
  select.appendChild(option3);

  if (planet.type === "rocky planet") {
    select.value = "0"
  } else if (planet.type === "gas giant") {
    select.value = "1"
  } else {
    select.value = "2"
  }

  h3.innerHTML = planet.name;
  div.appendChild(select)

  div1.appendChild(h3)
  div1.classList.add("planet-control")

  inputFields.appendChild(div1)

  const slider = document.createElement("input");
  slider.classList.add("planet-orbit")
  slider.type = "range"
  slider.dataset.index = index;
  slider.min = 0;
  slider.max = 500;
  slider.value = distanceToPx(planet.distanceFromSun);
  div1.appendChild(slider);

  const checkBox = document.createElement("input");
  checkBox.type = "checkBox";
  checkBox.classList.add("planet-rings");
  checkBox.dataset.index = index;
  if (planet.hasRings === true) {
    checkBox.checked = true;
  }

  const label = document.createElement("label");
  label.textContent = "Gyűrűk / Rings";
  label.appendChild(checkBox);
  div1.appendChild(label);

})

planets.forEach((planet, index) => {
  let typeIndex = 0;
  if (planet.type === "gas giant") typeIndex = 1;
  else if (planet.type === "ice giant") typeIndex = 2;
  const span1 = document.createElement("span");
  span1.classList.add("planet")
  span1.classList.add(`type-${typeIndex}`);
  if (planet.hasRings) {
    span1.classList.add('rings')
  }
  span1.dataset.index = index;
  span1.title = planet.name;

  const left1 = distanceToPx(planet.distanceFromSun);
  const width1 = diameterToPx(planet.diameter);
  span1.style.left = `${left1}px`
  span1.style.width = `${width1}px`
  span1.style.height = `${width1}px`

  planetsDiv.appendChild(span1)
});

delegate(inputFields, 'input', '.planet-orbit', function (event) {
  const planetSpan = planetsDiv.querySelector(`[data-index="${this.dataset.index}"]`)
  planetSpan.style.left = `${this.value}px`
})

delegate(inputFields, 'change', '.planet-color', function (event) {
  const planetSelect = planetsDiv.querySelector(`[data-index="${this.dataset.index}"]`)
  planetSelect.classList.remove('type-0', 'type-1', 'type-2');
  planetSelect.classList.add(`type-${this.value}`);
});

delegate(inputFields, 'change', '.planet-rings', function (event) {
  const planetSpan = planetsDiv.querySelector(`[data-index="${this.dataset.index}"]`)

  if (this.checked) {
    planetSpan.classList.add('rings')
  } else {
    planetSpan.classList.remove('rings')
  }
})
