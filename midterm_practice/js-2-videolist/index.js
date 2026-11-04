const videoTable = document.querySelector('#video-table')
const videoTableBody = document.querySelector('#video-table tbody')
const viewInput = document.querySelector('#amount')
const btnAdd = document.querySelector('#btn-add')
const btnSub = document.querySelector('#btn-sub')
const sumSpan = document.querySelector('#sum')

//Turn array into HTML
// a) show all videos
for (const video of data) {
    video.selected = false;
}

function generateTableBody() {
    videoTableBody.innerHTML = data.map(video => `
        <tr class="${video.selected ? "selected" : ""}">
            <td>${video.year}</td>
            <td>${video.title}</td>
            <td>${video.views} million</td>
        </tr>
    `).join('')
}

// b) 
function toggleSelected(e) {
    const row = e.target.closest('tr')
    if (!row) return;

    // 1. Find which row number was clicked (0, 1, 2...)
    const index = row.sectionRowIndex;
    // 2. Flip the boolean in data! (false -> true, or true -> false)
    data[index].selected = !data[index].selected;

    generateTableBody();
    updateSum();
}

videoTableBody.addEventListener("click", toggleSelected);

// c) total view of all videos
// d) views of selected video

function updateSum() {
    const selectedVideos = data.filter(video => video.selected)
    if (selectedVideos.length === 0) {
        const totalView = data.reduce((total, video) => total + video.views, 0);
        sumSpan.innerHTML = Number(totalView);
    } else {
        const selectedView = selectedVideos.reduce((total, video) => total + video.views, 0);
        sumSpan.innerHTML = Number(selectedView.toFixed(2));
    }
}

function addView() {
    const amount = Number(viewInput.value)
    const selectedVideos = data.filter(video => video.selected)
    if (selectedVideos.length === 0) return;

    selectedVideos.forEach(video => {
        video.views = Number((video.views + amount).toFixed(1));
    })
    generateTableBody();
    updateSum();
}

function subView() {
    const amount = Number(viewInput.value)
    const selectedVideos = data.filter(video => video.selected)
    if (selectedVideos.length === 0) return;

    selectedVideos.forEach(video => {
        video.views = Number((video.views - amount).toFixed(1));
    })
    generateTableBody();
    updateSum();
}

btnAdd.addEventListener("click", addView);
btnSub.addEventListener("click", subView);

generateTableBody();
updateSum();