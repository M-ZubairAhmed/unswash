import React from 'react'
import { Link } from 'react-router-dom'

const PageNotFound = () => (
  <div className="flex justify-center h-screen items-center flex-col">
    <h1 className="text-6xl text-gray-700">This page doesn't exist yet!</h1>
    <Link
      to="/"
      replace
      className="bg-transparent hover:bg-gray-100 text-gray-700 font-semibold hover:text-gray-800 
      py-2 px-4 border border-gray-500 rounded mt-10">
      Back to Home
    </Link>
  </div>
)

export default PageNotFound
