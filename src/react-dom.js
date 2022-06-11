import { REACT_TEXT } from './constants'
import { addEvent } from './event';

/**
 * 把虚拟dom转为真实dom
 */
function render(vdom, container) {
    let dom = createDOM(vdom);
    container.appendChild(dom);
    
    // 挂载之后再执行
    if (dom.componentDidMount) {
      dom.componentDidMount()
    }
}

export function createDOM(vdom) {
  // if (typeof vdom === 'undefined') {
  //   return document.createTextNode('')
  // }
  
  // 虚拟dom对象
  let { type, props, ref } = vdom;
  // let dom = document.createElement(type);
  let dom = null

  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.content)
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vdom)
    } else {
      // 函数组件
      dom = mountFunctionComponent(vdom)
    }
  } else {
    dom = document.createElement(type)
  }

  if (props) {
    updateProps(dom, props);

    if (typeof props.children === 'object' && props.children.type) {
      render(props.children, dom)
    } else if (Array.isArray(props.children)) {
      reconcileChildren(props.children, dom)
    }
  }
  
  vdom.dom = dom
  console.log('[dom]', dom)

  if (ref) {
    ref.current = dom // ref.current指向dom实例
  }

  return dom
}

function mountClassComponent(vdom) {
  let {type, props, ref} = vdom

  let defaultProps = type.defaultProps
  let componentProps = {...defaultProps, ...props}

  let classInstance = new type(componentProps)

  // willMount
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount()
  }

  if (type.getDerivedStateFromProps) {
    let partialState = type.getDerivedStateFromProps(classInstance.props, classInstance.state)
    if (partialState) {
      classInstance.state = {...classInstance.state, ...partialState}
    }
  }

  let renderVdom = classInstance.render()

  classInstance.oldRenderVdom = vdom.oldRenderVdom = renderVdom

  if (ref) {
    ref.current = classInstance
  }

  let dom = createDOM(renderVdom)

  // didMount
  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(this)
  }

  return dom
}

function mountFunctionComponent(vdom) {
  let { type: FunctionComponent, props } = vdom

  let renderVdom = FunctionComponent(props)
  vdom.oldRenderVdom = renderVdom

  return createDOM(renderVdom)
}

function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    let childVdom = childrenVdom[i]
    render(childVdom, parentDOM)
  }
}

function updateProps(dom, newProps) {
  for (let key in newProps) {
    if (key === 'children') { continue; }

    if (key === 'style') {
      let styleObj = newProps[key]
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr]
      }
    } else if (key.startsWith('on')) {
      console.log('[updateProps]', key)
      // dom[key.toLocaleLowerCase()] = newProps[key]
      addEvent(dom, key.toLocaleLowerCase(), newProps[key])
    } else { // js中，dom.className = 'xxx'
      dom[key] = newProps[key]
    }
  }
}

export function findDOM(vdom) {
  let { type } = vdom
  let dom = null

  if (typeof type === 'function') {
    dom = findDOM(vdom.oldRenderVdom) // 递归获取内层的vdom，因为可能是多层的function组件
  } else {
    dom = vdom.dom
  }

  return dom
}

/**
 * 现在还没有实现dom-diff
 * @param {*} parentDOM 
 * @param {*} oldVdom 
 * @param {*} newVdom 
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  // let oldDOM = findDOM(oldVdom)
  // let newDOM = createDOM(newVdom)
  // parentDOM.replaceChild(newDOM, oldDOM)

  if (!oldVdom && !newVdom) {
  } else if (oldVdom && !newVdom) { // 老的不为null, 新的为null，要销毁老的
    let currentDOM = findDOM(oldVdom)
    if (currentDOM) {
      parentDOM.removeChild(currentDOM)
    }

    // 如果是一个类组件
    if (oldVdom.classInstance && oldVdom.classInstance.componentWillUnmount) {
      oldVdom.classInstance.componentWillUnmount()
    }
  } else if (!oldVdom && newVdom) { // 老的为null, 新的不为null，要添加新的
    let newDOM = createDOM(newVdom)

    if (nextDOM) {  // button
      parentDOM.insertBefore(newDOM, nextDOM)
    } else {
      parentDOM.appendChild(newDOM)// 不一定在最后边
    }
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount()
    }
  } else if (oldVdom && newVdom && (oldVdom.type !== newVdom.type)) { // 老的不为null, 新的不为null, 但是类型不一样，要替换
    let oldDOM = findDOM(oldVdom)
    let newDOM = createDOM(newVdom)
    parentDOM.replaceChild(newDOM, oldDOM)

    // 旧节点卸载
    if (oldVdom.classInstance && oldVdom.classInstance.componentWillUnmount) {
      oldVdom.classInstance.componentWillUnmount()
    }

    // 新节点挂载
    if (newDOM.componentDidMount) {
      newDOM.componentDidMount()
    }
  } else { // 老的不为null, 新的不为null, 类型一样，需要复用老节点，要递归dom-diff
    updateElement(oldVdom, newVdom)
  }
}

// 新旧vdom 类型一样
function updateElement(oldVdom, newVdom) {
  if (oldVdom.type === REACT_TEXT && newVdom.type === REACT_TEXT) { // 文本节点
    let currentDOM = newVdom.dom = findDOM(oldVdom) // 不用新建dom了

    if (oldVdom.props.content !== newVdom.props.content) {
      currentDOM.textContent = newVdom.props.content
    }
  } else if (typeof oldVdom.type === 'string') { // 原生组件 div p
    let currentDOM = newVdom.dom = findDOM(oldVdom)
    updateProps(currentDOM, oldVdom.props, newVdom.props)
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)
  } else if (typeof oldVdom.type === 'function') { // 组件
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom)
    } else {
      updateFunctionComponent(oldVdom, newVdom)
    }
  }
}

function updateClassComponent(oldVdom, newVdom) {
  let classInstance = newVdom.classInstance = oldVdom.classInstance
  newVdom.oldRenderVdom = oldVdom.oldRenderVdom
  if (classInstance.componentWillReceiveProps) { // 因为此更新是由于父组件更新导致的，子组件会拿到新的属性
    classInstance.componentWillReceiveProps(newVdom.props)
  }

  classInstance.updater.emitUpdate(newVdom.props)
}

function updateFunctionComponent(oldVdom, newVdom) {
  let parentDOM =findDOM(oldVdom).parentNode
  let {type, props} = newVdom
  let newRenderVdom = type(props)
   
  newVdom.oldRenderVdom = newRenderVdom

  compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, newRenderVdom)
}

function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]
  newVChildren = Array.isArray(newVChildren) ? newVChildren : [newVChildren]

  let maxLength = Math.max(oldVChildren.length, newVChildren.length)
  for (let i = 0; i < maxLength; i++) {
    // find的参数是一个返回boolean的函数，如果为true，则返回当前的元素
    let nextVNode = oldVChildren.find((item, index) => index > i && item && findDOM(item))
    compareTwoVdom(parentDOM, oldVChildren[i], newVChildren[i], nextVNode && findDOM(nextVNode))
  }
}

const ReactDOM = {
  render
}

export default ReactDOM