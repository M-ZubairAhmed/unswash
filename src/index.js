import React from 'react'
import { render } from 'react-dom'
import './styles.scss'

const App = () => (
  <div className="container mx-auto">
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Hello world
    </button>
  </div>
)

render(<App />, document.getElementById('REACT_ROOT'))
