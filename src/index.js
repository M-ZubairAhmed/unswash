import React, { StrictMode, Suspense, lazy } from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

import './styles.scss'

const HomePage = lazy(() =>
  import(/* webpackChunkName: "home" */ '_pages/home'),
)
const ImageViewPage = lazy(() =>
  import(/* webpackChunkName: "image-view" */ '_pages/image-view'),
)
const PageNotFound = lazy(() =>
  import(/* webpackChunkName: "page-not-found" */ '_pages/404'),
)

const FullscreenLoader = () => (
  <div
    // Inline style to avoid render blocking
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}>
    <h4 className="text-xl text-gray-600 mt-4 font-bold">Loading Unswash</h4>
  </div>
)

const App = () => (
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<FullscreenLoader />}>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/images/:imageID" component={ImageViewPage} />
          <Route path="/images">
            <Redirect to="/" />
          </Route>
          <Route component={PageNotFound} />
        </Switch>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
)

render(<App />, document.getElementById('REACT_ROOT'))
