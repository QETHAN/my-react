let isBatchingUpdate = false
let queue = []
let state = { number: 0 }

function setState(newState) {
  if (isBatchingUpdate) {
    queue.push(newState)
  } else {
    state = { ...state, ...newState }
  }
}

function handleClick() {
  isBatchingUpdate = true
  setState({ number: state.number + 1 })
  console.log('[state]', state);
  setState({ number: state.number + 1 })
  console.log('[state]', state);

  state = queue.reduce((newState, action) => {
    return { ...newState, ...action }
  }, state)
}