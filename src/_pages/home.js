import React, { useEffect, useMemo, useState, useRef } from 'react'
import axios from 'axios'
import Masonry from 'react-masonry-css'
import invert from 'invert-color'
import { useInView } from 'react-intersection-observer'
import { Link, useHistory, useLocation } from 'react-router-dom'

import Header from '_common/header'

const MASONRY_BREAKPOINTS = {
  default: 3,
  1024: 3,
  768: 2,
  640: 1,
}

const BASE_API_URL = 'https://api.unsplash.com'

function scrollToTop() {
  if (document && typeof document !== 'undefined') {
    const topScrollElement = document.getElementById('SCROLL-TO-TOP-ELEMENT')

    topScrollElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  }
}

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
        focus:border-gray-600 transition-all duration-300 ease-in-out flex-grow-1"
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

function calculateImageHeight(
  viewportWidth,
  masonryWidth,
  originalWidth,
  originalHeight,
) {
  if (
    viewportWidth === 0 ||
    originalHeight === 0 ||
    originalWidth === 0 ||
    masonryWidth === 0
  ) {
    return 0
  }

  let viewportBreakPoint = 0
  if (viewportWidth >= 768) {
    viewportBreakPoint = 1024
  } else if (viewportWidth >= 640 && viewportWidth < 768) {
    viewportBreakPoint = 768
  } else if (viewportWidth < 640) {
    viewportBreakPoint = 640
  }

  if (viewportBreakPoint === 0) {
    return 0
  }

  const numberOfColumns = MASONRY_BREAKPOINTS[viewportBreakPoint]
  const columnWidth = masonryWidth / numberOfColumns

  return (columnWidth / originalWidth) * originalHeight
}

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

const ExternalLinkIcon = () => (
  <svg
    width="1.3em"
    height="1.3em"
    viewBox="0 0 16 16"
    className="inline"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      d="M6.364 13.5a.5.5 0 0 0 .5.5H13.5a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 13.5 1h-10A1.5 1.5 0 0 0 2 2.5v6.636a.5.5 0 1 0 1 0V2.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H6.864a.5.5 0 0 0-.5.5z"
    />
    <path
      fillRule="evenodd"
      d="M11 5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793l-8.147 8.146a.5.5 0 0 0 .708.708L10 6.707V10.5a.5.5 0 0 0 1 0v-5z"
    />
  </svg>
)

const ZoomIcon = () => (
  <svg
    width="1.3em"
    height="1.3em"
    viewBox="0 0 16 16"
    className="inline"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
    />
    <path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z" />
    <path
      fillRule="evenodd"
      d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"
    />
  </svg>
)

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
      <div className="text-right">
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
  srcLow,
  srcMed,
  backgroundColor,
  alt,
  originalWidth,
  originalHeight,
  externalLink,
  userImage,
  userName,
  userLink,
  widthOfContainer,
}) => {
  const [imageRef, isImageInView] = useInView({
    triggerOnce: true,
    rootMargin: '150% 0%',
    trackVisibility: true,
    delay: 100,
  })

  const height = useMemo(
    () =>
      calculateImageHeight(
        widthOfContainer.viewport,
        widthOfContainer.masonry,
        originalWidth,
        originalHeight,
      ),
    [
      widthOfContainer.viewport,
      widthOfContainer.masonry,
      originalWidth,
      originalHeight,
    ],
  )

  const imageProps = {
    alt,
    loading: 'lazy',
    className:
      'text-center text-lg subpixel-antialiased italic font-semibold cursor-pointer object-cover object-center',
    title: alt,
    style: {
      width: '100%',
      height: height,
      backgroundColor: backgroundColor,
      color: invert(backgroundColor), // To highligh alt text color based on background color
      marginTop: '0.5rem',
      marginBottom: '0.5rem',
    },
  }

  return (
    <figure id="image-container" ref={imageRef} className="relative">
      <Link to={`/images/${id}`}>
        {isImageInView ? (
          <img
            {...imageProps}
            src={srcLow}
            srcSet={`${srcLow} 200w, ${srcMed} 400w`}
            sizes="(max-width: 640px) calc(100vw - 0.5rem), (max-width: 768px) 384px, calc(426px - 1.5rem)"
          />
        ) : (
          <img {...imageProps} />
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

const ImagesGrid = ({
  images,
  widthOfContainer,
  isShowingLoader,
  masonryRef,
}) => {
  if (isShowingLoader) {
    return (
      <main className="container mx-auto my-6" ref={masonryRef}>
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
    <main className="container mx-auto my-6" ref={masonryRef}>
      <Masonry
        breakpointCols={MASONRY_BREAKPOINTS}
        className="flex w-auto"
        columnClassName="bg-clip-border mx-1">
        {images.collection.map(imageData => (
          <Image
            key={imageData.id}
            widthOfContainer={widthOfContainer}
            {...imageData}
          />
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
  const imageLowRes = image?.urls?.thumb ?? ''
  const imageMedRes = image?.urls?.small ?? ''
  const imageHighRes = image?.urls?.regular ?? ''
  const imageUltraRes = image?.urls?.full ?? ''
  const imageLink = image?.links?.html ?? ''
  const imageCreator = image?.user?.name ?? ''
  const imageCreatorLink = image?.user?.links?.html ?? ''
  const imageCreatorDP = image?.user?.profile_image?.small ?? ''

  // Filter all those images which doesnt following the conditions
  if (
    imageID.length === 0 ||
    imageLowRes.length === 0 ||
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
      srcLow: null,
      srcMed: null,
      srcHigh: null,
      srcUltra: null,
      externalLink: null,
      userName: null,
      userLink: null,
      userImage: null,
    }
  }

  return {
    id: imageID,
    alt: imageAltText,
    originalHeight: imageHeight,
    originalWidth: imageWidth,
    backgroundColor: imageColor,
    srcLow: imageLowRes,
    srcMed: imageMedRes,
    srcHigh: imageHighRes,
    srcUltra: imageUltraRes,
    externalLink: imageLink,
    userName: imageCreator,
    userLink: imageCreatorLink,
    userImage: imageCreatorDP,
  }
}

const HomePage = () => {
  const networkCancellation = useMemo(() => axios.CancelToken.source(), [])

  const masonryRef = useRef(null)
  const [widthOfContainer, setWidthOfContainer] = useState({
    viewport: 0,
    masonry: 0,
  })

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

  // effect for browser resize
  useEffect(() => {
    function handleBrowserResize() {
      const viewportWidth =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth ||
        0

      const masonryWidth =
        masonryRef?.current?.children?.[0]?.getBoundingClientRect()?.width ?? 0

      // skip resetting if values didnt change
      if (
        widthOfContainer.viewport === viewportWidth &&
        widthOfContainer.masonry === masonryWidth
      ) {
        return
      }
      // console.log('resize', viewportWidth, masonryWidth)

      setWidthOfContainer({ viewport: viewportWidth, masonry: masonryWidth })
    }

    if (typeof window !== undefined) {
      // Add resize event listerer for recalculating image height based on width change
      window.addEventListener('resize', handleBrowserResize)
      handleBrowserResize()
    }

    // clean up functions
    return () => {
      if (typeof window !== undefined) {
        window.removeEventListener('resize', handleBrowserResize)
      }
    }
  }, [])

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
      <ImagesGrid
        masonryRef={masonryRef}
        images={images}
        widthOfContainer={widthOfContainer}
        isShowingLoader={isShowingLoader}
      />
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
