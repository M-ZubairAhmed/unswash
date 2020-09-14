import React, { useEffect, useMemo, useState, useRef } from 'react'
import axios from 'axios'
import Masonry from 'react-masonry-css'
import invert from 'invert-color'
import { useInView } from 'react-intersection-observer'

const MASONRY_BREAKPOINTS = {
  default: 3,
  1024: 3,
  768: 2,
  640: 1,
}

const LogoBar = () => (
  <div className="w-full text-center flex justify-center flex-col py-6">
    <h1 className="text-6xl text-gray-600 font-extrabold">Unswash</h1>
    <p className="text-purple-800 italic font-semibold">
      Discover breathtaking images
    </p>
  </div>
)

const SearchBar = () => (
  <div className="w-full sticky top-0 right-0 left-0 shadow-md p-3 bg-white z-50">
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

const Image = ({
  srcLow,
  srcMed,
  srcHigh,
  srcUltra,
  backgroundColor,
  alt,
  originalWidth,
  originalHeight,
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
      'text-center text-lg subpixel-antialiased italic font-semibold cursor-pointer',
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
    <figure ref={imageRef} className="relative group">
      {isImageInView ? (
        <img {...imageProps} src={srcMed} />
      ) : (
        <img {...imageProps} />
      )}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none bg-black bg-opacity-25 hover:bg-white">
        hello
      </div>
    </figure>
  )
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
  const isImageAnAdd = image && image.sponsorship === null ? false : true

  // Filter all those images which doesnt following the conditions
  if (
    imageID.length === 0 ||
    imageLowRes.length === 0 ||
    isImageAnAdd === true ||
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

  const [images, setImages] = useState([])
  const [pageNumber, setPageNumber] = useState(1)

  const imageContainerRef = useRef(null)
  const [widthOfContainer, setWidthOfContainer] = useState({
    viewport: 0,
    masonry: 0,
  })

  const [loadMoreRef, isLoadMoreInView] = useInView({
    rootMargin: '150% 0%',
    trackVisibility: true,
    delay: 100,
  })

  function handleBrowserResize() {
    const viewportWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth ||
      0

    const masonryWidth =
      imageContainerRef?.current?.children?.[0]?.getBoundingClientRect()
        ?.width ?? 0

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

  // effect running on first mount of component for browser resize
  useEffect(() => {
    if (typeof window !== undefined) {
      // Add resize event listerer for recalculating image height based on width change
      window.addEventListener('resize', handleBrowserResize)
      handleBrowserResize()
    }

    // clean up functions
    return () => {
      console.log('unm1')
      if (typeof window !== undefined) {
        window.removeEventListener('resize', handleBrowserResize)
      }
    }
  }, [])

  async function doFetchImages(searchKey = '', pageNumber) {
    const isSearchActive = searchKey.trim().length !== 0
    const listImagesSubroute = isSearchActive ? '/search/photos' : '/photos'

    const listImagesURL = new URL(listImagesSubroute, process.env.API_BASE_URL)

    listImagesURL.searchParams.append('page', pageNumber)
    listImagesURL.searchParams.append('per_page', '20')
    listImagesURL.searchParams.append('content_filter', 'high')
    if (isSearchActive) {
      listImagesURL.searchParams.append('query', '')
    }

    try {
      const response = await axios({
        method: 'GET',
        url: listImagesURL.toString(),
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
        setImages([])
      } else {
        const imagesFromAPI = responseData
          .map(responseDatum => parseImageDataFromAPI(responseDatum))
          .filter(parsedImage => parsedImage.id !== null)

        setImages(images => [...images, ...imagesFromAPI])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    // Function call for the unspash api based on search or random photos
    doFetchImages('', pageNumber)
  }, [pageNumber])

  function handleLoadMore() {
    setPageNumber(previousPageNumber => previousPageNumber + 1)
  }

  useEffect(() => {
    if (isLoadMoreInView) {
      console.log('load more')
      handleLoadMore()
    }
  }, [isLoadMoreInView])

  return (
    <>
      <LogoBar />
      <SearchBar />
      <div className="container mx-auto my-6" ref={imageContainerRef}>
        <Masonry
          breakpointCols={MASONRY_BREAKPOINTS}
          className="flex w-auto"
          columnClassName="bg-clip-border mx-1">
          {images.map(imageData => (
            <Image
              key={imageData.id}
              widthOfContainer={widthOfContainer}
              {...imageData}
            />
          ))}
        </Masonry>
        <div className="text-center py-6">
          <button
            ref={loadMoreRef}
            className="text-gray-500 text-xl hover:underline"
            onClick={handleLoadMore}>
            Load more
          </button>
        </div>
      </div>
    </>
  )
}

export default HomePage
