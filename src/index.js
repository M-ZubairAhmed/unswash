import React, { StrictMode } from 'react'
import { render } from 'react-dom'
import './styles.scss'

import Home from '_pages/home'

const App = () => (
  <StrictMode>
    <Home />
  </StrictMode>
)

render(<App />, document.getElementById('REACT_ROOT'))
