import { compareTwoVdom, findDOM } from './react-dom'

export let updateQueue = {
  isBatchingUpdate: false,
  updaters: [],
  batchUpadte() {
    for(let updater of updateQueue.updaters) {
      updater.updateComponent()
    }
    updateQueue.isBatchingUpdate = false
    updateQueue.updaters.length = 0
  }
}

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance
    this.pendingStates = []
    this.callbacks = []
  }

  addState(partialState, callback) {
    this.pendingStates.push(partialState)
    
    if (typeof callback === 'function') {
      this.callbacks.push(callback)
    }

    this.emitUpdate() // 触发更新
  }

  // 状态和属性的变化，都会让组件刷新，属性变化还没实现
  emitUpdate(nextProps) {
    this.nextProps = nextProps

    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.push(this)
    } else {
      this.updateComponent()
    }
    
  }

  updateComponent() {
    let {classInstance, pendingStates, nextProps} = this

    // 属性变化，或者state变化，都会触发更新
    if (nextProps || pendingStates.length > 0) {
      shouldUpdate(classInstance, nextProps, this.getState())
    }
  }

  // 根据老状态，和pendingStates，计算新状态
  getState() {
    let {classInstance, pendingStates} = this

    let state = classInstance.state // 老状态

    pendingStates.forEach(nextState => {
      if (typeof nextState === 'function') {
        nextState = nextState(state)
      }

      state = {...state, ...nextState} // 覆盖老的state
    })

    pendingStates.length = 0 // 清空队列
    return state
  }
}

function shouldUpdate(classInstance, nextProps, nextState) {
  let willUpdate = true

  if (classInstance.constructor.getDerivedStateFromProps) {
    let partialState = classInstance.constructor.getDerivedStateFromProps(nextProps, classInstance.state)
    if (partialState) {
      nextState = {...nextState, ...partialState}
    }
  }

  if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
    willUpdate = false
  }

  // if (willUpdate && classInstance.componentWillUpdate) {
  //   classInstance.componentWillUpdate()
  // }

  // 不管要不要更新，属性和state都要更新

  if (nextProps) classInstance.props = nextProps

  classInstance.state = nextState // 修改实例的状态, 永远指向最新

  if (willUpdate) {
    classInstance.forceUpdate()
  }
}

class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props
    this.state = {}
    this.updater = new Updater(this)
  }

  setState(partialState, callback) {
    this.updater.addState(partialState, callback)
  }

  render() {
    throw new Error('render() must be implemented')
  }

  /**
   * 组件更新
   * 1. 获取老的vdom
   * 2. 更加最新属性和state，计算新的vdom，然后进行diff，把差异同步到真实dom上
   */
  forceUpdate() {
    console.log('forceUpdate');
    let oldRenderVdom = this.oldRenderVdom
    let oldDOM = findDOM(oldRenderVdom)
    let newRenderVdom = this.render()
    compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom)
    this.oldRenderVdom = newRenderVdom

    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state)
    }
  }
}

// function updateClassComponent(classInstance, newVdom) {
//   let oldDOM = classInstance.dom
//   let newDOM = createDOM(newVdom)
//   oldDOM.parentNode.replaceChild(newDOM, oldDOM)
//   classInstance.dom = newDOM
// }


export default Component