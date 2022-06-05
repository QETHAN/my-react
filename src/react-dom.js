import { REACT_TEXT } from './constants'

/**
 * 把虚拟dom转为真实dom
 */
function render(vdom, container) {
    let dom = createDOM(vdom);
    container.appendChild(dom);
}

function createDOM(vdom) {
  if (typeof vdom === 'undefined') {
    return document.createTextNode('')
  }
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return document.createTextNode(vdom)
  }
  // 虚拟dom对象
  let { type, props } = vdom;
  // let dom = document.createElement(type);
  let dom = null

  if (typeof type === 'function') {
    // 函数组件
    dom = mountFunctionComponent(vdom)
  } else {
    dom = document.createElement(type)
  }

  updateProps(dom, props);

  if (typeof props.children === 'string' || typeof props.children === 'number') {
    dom.textContent = props.children
  } else if (typeof props.children === 'object' && props.children.type) {
    // 没有type，就不是虚拟dom。不能是一个普通的对象
    render(props.children, dom)
  } else if (Array.isArray(props.children)) {
    reconcileChildren(props.children, dom)
  } else {
    dom.textContent = props.children ? props.children.toString() : ''
  }

  // vdom.dom = dom

  // if (type === REACT_TEXT) {
  //   dom = document.createTextNode(props.content)
  // } else if (typeof type === 'function') {
  //   return mountFunctionComponent(vdom)
  // } else {
  //   dom = document.createElement(type)
  // }

    // if (props) {
    //   updateProps(dom, {}, props)

    //   if (typeof props.children === 'object' && props.children.type) { // 对象，表示只有一个儿子
    //     render(props.children, dom)
    //   } else if (Array.isArray(props.children)) {
    //     console.log('props.children is array')
    //     reconcileChildren(props.children, dom)
    //   }
    // }

    // vdom.dom = dom
console.log('[dom]', dom)
    return dom
}

function mountFunctionComponent(vdom) {
  let { type: FunctionComponent, props } = vdom
  let renderVdom = FunctionComponent(props)
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
    } else {
      dom[key] = newProps[key]
    }
  }
}

const ReactDOM = {
  render
}

export default ReactDOM