// import React from 'react';
// import ReactDOM from 'react-dom';
import React from './react'
import ReactDOM from './react-dom'

// let element1 = <h1 id="title">hello</h1>

let element2 = React.createElement('h1', {id: 'title'}, React.createElement('span', null, 'hello'), 'world')
// console.log(JSON.stringify(element2, null, 2));

function FunctionComponent(props) {
  // return <h1>Hello, {props.name}</h1>
  return React.createElement('h1', {}, 'hello,', props.name)
  // return <div className='title' style={{color: 'red'}}>
  //     <span>{props.name}</span>
  //     {props.children}
  //   </div>
}

let element3 = React.createElement(FunctionComponent, {name: 'world'}, 'hello')
console.log(JSON.stringify(element3, null, 2));
// ReactDOM.render(element2, document.getElementById('root'));
ReactDOM.render(element3, document.getElementById('root'));