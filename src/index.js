import React from 'react'
import { render } from 'react-dom'

const App = () => (
  <div>
    <h1>React scaffolding kit</h1>
    <strong>An opinionated but customizable react starter kit</strong>
  </div>
)

render(<App />, document.getElementById('REACT_ROOT'))
