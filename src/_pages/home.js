import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import axios from 'axios'
import Masonry from 'react-masonry-css'
import { useInView } from 'react-intersection-observer'
import invert from 'invert-color'

import Header from '_common/header'
import { scrollToTop } from '_common/utilities'

import SearchIcon from '_icons/search.svg'
import ExternalLinkIcon from '_icons/ext-link.svg'
import ZoomIcon from '_icons/zoom.svg'

const MASONRY_BREAKPOINTS = {
  default: 3,
  1024: 3,
  768: 2,
  640: 1,
}

const BASE_API_URL = 'https://api.unsplash.com'

const SearchBar = ({
  onSearchSubmit,
  searchKeyword,
  onSearchInputChange,
  onSearchReset,
}) => (
  <nav className="w-full sticky top-0 right-0 left-0 shadow-md px-3 py-6 bg-white z-50 bg-opacity-90">
    <form
      className="container mx-auto bg-white flex items-center justify-center relative"
      onSubmit={onSearchSubmit}
      onReset={onSearchReset}>
      <div className="relative w-full flex items-center">
        <input
          name="search"
          className="border-t border-l border-b bg-gray-100 text-gray-900 py-2 
        px-3 rounded-bl-lg rounded-tl-lg focus:bg-white border-gray-400 flex-grow w-full lg:w-10/12 xl:w-10/12
        focus:border-gray-600 transition-all duration-300 ease-in-out flex-grow-1 outline-none"
          type="search"
          placeholder="Search images"
          autoFocus
          value={searchKeyword}
          onChange={onSearchInputChange}
        />
        <button
          className={`absolute ${
            searchKeyword.length === 0 ? 'opacity-0' : ''
          } transition-all duration-300 right-0 top-0 mt-0 bottom-0 pr-2 text-xs rounded border border-gray-400 px-3
          hover:bg-gray-200 ease-in-out flex justify-center items-center bg-white py-2 sm:py-0 sm:mt-3 sm:mr-3 sm:bottom-auto sm:rounded-full`}
          type="reset"
          title="Clear search">
          <span className="hidden sm:block mr-1">CLEAR</span>&#x58;
        </button>
      </div>
      <button
        className={`hover:bg-purple-600 border-t border-r border-b transition-colors duration-300
          ease-in-out text-white py-2 px-4 rounded-tr-lg rounded-br-lg inline-flex items-center justify-center
              bg-purple-800 border-purple-600`}
        type="submit"
        title="Start search">
        &zwnj;
        <SearchIcon />
        <span className="hidden sm:block ml-3">Search</span>
      </button>
    </form>
  </nav>
)

const ImageSkeleton = ({ index }) => {
  const randomHeight =
    index % 3 === 0 ? 'h-64' : index % 2 === 0 ? 'h-56' : 'h-48'

  return (
    <div className="border w-full my-2">
      <div className="animate-pulse">
        <div className={`bg-gray-400 ${randomHeight}`}></div>
      </div>
    </div>
  )
}

const ImageOverlay = ({
  isImageInView,
  id = '',
  alt,
  externalLink = '',
  userLink = '',
  userName = '',
  userImage = '',
}) => {
  // if no property exists then dont show the overlay
  if (
    id.length === 0 &&
    externalLink.length === 0 &&
    (userImage.length === 0 || userName.length === 0)
  ) {
    return null
  }

  let fullImageButton = null
  if (id && id.length !== 0) {
    fullImageButton = (
      <Link
        to={`/images/${id}`}
        className="inline bg-gray-100 hover:bg-gray-200 text-black font-bold p-2 rounded pointer-events-auto"
        title="View full image">
        <ZoomIcon />
      </Link>
    )
  }

  let externalImageButton = null
  if (externalLink && externalLink.length !== 0) {
    externalImageButton = (
      <a
        href={externalLink}
        rel="noopener noreferrer"
        target="_blank"
        className="inline bg-gray-100 hover:bg-gray-200 text-black font-bold p-2 rounded ml-4 pointer-events-auto"
        title="View image at Unsplash">
        <ExternalLinkIcon />
      </a>
    )
  }

  const userImageProps = {
    alt: 'user',
    loading: 'lazy',
    title: '',
    className:
      'h-8 w-8 object-cover rounded-full bg-white object-cover object-center pointer-events-auto',
  }

  let displayPicture = null
  if (userImage && userImage.length !== 0) {
    displayPicture = (
      <a href={userLink} rel="noopener noreferrer" target="_blank">
        {isImageInView ? (
          <img src={userImage} {...userImageProps} />
        ) : (
          <img {...userImageProps} />
        )}
      </a>
    )
  }

  let displayName = null
  if (userName && userName.length !== 0) {
    displayName = (
      <a
        href={userLink}
        rel="noopener noreferrer"
        target="_blank"
        className="font-semibold tracking-wide text-gray-300 truncate ml-4 hover:text-white pointer-events-auto"
        title={userName}>
        {userName}
      </a>
    )
  }

  return (
    <div
      id="image-overlay"
      className="absolute top-0 right-0 w-full h-full bg-black bg-opacity-50 z-10
      transition-opacity duration-500 ease-in-out opacity-0 hover:text-red pointer-events-none
      flex flex-col justify-between p-6"
      title={alt}>
      <div className="flex justify-end">
        {fullImageButton}
        {externalImageButton}
      </div>
      <div className="flex items-center">
        {displayPicture}
        {displayName}
      </div>
    </div>
  )
}

const Image = ({
  id,
  src,
  backgroundColor,
  alt,
  originalWidth,
  originalHeight,
  externalLink,
  userImage,
  userName,
  userLink,
}) => {
  const [imageRef, isImageInView] = useInView({
    triggerOnce: true,
    rootMargin: '150% 0%',
    trackVisibility: true,
    delay: 100,
  })

  const imageProps = {
    alt,
    loading: 'lazy',
    className: `cursor-pointer text-center text-lg italic font-semibold object-cover object-center
      w-full min-h-full absolute z-10`,
    title: alt,
    style: {
      backgroundColor: backgroundColor,
      color: invert(backgroundColor), // To highligh alt text color based on background color
    },
  }

  const height = (originalHeight / originalWidth) * 100

  return (
    <figure
      id="image-container"
      className="relative my-2"
      style={{ paddingBottom: `${height}%` }}
      ref={imageRef}>
      <Link to={`/images/${id}`}>
        {isImageInView ? (
          <picture>
            <source
              srcSet={`${src.webpLow} 200w, ${src.webpMed} 390w, ${src.webpHigh} 430w`}
              sizes="(max-width: 640px) calc(100vw - 0.5rem), (max-width: 768px) calc(384px - 0.5rem), calc(426px - 1.5rem)"
              type="image/webp"
            />
            <img
              {...imageProps}
              src={src.jpgLow}
              srcSet={`${src.jpgLow} 200w, ${src.jpgMed} 390w, ${src.jpgHigh} 430w`}
              sizes="(max-width: 640px) calc(100vw - 0.5rem), (max-width: 768px) calc(384px - 0.5rem), calc(426px - 1.5rem)"
            />
          </picture>
        ) : (
          <picture>
            <img {...imageProps} />
          </picture>
        )}
      </Link>
      <ImageOverlay
        id={id}
        isImageInView={isImageInView}
        userImage={userImage}
        userName={userName}
        userLink={userLink}
        externalLink={externalLink}
      />
    </figure>
  )
}

const ImagesGrid = ({ images, isShowingLoader }) => {
  if (isShowingLoader) {
    return (
      <main className="container mx-auto my-6">
        <Masonry
          breakpointCols={MASONRY_BREAKPOINTS}
          className="flex w-auto"
          columnClassName="bg-clip-border mx-1">
          {[...Array(12)].map((_, index) => (
            <ImageSkeleton key={index} index={index} />
          ))}
        </Masonry>
      </main>
    )
  }
  return (
    <main className="container mx-auto my-6">
      <Masonry
        breakpointCols={MASONRY_BREAKPOINTS}
        className="flex w-auto"
        columnClassName="bg-clip-border mx-1">
        {images.collection.map(imageData => (
          <Image key={imageData.id} {...imageData} />
        ))}
      </Masonry>
    </main>
  )
}

const Footer = ({
  endOfPageRef,
  isShowingLoader,
  totalPages,
  currentPage,
  searchTextParam,
}) => {
  // while loading skeleton is shown
  if (isShowingLoader) {
    return null
  }

  // while no results can be displayed
  if (totalPages === 0 && currentPage === 1 && searchTextParam.length !== 0) {
    return (
      <footer
        className="container mx-auto text-center text-gray-500 tracking-wide 
    font-semibold subpixel-antialiased text-2xl mt-16">
        No results for your query
      </footer>
    )
  }

  // while no more results are available
  if (totalPages !== 0 && currentPage === totalPages) {
    return (
      <footer
        className="container mx-auto text-center text-gray-500 tracking-wide 
    font-semibold subpixel-antialiased text-2xl mb-10">
        No more results
      </footer>
    )
  }

  // while infinite scroll is taking place
  if (totalPages === null || currentPage <= totalPages) {
    return (
      <footer
        className="text-center py-6 text-gray-600 font-bold"
        ref={endOfPageRef}>
        Loading
      </footer>
    )
  }

  return null
}

function parseImageDataFromAPI(image) {
  const NO_ALT_TEXT = '--No alt text provided--'

  const imageID = image?.id ?? ''
  const imageAltText = image?.alt_description ?? NO_ALT_TEXT
  const imageWidth = image?.width ?? 0
  const imageHeight = image?.height ?? 0
  const imageColor = image?.color ?? '#fff'
  const imageURL = image?.urls?.raw ?? ''
  const imageLink = image?.links?.html ?? ''
  const imageCreator = image?.user?.name ?? ''
  const imageCreatorLink = image?.user?.links?.html ?? ''
  const imageCreatorDP = image?.user?.profile_image?.small ?? ''

  // Filter all those images which doesnt following the conditions
  if (
    imageID.length === 0 ||
    imageURL.length === 0 ||
    imageAltText === NO_ALT_TEXT ||
    String(imageHeight) === '0' ||
    String(imageWidth) === '0'
  ) {
    return {
      id: null,
      alt: null,
      originalHeight: null,
      originalWidth: null,
      backgroundColor: null,
      src: {
        webpLow: null,
        webpMed: null,
        webpHigh: null,
        jpgLow: null,
        jpgMed: null,
        jpgHigh: null,
      },
      externalLink: null,
      userName: null,
      userLink: null,
      userImage: null,
    }
  }

  const defaultImageOptions =
    'crop=entropy&fit=max&cs=tinysrgb&auto=compress&q=45'
  const webpLow = `${imageURL}&${defaultImageOptions}&w=200&fm=webp`
  const webpMed = `${imageURL}&${defaultImageOptions}&w=390&fm=webp`
  const webpHigh = `${imageURL}&${defaultImageOptions}&w=430&fm=webp`
  const jpgLow = `${imageURL}&${defaultImageOptions}&w=200&jpg`
  const jpgMed = `${imageURL}&${defaultImageOptions}&w=390&jpg`
  const jpgHigh = `${imageURL}&${defaultImageOptions}&w=430&jpg`

  return {
    id: imageID,
    alt: imageAltText,
    originalHeight: imageHeight,
    originalWidth: imageWidth,
    backgroundColor: imageColor,
    src: {
      webpLow,
      webpMed,
      webpHigh,
      jpgLow,
      jpgMed,
      jpgHigh,
    },
    externalLink: imageLink,
    userName: imageCreator,
    userLink: imageCreatorLink,
    userImage: imageCreatorDP,
  }
}

const HomePage = () => {
  const networkCancellation = useMemo(() => axios.CancelToken.source(), [])

  const [endOfPageRef, reachedEndOfPage] = useInView({
    rootMargin: '200% 0%',
    trackVisibility: true,
    delay: 100,
  })

  const history = useHistory()

  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const searchTextParam = urlParams.has('search') ? urlParams.get('search') : ''

  const [searchKeyword, setSearchKeyword] = useState(searchTextParam)
  const pageNumber = useRef()
  const [images, setImages] = useState({ totalPages: 0, collection: [] })
  const [isShowingLoader, setLoaderTo] = useState(true)

  async function doFetchRandomImages(page) {
    if (page === 1) {
      setLoaderTo(true)
    }

    const randomImagesURL = new URL('/photos', BASE_API_URL)
    randomImagesURL.searchParams.append('page', page)
    randomImagesURL.searchParams.append('per_page', '21')
    randomImagesURL.searchParams.append('content_filter', 'high')

    try {
      const response = await axios({
        method: 'GET',
        url: randomImagesURL.toString(),
        headers: {
          'Content-Type': 'application/json',
          'Accept-Version': 'v1',
          Authorization: `Client-ID ${process.env.API_ACCESS_KEY}`,
        },
        cancelToken: networkCancellation.token,
      })

      const responseData = response?.data ?? []

      if (responseData.length === 0) {
        // no images in the response
        setImages({ totalPages: 0, collection: [] })
      } else {
        const imagesFromAPI = responseData
          .map(responseDatum => parseImageDataFromAPI(responseDatum))
          .filter(parsedImage => parsedImage.id !== null)

        setImages(images => {
          const totalPages = null
          // we are at start of random images or cleared the search
          if (page === 1) {
            return { totalPages, collection: imagesFromAPI }
          } else {
            // we are paginating
            const allImages = [...images.collection, ...imagesFromAPI]
            return { totalPages, collection: allImages }
          }
        })
      }

      setLoaderTo(false)
    } catch (err) {
      console.error(err)
      if (err && err.message) {
        if (err.message === 'Network cancel') {
          // Lands here when cancel token is cleared
          // Dont set any state here as user has moved to other page
        } else {
          setLoaderTo(false)
        }
      } else {
        setLoaderTo(false)
      }
    }
  }

  async function doFetchFilteredImages(page, searchQuery = '') {
    if (page === 1) {
      setLoaderTo(true)
    }

    const filteredImagesURL = new URL('/search/photos', BASE_API_URL)
    filteredImagesURL.searchParams.append('page', page)
    filteredImagesURL.searchParams.append('per_page', '21')
    filteredImagesURL.searchParams.append('content_filter', 'high')
    filteredImagesURL.searchParams.append('query', searchQuery)

    try {
      const response = await axios({
        method: 'GET',
        url: filteredImagesURL.toString(),
        headers: {
          'Content-Type': 'application/json',
          'Accept-Version': 'v1',
          Authorization: `Client-ID ${process.env.API_ACCESS_KEY}`,
        },
        cancelToken: networkCancellation.token,
      })

      const responseData = response?.data ?? {}

      if (
        Object.keys(responseData).length === 0 ||
        responseData.results.length === 0
      ) {
        // no images in the response
        setImages({ totalPages: 0, collection: [] })
      } else {
        const imagesFromAPI = responseData.results
          .map(responseDatum => parseImageDataFromAPI(responseDatum))
          .filter(parsedImage => parsedImage.id !== null)

        setImages(images => {
          const totalPages = responseData['total_pages']
          // we are at start of search
          if (page === 1) {
            return { totalPages, collection: imagesFromAPI }
          } else {
            // we are paginating
            const allImages = [...images.collection, ...imagesFromAPI]
            return { totalPages, collection: allImages }
          }
        })
      }

      setLoaderTo(false)
    } catch (err) {
      console.error(err)
      if (err && err.message) {
        if (err.message === 'Network cancel') {
          // Lands here when cancel token is cleared
          // Dont set any state here as user has moved to other page
        } else {
          setLoaderTo(false)
        }
      } else {
        setLoaderTo(false)
      }
    }
  }

  // effect running after user reaches bottom threshold
  useEffect(() => {
    if (reachedEndOfPage) {
      pageNumber.current = pageNumber.current + 1

      if (searchTextParam.length === 0) {
        // paginate random images
        doFetchRandomImages(pageNumber.current)
      } else {
        // paginate search results
        doFetchFilteredImages(pageNumber.current, searchTextParam)
      }
    }
  }, [reachedEndOfPage])

  // effect running after search was applied or removed
  useEffect(() => {
    if (searchTextParam.length !== 0) {
      // reset the page number
      pageNumber.current = 1
      scrollToTop()

      doFetchFilteredImages(1, searchTextParam)
    } else {
      // set initial value of page number
      pageNumber.current = 1
      scrollToTop()

      doFetchRandomImages(1)
    }
  }, [searchTextParam])

  // network cancellation effect when page transitions
  useEffect(() => {
    return () => {
      networkCancellation.cancel('Network cancel')
    }
  }, [])

  function onSearchInputChange(event) {
    const {
      target: { value },
    } = event
    setSearchKeyword(value)
  }

  function onSearchSubmit(event) {
    event.preventDefault()

    if (searchKeyword.trim().length === 0) {
      return
    }

    const searchParams = new URLSearchParams(location.search)

    if (searchParams.has('search')) {
      // Delete any existing search if present
      searchParams.delete('search')
    }
    searchParams.set('search', searchKeyword.trim())

    const locationWithSearchQuery = `${
      location.pathname
    }?${searchParams.toString()}`

    history.push(locationWithSearchQuery)
  }

  function onSearchReset(event) {
    event.preventDefault()

    // just clear the search if no search param is present
    if (searchTextParam.length === 0) {
      setSearchKeyword('')
    } else {
      setSearchKeyword('')
      history.push(location.pathname)
    }
  }

  return (
    <>
      <Header onHomePage />
      <SearchBar
        searchKeyword={searchKeyword}
        onSearchInputChange={onSearchInputChange}
        onSearchSubmit={onSearchSubmit}
        onSearchReset={onSearchReset}
      />
      <ImagesGrid images={images} isShowingLoader={isShowingLoader} />
      <Footer
        totalPages={images.totalPages}
        endOfPageRef={endOfPageRef}
        isShowingLoader={isShowingLoader}
        currentPage={pageNumber.current}
        searchTextParam={searchTextParam}
      />
    </>
  )
}

export default HomePage
