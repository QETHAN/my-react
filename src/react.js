import { wrapToVdom } from './utils'

function createElement(type, config, children) {
  if (config) {
    delete config.__source
    delete config.__self
  }

  let props = {...config}

  // if (arguments.length > 3) { // 大于3个，说明有多个儿子
  //   props.children = [].slice.call(arguments, 2).map(wrapToVdom)
  // } else {
  //   // children可能是数字，字符串，null, undefined，数组
  //   props.children = wrapToVdom(children)
  // }

  if (arguments.length > 3) {
    children = [].slice.call(arguments, 2)
  }

  props.children = children

  console.log('[children]', children)

  return {
    type,
    props
  }
}

const React = {
  createElement
}

export default React