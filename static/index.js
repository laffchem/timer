const resetTime = document.getElementById("reset-btn")

const ding = new Audio("../static/ding.mp3")


const startTimer = () => {
    // Prompts the user to enter the time in minutes
    let getMins = Number(prompt("Enter the time in minutes"))
    let totalSeconds = getMins * 60
    // Sets the countdown to run every 1000 ms; run it every second
    let timer = setInterval(() => {
        let displaySeconds = totalSeconds % 60
        let displayMinutes = Math.floor(totalSeconds / 60)
    // Add zero in front of the seconds if it is single digit
        displaySeconds = displaySeconds < 10 ? "0" + displaySeconds : displaySeconds;
    // Add time to the timer     
        document.getElementById("the-timer").innerText = `${displayMinutes}:${displaySeconds}`

    // Decrement the seconds
    totalSeconds--;

    if (totalSeconds < 0) {
        clearInterval(timer);
        ding.play()
    }

    resetTime.addEventListener("click", () => {
        clearInterval(timer)
        document.getElementById("the-timer").innerText = "MM:SS"
    })
    }, 1000)
}


const startTime = document.getElementById("start-btn").addEventListener("click", startTimer)

async function getRequest(url='') {
    const response = await fetch(url, {
      method: 'GET', 
      cache: 'no-cache'
    })
    return response.json()
}
  
document.addEventListener('DOMContentLoaded', function() {

let url = document.location
let route = "/flaskwebgui-keep-server-alive"
let interval_request = 3 * 1000 //sec

function keep_alive_server(){
    getRequest(url + route)
    .then(data => console.log(data))
}

setInterval(keep_alive_server, interval_request)()

})