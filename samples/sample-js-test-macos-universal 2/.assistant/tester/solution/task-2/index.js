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
function addTitle() {
    if (readingList.children.length >= 4) {
        return;
    }

    const title = workInput.value.trim();

    if (title === "") {
        return;
    }

    //remember li need to be access through innerHTML or textContent 
    const duplicate = Array.from(readingList.children).some(
        title2 => title2.innerHTML.toLowerCase().trim() === title.toLowerCase() //toLowerCase() toUpperCase()
    )

    if (duplicate) {
        return;
    }


    const li = document.createElement("li");
    li.innerHTML = title.trim();
    readingList.appendChild(li)
    workCount.innerHTML = readingList.children.length;
    workInput.value = "";

    if (readingList.children.length >= 4) {
        addWork.disabled = true;
    }
}

//change value as src and so on, not innerHTML
function changeEvent() {
    const value = edition.value;
    const text = edition.selectedOptions[0].textContent.trim();
    cover.src = value;
    cover.alt = text;
}

function minChange() {
    const value = minutes.value;
    minutesValue.innerHTML = value;
    timeBar.style.height = `${value}px`
}

function paceChange(){
    const pacec = pace.value;
    paceValue.innerHTML = pacec;
    pages.forEach(page => page.style.width = `${pacec * 20}px`) 
    pages.forEach(page => {
        if (pacec >= 4){
            page.classList.add("fast");
        } else {
            page.classList.remove("fast");
        }
    })
    

}

function checkClick(){
    if (readingList.children.length === 0){
        status.innerHTML = "Add at least one title first!"
    } else {
        const requiredTime = (edition.selectedOptions[0].dataset.pages / pace.value) + (Number(readingList.children.length) * 5);
        const availableTime = minutes.value;
        const requiredTime2 = requiredTime.toFixed(2)

        if (availableTime >= requiredTime){
            status.innerHTML = `The program fits! (${requiredTime2} minutes)`
            planner.classList.add("ready");
            minutes.disabled = true;
            edition.disabled = true;
            workInput.disabled = true;
            addWork.disabled = true;
            check.disabled = true;
            pace.disabled = true;
        } else {
            status.innerHTML = `Not enough time! (${requiredTime2} minutes)`
        }
    }

}

check.addEventListener("click", checkClick);
pace.addEventListener("input", paceChange);
minutes.addEventListener("input", minChange);
edition.addEventListener("change", changeEvent);
addWork.addEventListener("click", addTitle);
