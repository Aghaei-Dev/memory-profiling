import React, { useEffect } from 'react'

// Not optimized
// in every rerender we add an Interval to the DOM
useEffect(() => {
  const interval = setInterval(tick, 1000)
}, [])

// optimized
useEffect(() => {
  const interval = setInterval(tick, 1000)

  // this return clean up the interval or timeout after the component unmounts!
  return () => {
    clearInterval(interval)
  }
}, [])

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// this code calculate width and height of window in every changes

// Not Optimized
const [width, setWidth] = useState(window.innerWidth)
const [height, setHeight] = useState(window.innerHeight)

const resize = () => {
  setWidth(window.innerWidth)
  setHeight(window.innerHeight)
}

useEffect(() => {
  window.addEventListener('resize', resize)
})

// Optimized
const [width, setWidth] = useState(window.innerWidth)
const [height, setHeight] = useState(window.innerHeight)

const resize = () => {
  setWidth(window.innerWidth)
  setHeight(window.innerHeight)
}

useEffect(() => {
  window.addEventListener('resize', resize)

  // here i mean : this clean up the EventListener after the component unmounts!
  return () => {
    window.removeEventListener('resize', resize)
  }
})

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Not Optimized
let globalVariable

function MyComponent() {
  const [HUGE, setHUGE] = useState(
    new Array(1_000_000).fill('i am a dummy data')
  )

  useEffect(() => {
    globalVariable = HUGE // Storing a reference to HUGE state
  }, [HUGE])
}

// Optimized
let globalVariable

function MyComponent() {
  const [HUGE, setHUGE] = useState(
    new Array(1_000_000).fill('i am a dummy data')
  )

  useEffect(() => {
    globalVariable = HUGE // Storing a reference to HUGE state

    // Cleanup on unmount
    return () => {
      globalVariable = null // Cleaning up the reference
    }
  }, [HUGE])
}
