const taskA = document.querySelector("#taskA");
const taskB = document.querySelector("#taskB");
const taskC = document.querySelector("#taskC");
const taskD = document.querySelector("#taskD");
const taskE = document.querySelector("#taskE");
const taskF = document.querySelector("#taskF");

taskA.innerHTML = spaceMissions.length;

const successful = spaceMissions.some(mission => {
    return mission.successful === false;
})
taskB.innerHTML = successful;

const useOneInstrument = spaceMissions.every(mission => {
    const oneInstrument = mission.instruments.length;
    return oneInstrument >= 1;
})
taskC.innerHTML = useOneInstrument;

const successfulMissions = spaceMissions.filter(mission => mission.successful === true && mission.agency === "NASA")
const answer = successfulMissions.map(mission => mission.name).join(', ');
taskD.innerHTML = answer;

const missionUseCamera = spaceMissions.filter(mission =>
    mission.instruments.includes("camera")
);
taskE.innerHTML = missionUseCamera.map(mission => mission.name).join(', ')

const mostExpensive = spaceMissions.filter(mission => mission.successful === true).reduce((maxMission, currentMission) => {
    if (maxMission.costMillionUSD >= currentMission.costMillionUSD) {
        return maxMission
    } else {
        return currentMission
    }
})
taskF.innerHTML = mostExpensive.name;