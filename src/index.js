import React from 'react'
import { render } from 'react-dom'
import './styles.scss'

import Home from '_pages/home'

const App = () => (
  <div>
    <Home />
  </div>
)

render(<App />, document.getElementById('REACT_ROOT'))
