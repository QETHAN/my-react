// import React from 'react';
// import ReactDOM from 'react-dom';
import React from './react'
import ReactDOM from './react-dom'

let element1 = <h1 id="title">hello</h1>
console.log(element1)
// ReactDOM.render(element1, document.getElementById('root'))

// let element2 = React.createElement('h1', {id: 'title'}, React.createElement('span', null, 'hello'), 'world')
// console.log(JSON.stringify(element2, null, 2));

// class ClassComponent extends React.Component {
//   render() {
//     return React.createElement('h1', {id: 'title'}, React.createElement('span', null, this.props.name), 'world')
//   }
// }
function FunctionComponent(props) {
  // return <h1>Hello, {props.name}</h1>
  return React.createElement('h1', {}, 'hello,', props.name)
  // return <div className='title' style={{color: 'red'}}>
  //     <span>{props.name}</span>
  //     {props.children}
  //   </div>
}

// let element3 = React.createElement(FunctionComponent, {name: 'world'}, 'hello')
// console.log(JSON.stringify(element3, null, 2));
// ReactDOM.render(element2, document.getElementById('root'));
// ReactDOM.render(element3, document.getElementById('root'));
// let element4 = React.createElement(ClassComponent, {name: 'hello'})
// let element4 = <ClassComponent name='hello2' />
// ReactDOM.render(element4, document.getElementById('root'));
function SubCounter(props) {
  return <h1 onClick={props.onClick}>{props.count}</h1>
}
class Counter extends React.Component {

  static defaultProps = {
    name: 'Counter'
  }

  constructor(props) {
    super(props)
    this.state  = { number: 0 }
  }

  handleClick = () => {
    console.log('handleClick')
    this.setState({ number: this.state.number + 1 })
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate', this.state, nextState)
    return nextState.number % 2 === 0
  }

  // 静态方法中，不能调用this.setState，避免死循环；单例方法消耗低。
  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('getDerivedStateFromProps')
  }

  componentWillUpdate() {
    console.log('componentWillUpdate', this.state)
  }

  componentDidUpdate() {
    console.log('componentDidUpdate', this.state)
  }

  render() {
    // return (
    //   <div>
    //     <p>{this.state.number}</p>
    //     <button onClick={this.handleClick}>+</button>
    //   </div>
    // )
    return <SubCounter count={this.state.number} onClick={this.handleClick} />
  }
}

ReactDOM.render(<Counter />, document.getElementById('root'));

function TextInput(props, ref) {
  return <input type="text" ref={ref} />
}
const ForwardedTextInput = React.forwardRef(TextInput)

class Form extends React.Component {
  constructor(props) {
    super(props)
    this.textInputRef = React.createRef()
  }

  getFormFocus = () => {
    this.textInputRef.current.focus()
  }

  render() {
    return (
      <>
        <ForwardedTextInput ref={this.textInputRef} />
        <button onClick={this.getFormFocus}>Focus the text input</button>
      </>
    )
  }
}

// ReactDOM.render(<Form />, document.getElementById('root'))