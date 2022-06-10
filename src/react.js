import { wrapToVdom } from './utils'
import Component from './Component'

function createElement(type, config, children) {
  let ref; // 用来获取dom实例
  let key; // 用来区分同一个父亲的不同儿子

  if (config) {
    delete config.__source
    delete config.__self
    ref = config.ref
    // delete config.ref // 和props同级关系
    key = config.key
    delete config.key
  }

  let props = {...config}

  // if (arguments.length > 3) { // 大于3个，说明有多个儿子
  //   props.children = [].slice.call(arguments, 2).map(wrapToVdom)
  // } else {
  //   // children可能是数字，字符串，null, undefined，数组
  //   props.children = wrapToVdom(children)
  // }

  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom)
  } else {
    props.children = wrapToVdom(children)
  }

  console.log('[children]', children)

  return {
    type,
    props,
    ref,
    key
  }
}

function createRef() {
  return {
    current: null
  }
}

function forwardRef(FunctionComponent) {
  return class extends Component {
    render() {
      return FunctionComponent(this.props, this.props.ref)
    }
  }
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef
}

export default React