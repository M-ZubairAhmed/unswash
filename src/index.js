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

const Loader = () => (
  <div className="flex justify-center h-screen items-center flex-col">
    <svg
      className="animate-spin h-10 w-10 text-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <h4 className="text-xl text-gray-600 mt-4 font-bold">Loading</h4>
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
