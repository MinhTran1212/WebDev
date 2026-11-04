const taskA = document.querySelector('#taskA')
const taskB = document.querySelector('#taskB')
const taskC = document.querySelector('#taskC')
const taskD = document.querySelector('#taskD')
const taskE = document.querySelector('#taskE')
const taskF = document.querySelector('#taskF')
const taskG = document.querySelector('#taskG')
const taskH = document.querySelector('#taskH')
const taskI = document.querySelector('#taskI')
const taskJ = document.querySelector('#taskJ')
const taskK = document.querySelector('#taskK')
const taskL = document.querySelector('#taskL')

const before2000 = data.find(video => video.year < 2000);
taskA.innerHTML = before2000.title;

const more1MilView = data.filter(video => video.views > 100);
taskB.innerHTML = more1MilView.map(item => item.title).join(", ");

const countLove = data.filter(video => video.title.includes("Love"));
taskC.innerHTML = countLove.length;

const video2024 = data.filter(video => video.year === 2024);
const avg2024view = video2024.reduce((total, video) => total + video.views, 0);
taskD.innerHTML = (avg2024view / video2024.length).toFixed(2);

const hasSongWithDigit = data.some(video => {
    const songTitle = video.title.split('-')[1];

    return (songTitle.includes("1") ||
        songTitle.includes("2") ||
        songTitle.includes("3") ||
        songTitle.includes("4") ||
        songTitle.includes("5") ||
        songTitle.includes("6") ||
        songTitle.includes("7") ||
        songTitle.includes("8") ||
        songTitle.includes("9") ||
        songTitle.includes("0"))
});

if (hasSongWithDigit === true) {
    taskE.innerHTML = "Yes"
} else {
    taskE.innerHTML = "No"
}


// ============================================================
// 1. NON-MUTATING FUNCTIONS (Safe! Original array stays untouched)
// ============================================================

// Task F (findIndex):
// Write into taskF the index of the first video that has more than 200 million views!
const find200MilVid = data.findIndex(video => video.views > 200);
taskF.innerHTML = find200MilVid;

// Task G (every):
// Write into taskG whether EVERY video in data has at least 0 views (views >= 0). Result can be true/false.
const atleast0Views = data.every(video => {
    return video.views >= 0;
})

if (atleast0Views === true) {
    taskG.innerHTML = "Yes"
} else {
    taskG.innerHTML = "No"
}

// Task H (slice):
// Into taskH: Get the first 3 videos from data (without modifying data) and display their titles.
const firstThree = data.slice(0, 3);
taskH.innerHTML = firstThree.map(video => video.title).join(", ");

// Task I (forEach):
// Into taskI: Use .forEach() to build an HTML list (<ul><li>...</li></ul>) of the first 4 video titles with their year.
const firstFour = data.slice(0, 4);
let listHtml = "<ul>";
firstFour.forEach(video => {
    listHtml += `<li>${video.title} (${video.year})</li>`
})
listHtml += "</ul>"
taskI.innerHTML = listHtml;


// ============================================================
// 2. MUTATING FUNCTIONS (Modifies array in-place!)
// Rule of thumb: Make a copy with [...data] before calling mutating methods!
// ============================================================

// Task J (sort):
// Into taskJ: Sort a copy of data by views in descending order (highest views first), and display the top 3 titles!
const copy = [...data];
const sortData = copy.sort((a, b) => b.views - a.views);
taskJ.innerHTML = sortData.slice(0, 3).map(video => video.title).join(", ");


// Task K (reverse):
// Into taskK: Take the first 5 titles and reverse their order using .reverse()!
const copy2 = [...data];
const reverseData = copy.slice(0, 5).reverse();
taskK.innerHTML = reverseData.map(video => video.title).join(", ");


// Task L (splice):
// Into taskL: Make a copy of data. At index 1, use .splice() to remove 1 video and insert a replacement in its place!
const copy3 = [...data];
const deleted = copy3.splice(1, 1, { title: "REPLACEMENT SONG - Brand New", views: 50 });
taskL.innerHTML = `Deleted: "${deleted[0].title}" ➔ Replaced with: "${copy3[1].title}"`;


