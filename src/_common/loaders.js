import React from 'react'

import DounutIcon from '_icons/dounut.svg'

export const FullscreenLoader = () => (
  <div className="flex justify-center h-screen items-center flex-col">
    <span className="h-10 w-10 text-gray-500 animate-spin">
      <DounutIcon />
    </span>
    <h4 className="text-xl text-gray-600 mt-4 font-bold">Unswash</h4>
  </div>
)
