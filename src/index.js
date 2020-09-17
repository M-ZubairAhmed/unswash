import React, { StrictMode, Suspense, lazy } from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

import './styles.scss'

import DounutIcon from './_icons/dounut.svg'

const HomePage = lazy(() =>
  import(/* webpackChunkName: "home" */ '_pages/home'),
)
const ImageViewPage = lazy(() =>
  import(/* webpackChunkName: "image-view" */ '_pages/image-view'),
)
const PageNotFound = lazy(() =>
  import(/* webpackChunkName: "page-not-found" */ '_pages/404'),
)

const Loader = () => (
  <div className="flex justify-center h-screen items-center flex-col">
    <span className="h-10 w-10 text-gray-500 animate-spin">
      <DounutIcon />
    </span>
    <h4 className="text-xl text-gray-600 mt-4 font-bold">Unswash</h4>
  </div>
)

const App = () => (
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
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
