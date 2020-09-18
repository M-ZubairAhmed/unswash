import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

import Header from '_common/header'
import { Link, useParams } from 'react-router-dom'
import invert from 'invert-color'

import BackArrowIcon from '_icons/back-arrow.svg'
import ExternalLinkIcon from '_icons/ext-link.svg'

const BASE_API_URL = 'https://api.unsplash.com'

const INITIAL_IMAGE = {
  id: '',
  alt: '',
  description: '',
  backgroundColor: '',
  originalHeight: '',
  originalWidth: '',
  src: {
    webpHigh: '',
    webpLow: '',
    jpgHigh: '',
    jpgLow: '',
    download: '',
  },
  externalLink: '',
  userName: '',
  userLink: '',
  userImage: '',
  camera: '',
  location: '',
  views: '',
  likes: '',
}

const BackButton = ({ externalLink = '' }) => (
  <nav className="container mx-auto my-12 flex justify-between">
    <Link
      to="/"
      className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 
    border border-gray-400 rounded">
      <BackArrowIcon className="inline-block text-2xl" /> Back
    </Link>
    <a
      href={externalLink}
      rel="noopener noreferrer"
      target="_blank"
      className={`bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 
      border border-gray-400 rounded
      transition-opacity duration-300 ease-in ${
        externalLink.length === 0 ? 'opacity-0' : 'opacity-100'
      }`}
      title="View image at Unsplash">
      <ExternalLinkIcon className="inline-block text-xl" />
    </a>
  </nav>
)

const ImageSkeleton = () => {
  return (
    <div className="border w-full my-2">
      <div className="animate-pulse">
        <div className={`bg-gray-400 min-h-screen-25`} />
      </div>
    </div>
  )
}

const Image = ({
  src,
  alt,
  backgroundColor,
  originalHeight,
  originalWidth,
}) => {
  const imageHeight = (originalHeight / originalWidth) * 100
  
  return (
    <figure
      style={{
        paddingBottom: `${imageHeight}%`,
        backgroundColor: backgroundColor,
      }}
      className="relative">
      <picture>
        <source
          srcSet={`${src.webpLow} 800w, ${src.webpHigh} 1080w`}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 640px, 768px"
          type="image/webp"
        />
        <img
          srcSet={`${src.jppLow} 800w, ${src.jpgHigh} 1080w`}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 640px, 768px"
          src={src.jpgLow}
          loading="lazy"
          alt={alt}
          className="text-center text-lg italic font-semibold object-cover object-center
          w-full h-auto absolute z-10"
          style={{
            backgroundColor: backgroundColor,
            color: backgroundColor.length !== 0 && invert(backgroundColor),
          }}
        />
      </picture>
    </figure>
  )
}

const ImageBox = ({ isShowingLoader, ...image }) => {
  return (
    <main className="container mx-auto my-6 bg-gray-200">
      <div className="max-w-screen-md mx-auto min-h-full">
        {isShowingLoader ? <ImageSkeleton /> : <Image {...image} />}
      </div>
    </main>
  )
}

const ImageView = () => {
  const networkCancellation = useMemo(() => axios.CancelToken.source(), [])

  const { imageID } = useParams()

  const [image, setImage] = useState(INITIAL_IMAGE)

  const [isShowingLoader, setLoaderTo] = useState(true)

  function parseImageDataFromAPI(image) {
    const NO_ALT_TEXT = '--No alt text provided--'

    const imageID = image?.id ?? ''
    const imageAltText = image?.alt_description ?? NO_ALT_TEXT
    const imageDescription = image?.description ?? ''
    const imageColor = image?.color ?? '#fff'
    const imageOriginalURL = image?.urls?.raw ?? ''
    const imageLink = image?.links?.html ?? ''
    const imageWidth = image?.width ?? 0
    const imageHeight = image?.height ?? 0
    const imageCreator = image?.user?.name ?? ''
    const imageCreatorLink = image?.user?.links?.html ?? ''
    const imageCreatorDP = image?.user?.profile_image?.small ?? ''
    const imageCamera = image?.exif?.make ?? ''
    const imageCameraModel = image?.exif?.model
    const imageLocation = image?.location?.name ?? ''
    const imageViews = image?.views ?? ''
    const imageLikes = image?.likes ?? ''

    if (
      imageID.length === 0 ||
      imageOriginalURL.length === 0 ||
      imageAltText === NO_ALT_TEXT ||
      imageLink.length === 0
    ) {
      return {
        id: null,
        alt: null,
        description: null,
        backgroundColor: null,
        originalHeight: null,
        originalWidth: null,
        src: {
          webpHigh: null,
          webpLow: null,
          jpgHigh: null,
          jpgLow: null,
          download: null,
        },
        externalLink: null,
        userName: null,
        userLink: null,
        userImage: null,
        camera: null,
        location: null,
        views: null,
        likes: null,
      }
    }

    const defaultImageOptions =
      'crop=entropy&fit=max&cs=tinysrgb&auto=compress&q=85'
    const webpHigh = `${imageOriginalURL}&${defaultImageOptions}&w=1080&fm=webp`
    const webpLow = `${imageOriginalURL}&${defaultImageOptions}&w=800&fm=webp`
    const jpgHigh = `${imageOriginalURL}&${defaultImageOptions}&w=1080&fm=jpg`
    const jpgLow = `${imageOriginalURL}&${defaultImageOptions}&w=800&fm=jpg`

    return {
      id: imageID,
      alt: imageAltText,
      description: imageDescription,
      backgroundColor: imageColor,
      originalHeight: imageHeight,
      originalWidth: imageWidth,
      src: {
        webpHigh,
        webpLow,
        jpgHigh,
        jpgLow,
        download: imageOriginalURL,
      },
      externalLink: imageLink,
      userName: imageCreator,
      userLink: imageCreatorLink,
      userImage: imageCreatorDP,
      camera: `${imageCamera} ${imageCameraModel}`.trim(),
      location: imageLocation,
      views: imageViews,
      likes: imageLikes,
    }
  }

  useEffect(() => {
    async function doFetchImage(imageID) {
      const imagesURL = new URL(`/photos/${imageID}`, BASE_API_URL)
      try {
        const response = await axios({
          method: 'GET',
          url: imagesURL.toString(),
          headers: {
            'Content-Type': 'application/json',
            'Accept-Version': 'v1',
            Authorization: `Client-ID ${process.env.API_ACCESS_KEY}`,
          },
          cancelToken: networkCancellation.token,
        })
        const responseData = response?.data ?? {}

        if (Object.keys(responseData).length === 0) {
          // no correct image fror the id available
        } else {
          const imageFromAPI = parseImageDataFromAPI(responseData)

          // setImage(imageFromAPI)
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

    doFetchImage(imageID)

    // network cancellation effect when page transitions
    return () => {
      networkCancellation.cancel('Network cancel')
    }
  }, [])

  return (
    <>
      <Header />
      <BackButton externalLink={image.externalLink} />
      <ImageBox isShowingLoader={isShowingLoader} {...image} />
    </>
  )
}

export default ImageView
