import React from 'react'

const Header = ({ onHomePage = false }) => {
  return (
    <header
      className={`w-full text-center flex justify-center flex-col 
    ${onHomePage ? 'py-16' : 'shadow-md bg-white py-2'}`}>
      <h1 className="text-6xl text-gray-600 font-extrabold tracking-widest">
        Unswash
      </h1>
      <p className="text-purple-800 font-semibold tracking-wide">
        Discover breathtaking images
      </p>
    </header>
  )
}

export default Header
