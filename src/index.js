import React from 'react';
import ReactDOM from 'react-dom';

let element1 = <h1 id="title">hello</h1>

let element2 = React.createElement('h1', {id: 'title'}, 'hello', 'world')
console.log(element2);

ReactDOM.render(element1, document.getElementById('root'));