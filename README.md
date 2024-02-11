# Optimizing React: Memory Optimization

## What is Memory ?

A memory refers to the physical space where data is stored. Most of the time, as an web developer, you’re dealing with either RAM or Drive.
when we running chrome , Chrome uses the V8 Javascript engine which parses your code and uses your computer’s RAM or drive to store data.

### Garbage Collector

Low-level languages like C, have manual memory management primitives such as `malloc()` and `free()`. In contrast, JavaScript automatically allocates memory when objects are created and frees it when they are not used anymore.this is garbage collector !

### Heap Vs Stack

#### Stack: Static memory allocation

A stack is a data structure that JavaScript uses to store static data. Static data is data where the engine knows the size at compile time. In JavaScript, this includes primitive values (strings, numbers, booleans, undefined, and null) and references, which point to objects and functions.

#### Heap: Dynamic memory allocation

The heap is a different space for storing data where JavaScript stores objects and functions.

Unlike the stack, the engine doesn't allocate a fixed amount of memory for these objects. Instead, more space will be allocated as needed.

> Notice : memory leaks happen when some buggy code introduces objects to get accumulated in the **_heap_**

## Memory Leaks Bottle Necks in React

1. `SetInterval` and `SetTimeout` :If you start a `setInterval` or `setTimeout` within a component and don't clear it, the callback function can continue to run even after the component has unmounted, which can cause a memory leak.you should always clear any intervals or timeouts when the component unmounts.
   simple example :

```js
useEffect(() => {
  const interval = setInterval(tick, 1000)

  // this return clean up the interval or timeout after the component unmounts!
  return () => {
    clearInterval(interval)
  }
}, [])
```

2. Event Listeners :If the event listener is not removed when the component unmounts, the event listener, its callback function, and your component will all stay in memory, causing a memory leak.so clean u it after every render.

```js
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
```

3. Non-DOM References and Large Data:Non-DOM references are references to objects that are not part of the DOM.If we store a reference to a large data structure in the state of a component and then store a reference to that state in a global variable or in another component, we can end up with a memory leak.

```js
import { useEffect, useState } from 'react'

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
```

4. Closures :closure is a function that has access to the parent scope.can cause memory leaks if they unintentionally retain references to objects that should be garbage collected.exactly just before clean up after unmounting !

5. Third-party libraries : use wisely and read the docs to prevent memory leaks.

## React Profiler

### Component

`<Profiler>` lets you measure rendering performance of a React tree programmatically.
for measuring rendering performance Wrap a component tree with a `<Profiler>`.

```js
// id: A string identifying the part of the UI you are measuring.
// onRender: An onRender callback that React calls every time components within the profiled tree update.
// It receives information about what was rendered and how much time it took.

<Profiler id='App' onRender={onRender}>
  <App />
</Profiler>
```

so what is `onRender`?
React will call your onRender callback with information about what was rendered.

```js
function onRender(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  // id: The string id prop of the <Profiler> tree that has just committed.
  // This lets you identify which part of the tree was committed if you are using multiple profilers.
  console.log(id)

  // phase: "mount", "update" or "nested-update". This lets you know whether the tree has just been mounted for the first time or re-rendered due to a change in props, state, or hooks.
  console.log(phase)

  // actualDuration: The number of milliseconds spent rendering the <Profiler> and its descendants for the current update.
  // This indicates how well the subtree makes use of memoization (e.g. memo and useMemo).
  // Ideally this value should decrease significantly after the initial mount
  // as many of the descendants will only need to re-render if their specific props change.
  console.log(actualDuration)

  // baseDuration: The number of milliseconds estimating how much time it would take to re-render the entire <Profiler> subtree without any optimizations.
  // It is calculated by summing up the most recent render durations of each component in the tree.
  // This value estimates a worst-case cost of rendering (e.g. the initial mount or a tree with no memoization).
  // Compare actualDuration against it to see if memoization is working.
  console.log(baseDuration)

  // startTime: A numeric timestamp for when React began rendering the current update.
  console.log(startTime)

  // commitTime: A numeric timestamp for when React committed the current update.
  //  This value is shared between all profilers in a commit, enabling them to be grouped if desirable.
  console.log(commitTime)
}
```

### Extension

1. install `react dev tools` from chrome web store .`https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?pli=1`
2. The “Profiler” panel will be empty initially. Click the record button to start profiling.
3. DevTools will automatically collect performance information each time your application renders.then click on stop.

## Performance and Memory Tab

When you go to the Performance tab, you have an option to check the “memory” checkbox when collecting profiles.This graph shows the size of JS heap over time as I was interacting with the page.As you interact with a page, memory can grow for many reasons.
example React : when you add redux store in your app , we increase the heap size . yes this store stores in heap or when you add more elements in your app you increase the heap size (do you remember the `VDOM`)

- Heap SnapShot : gives you a detailed view of your JS heap.with snap shot you can find the size of objects but you can't find what functions created these objects. In other words, you can’t build a Flame Graph with this information.

- Allocation Sampling : Allocated memory profile type shows you the amount of heap memory allocated by each function over the duration of the profile, including allocations which were subsequently freed. That’s a big difference between this profile type and heap live size, which tells you the live size at the time the heap snapshot was taken.
