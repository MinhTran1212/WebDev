const workInput = document.querySelector('#work-input');
const addWork = document.querySelector('#add-work');
const readingList = document.querySelector('#reading-list');
const workCount = document.querySelector('#work-count');
const edition = document.querySelector('#edition');
const cover = document.querySelector('#cover');
const minutes = document.querySelector('#minutes');
const pace = document.querySelector('#pace');
const minutesValue = document.querySelector('#minutes-value');
const paceValue = document.querySelector('#pace-value');
const timeBar = document.querySelector('#time-bar');
const pages = document.querySelectorAll('.page');
const planner = document.querySelector('#planner');
const check = document.querySelector('#check');
const status = document.querySelector('#status');

// Ide írd a megoldásodat! / Write your solution here!

function addWork1() {
    if (Number(workCount.innerHTML) > 3) {
        addWork.disabled = true;
        return
    }
    const title = workInput.value.trim();

    if (title === '') {
        return;
    }

    const alreadyExists = Array.from(readingList.children).some(
        (li) => li.innerHTML.toLowerCase() === title.toLowerCase()
    );

    if (alreadyExists) {
        return;
    }

    const li = document.createElement('li');
    li.innerHTML = title;
    readingList.appendChild(li);

    workInput.value = '';
    workCount.innerHTML = readingList.children.length;

    if (readingList.children.length >= 4) {
        addWork.disabled = true;
    }
}

addWork.addEventListener('click', addWork1);

workCount.innerHTML = Array.from(readingList.children).length;

function changePic() {
    const current = edition.value;
    const text = edition.selectedOptions[0].textContent.trim();
    cover.src = current;
    cover.alt = text;
}

edition.addEventListener('change', changePic);

function changeMinute() {
    const min = minutes.value;
    minutesValue.innerHTML = min;
    timeBar.style.height = `${min}px`;

}

minutes.addEventListener('input', changeMinute);

function changePace() {
    const pace1 = pace.value;
    paceValue.innerHTML = pace1;
    pages.forEach(page => {
        page.style.width = `${pace1 * 20}px`
        if (pace1 >= 4) {
            page.classList.add('fast');
        } else {
            page.classList.remove('fast');
        }
    });
}

pace.addEventListener('input', changePace);

//`required time = selected book's page count / reading speed + number of titles * 5`
function checking() {
    if (readingList.children.length === 0) {
        status.textContent = "Add at least one title first!";
        return
    }
    const pagesToRead = edition.selectedOptions[0].dataset.pages;
    const readSpeed = Number(pace.value);
    const numberTitles = readingList.children.length;

    const requiredTime = (pagesToRead / readSpeed) + (numberTitles * 5);
    const availableTime = Number(minutes.value);

    const formatedTime = requiredTime.toFixed(2);

    if (availableTime >= requiredTime) {
        planner.classList.add('ready');
        status.textContent = `The program fits! (${formatedTime} minutes)`;
        minutes.disabled = true;
        pace.disabled = true;
        edition.disabled = true;
        workInput.disabled = true;
        addWork.disabled = true;
        check.disabled = true;
    } else {
        planner.classList.remove('ready');
        status.textContent = `Not enough time! (${formatedTime} minutes)`;
    }


}

check.addEventListener('click', checking);

//<input type="text">	elem.value	workInput.value.trim()
//<input type="range">	Number(elem.value)	Number(minutes.value)
//<select>	            elem.value (gives chosen <option value="...">)	edition.value
//<select>text	        elem.selectedOptions[0].textContent.trim()	Selected label text
//Custom HTML data-*	elem.dataset.<name>	option.dataset.pages

// click / change / input

//Creating elements in memory: document.createElement('li')
//Injecting text safely: li.textContent = title (or li.innerHTML)
//Appending to a parent: readingList.appendChild(li)
//Inspecting children:
//Count of children: readingList.children.length
//Array iteration over children: Array.from(readingList.children).some(...)

//Handling whitespace: value.trim() cleans extra spaces and makes "   " turn into "".
//Case-insensitive duplicate checking:
//Array.from(list.children).some(li => li.textContent.toLowerCase() === title.toLowerCase())


//Inline dynamic CSS: Must include units! timeBar.style.height =${min}px; page.style.width =${speed * 20}px;
//Toggling CSS classes: page.classList.add('fast') / page.classList.remove('fast') Or in one line: page.classList.toggle('fast', speed >= 4)
//Working with NodeList vs Single Element: document.querySelector 
//→ 1 element (direct .classList access).
//document.querySelectorAll → NodeList (must loop with .forEach(item => ...)).

//Disabling form controls: button.disabled = true; or input.disabled = true;