function updateTime() {
    const timeElement = document.getElementById('time');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function startClock() {
    updateTime();
    setInterval(updateTime, 1000);
}

document.addEventListener('DOMContentLoaded', startClock);

const root = document.documentElement;
if (localStorage.getItem('theme')) root.style.setProperty('--background-color', localStorage.getItem('theme'));
function thingy () {
    const tags = ["Fully unblocked ChatGPT! Just click the first icon below.", "Check out the games page to pass some time!", "Want to change the look of Helium? Check out the settings page!"];
    document.getElementById('tag').innerHTML = tags[Math.floor(Math.random() * tags.length)];
}
document.onload = thingy();
