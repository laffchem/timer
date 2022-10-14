const startButton = document.querySelector('#start-btn')
const resetButton = document.querySelector('#reset-btn')
const minutesElement = document.querySelector('#minutes')
const secondsElement = document.querySelector('#seconds')
const progressBarProgress = document.querySelector('#progressBarProgress')

const timerBody = document.querySelector('#timer')

const ding = new Audio('../static/ding.mp3')

// Is timer running? (Used to make textboxes not work when timer is running)
let isRunning = false

function validateTime(e) {
  // Get key letter from key code (Ex. 65 = A)
  let key = String.fromCharCode(e.keyCode || e.charCode)

  // 0-9 are the only possible characters that can be typed (Ex. 1, 10, 39)
  const validateRegex = /[0-9]/
  if (!validateRegex.test(key)) {
    e.returnValue = false
    if (e.preventDefault) e.preventDefault()
  }

  // Number attempting to be typed
  const fullNumber = parseInt(e.target.value + key)

  // Seconds cannot be greater than 59 or less than 0
  if (e.target.id === 'seconds') {
    if (
      !(fullNumber >= 0 && fullNumber <= 59) ||
      (e.target.value + key).length > 2
    ) {
      e.returnValue = false
      if (e.preventDefault) e.preventDefault()
    }
  }
}

new Array(minutesElement, secondsElement).forEach(el => {
  // When user focuses textbox...
  el.addEventListener('focus', () => {
    // and the timer is not running...
    if (!isRunning) {
      el.removeAttribute('readonly') // Allow the textbox to be editable
    } else {
      el.blur()
    }
  })

  // When user defocuses textbox...
  el.addEventListener('blur', () => {
    // Make textbox readonly
    el.setAttribute('readonly', 'readonly')
  })

  // When user clicks a key (letter/number, no backspace, etc), run the validate time function
  el.addEventListener('keypress', validateTime)
})

// State
class StartButtonStates {
  // Static properties, mean no instantiation
  static Start = new StartButtonStates('Start')
  static Pause = new StartButtonStates('Pause')
  static Resume = new StartButtonStates('Resume')

  constructor(name) {
    this.name = name
  }
}

// setInterval loop
let timerLoop

// Time that seconds where started at
let originalStartingSeconds
let startButtonState = StartButtonStates.Start

// When pause button is clicked
const pauseTimer = () => {
  // Stop timer
  clearInterval(timerLoop)
  isRunning = false

  // Removing running class from start button, so it becomes the normal start button
  startButton.classList.add('resume')
  timerBody.classList.add('paused')
  startButton.classList.remove('running')

  // Update button state
  startButtonState = StartButtonStates.Resume
}

// Resume button clicked
const resumeTimer = () => {
  startButton.classList.remove('resume')
  timerBody.classList.remove('paused')
  startButton.classList.add('running')

  startTimer(true)
}

// Start button clicked
const startTimer = (resume = false) => {
  // Update button state
  startButtonState = StartButtonStates.Pause

  // Calculate total seconds
  let totalSeconds =
    (parseInt(minutesElement.value) || 0) * 60 +
    (parseInt(secondsElement.value) || 0)

  // Don't reset original starting seconds when resuming timer
  if (!resume) originalStartingSeconds = totalSeconds

  // If user specified no time, just don't even start, and just return
  if (totalSeconds < 1) return

  // Set timer running to true
  isRunning = true

  // Make textboxes uneditable
  startButton.classList.add('running')

  const decayLoop = () => {
    // Calculate seconds/minutes
    let displaySeconds = totalSeconds % 60
    let displayMinutes = Math.floor(totalSeconds / 60)

    displaySeconds = displaySeconds < 10 ? '0' + displaySeconds : displaySeconds

    // Add time to the timer
    minutesElement.value = displayMinutes
    secondsElement.value = displaySeconds

    // Decrement the seconds
    totalSeconds--

    // Update progress bar
    progressBarProgress.style.clipPath = `inset(0% ${
      (totalSeconds / originalStartingSeconds) * 100
    }% 0% 0% round 20px)`

    // End timer/ding sound
    if (totalSeconds < 0) {
      // Cancel ding sound
      ding.pause()
      ding.currentTime = 0

      ding.play()
      resetTimer()
      // Set progress bar to no clip, to make it clean (because the math isnt exact)
      progressBarProgress.style.clipPath = 'inset(0% 0% 0% 0% round 20px)'
    }
  }

  // Sets the countdown to run every 1000 ms; run it every second
  decayLoop()
  timerLoop = setInterval(decayLoop, 1000)
}

// Contains key value pairs of the button state, and the function to run
const buttonMethods = {
  Start: startTimer,
  Pause: pauseTimer,
  Resume: resumeTimer,
}

const startButtonClicked = () => {
  // Runs function based on current button state (Start, Pause, Resume) using the object above
  buttonMethods[startButtonState.name]()
}

function resetTimer() {
  //  Set timer running to false
  isRunning = false
  startButton.classList.remove('running')
  startButton.classList.remove('resume')
  timerBody.classList.remove('paused')

  // Clears values
  minutesElement.value = ''
  secondsElement.value = ''

  // Stops timer
  clearInterval(timerLoop)

  // Update progress value
  progressBarProgress.style.clipPath = 'inset(0% 100% 0% 0% round 20px)'

  // Update button state
  startButtonState = StartButtonStates.Start
}

// Setup button events
startButton.addEventListener('click', startButtonClicked)
resetButton.addEventListener('click', resetTimer)

// Poll server
async function getRequest(url = '') {
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-cache',
  })
  return response.json()
}

document.addEventListener('DOMContentLoaded', function () {
  let url = document.location
  let route = '/flaskwebgui-keep-server-alive'
  let interval_request = 3 * 1000 //sec

  function keepServerAlive() {
    getRequest(url + route).then(data => console.log(data))
  }

  // setInterval(keepServerAlive, interval_request)()
})
