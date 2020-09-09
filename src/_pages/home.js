import React, { useEffect,useMemo } from 'react'
import axios from 'axios'

const LogoBar = () => (
  <div className="w-full text-center flex justify-center flex-col py-6">
    <h1 className="text-6xl text-gray-600 font-extrabold">Unswash</h1>
    <p className="text-purple-800 italic font-semibold">
      Discover breathtaking images
    </p>
  </div>
)

const SearchBar = () => (
  <div className="w-full sticky top-0 right-0 left-0 shadow-md p-3 bg-white">
    <form className="container mx-auto bg-white py-4 flex items-center justify-center">
      <input
        name="search"
        className="border-t border-l border-b bg-gray-100 text-gray-900 py-2 
      px-3 rounded-bl-lg rounded-tl-lg focus:bg-white border-gray-400 flex-grow w-full lg:w-10/12 xl:w-10/12
      focus:border-gray-600 transition-all duration-300 ease-in-out"
        type="search"
        placeholder="Search images"
      />
      <button
        className="bg-purple-800 hover:bg-purple-600 border-purple-600 border-t border-r border-b transition-all duration-300 
          ease-in-out text-white py-2 px-4 rounded-tr-lg rounded-br-lg inline-flex items-center justify-center "
        type="submit">
        &zwnj;
        <SearchIcon />
        <span className=" hidden sm:block md:block ml-3">Search</span>
      </button>
    </form>
  </div>
)

const SearchIcon = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"
    />
    <path
      fillRule="evenodd"
      d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
    />
  </svg>
)

const HomePage = () => {
  const networkCancellation = useMemo(() => axios.CancelToken.source(), [])

  useEffect(() => {
    async function doFetchImages(searchKey="",page){
      const isSearchActive = searchKey.trim().length !== 0
      const listImagesSubroute = isSearchActive ? '/search/photos' : '/photos'
      
      const listImagesURL = new URL(listImagesSubroute,'https://api.unsplash.com')

      listImagesURL.searchParams.append('page',page)
      listImagesURL.searchParams.append('per_page','25')
      listImagesURL.searchParams.append('content_filter','high')
      if(isSearchActive){
        listImagesURL.searchParams.append('query','')
      }

      const response = await axios({
        method: 'GET',
          url: listImagesURL.toString(),
          headers: {
            'Content-Type': 'application/json',
            'Accept-Version': 'v1',
            Authorization: `Client-ID`,
          },
          cancelToken: networkCancellation.token,
      })

    }

    doFetchImages('',"1")
  }, [])

  return (
    <>
      <LogoBar />
      <SearchBar />
      <div className="container mx-auto bg-gray-500"></div>
    </>
  )
}

export default HomePage
