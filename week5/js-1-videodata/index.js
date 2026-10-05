const taskA = document.querySelector('#taskA')
const taskB = document.querySelector('#taskB')
const taskC = document.querySelector('#taskC')
const taskD = document.querySelector('#taskD')
const taskE = document.querySelector('#taskE')

const before2000 = data.find(item => item.year < 2000)
taskA.innerHTML = before2000.title

const videos = data.filter(item => item.views > 100).map(item => item.title).join(", ");
taskB.innerHTML = videos

const loveVideos = data.filter(item => item.title.includes('Love'))
taskC.innerHTML = loveVideos.length

const newVideo = data.filter(item => item.year === 2024)
const average = Number(newVideo.reduce((sum, song) => sum + song.views, 0) / newVideo.length)
taskD.innerHTML = average.toFixed(2)

const answer = data.some(item => {
    const songPart = item.title.split(' - ')[1]
    return songPart.includes('0') ||
        songPart.includes('1') ||
        songPart.includes('2') ||
        songPart.includes('3') ||
        songPart.includes('4') ||
        songPart.includes('5') ||
        songPart.includes('6') ||
        songPart.includes('7') ||
        songPart.includes('8') ||
        songPart.includes('9')
})

//second formatting:
const titlesOnly = data.map(video => video.title.split(' - ')[1])
const hasDigit = titlesOnly.some(titlePart => {
  return titlePart.includes('0') ||
    titlePart.includes('1') ||
    titlePart.includes('2') ||
    titlePart.includes('3') ||
    titlePart.includes('4') ||
    titlePart.includes('5') ||
    titlePart.includes('6') ||
    titlePart.includes('7') ||
    titlePart.includes('8') ||
    titlePart.includes('9')
})

taskE.innerHTML = hasDigit
console.log(titlesOnly)