import { updateQueue } from "./Component";

export function addEvent(dom, eventType, handler) {
  let store;

  if (dom.store) {
    store = dom.store;
  } else {
    dom.store = {}
    store = dom.store
  }

  store[eventType] = handler
  if (!document[eventType]) { // 代理事件
    document[eventType] = dispatchEvent // 把dispatchEvent挂载到document上
  }
}

// 执行事件回调
function dispatchEvent(event) {
  let { type, target } = event
  let eventType = `on${type}`

  updateQueue.isBatchingUpdate = true
  let syntheticEvent = createSyntheticEvent(event)

  // 冒泡阶段
  while(target) {
    let { store } = target
    let handler = store && store[eventType]
    handler && handler.call(target, syntheticEvent)
    target = target.parentNode
  }

  updateQueue.isBatchingUpdate = false
  updateQueue.batchUpadte()
}

function createSyntheticEvent(event) {
  let syntheticEvent = {}

  for (let key in event) {
    syntheticEvent[key] = event
  }

  return syntheticEvent
}