import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import invert from 'invert-color'
import { Dialog } from '@reach/dialog'

import Header from '_common/header'
import { scrollToTop } from '_common/utilities'

import BackArrowIcon from '_icons/back-arrow.svg'
import ExternalLinkIcon from '_icons/ext-link.svg'
import DownloadIcon from '_icons/download.svg'
import ShareIcon from '_icons/share.svg'

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

function getShareURLs(imageID) {
  if (imageID && imageID.length === 0) {
    return {
      twitter: '',
      linkedin: '',
      whatsapp: '',
    }
  }

  const share = {
    twitter: `https://twitter.com/intent/tweet?url=https%3A%2F%2Funswash.netlify.app%2Fimages%2F${imageID}&via=Md_ZubairAhmed&text=Check%20out%20this%20photo%20on%20Unswash%20-%20an%20open%20source%20clone%20of%20Unsplash&hashtags=%23opensource%20%23unsplash%20%23image`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Funswash.netlify.app%2F${imageID}`,
    whatsapp: `https://api.whatsapp.com/send?text=Check%20out%20this%20photo%20on%20Unswash%20-%20an%20open%20source%20clone%20of%20Unsplash.%20https%3A%2F%2Funswash.netlify.app%2F${imageID}`,
  }

  return share
}

const BackButton = ({ externalLink = '' }) => (
  <nav className="container mx-auto my-6 flex justify-between px-2">
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
      Open <ExternalLinkIcon className="inline-block text-md" />
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
  originalHeight = 1,
  originalWidth = 1,
}) => {
  const imageHeight = (originalHeight / originalWidth) * 100

  if (
    src.webpLow.length === 0 ||
    src.webpHigh.length === 0 ||
    src.jpgHigh.length === 0 ||
    src.jpgLow.length === 0
  ) {
    return null
  }

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
          srcSet={`${src.jpgLow} 800w, ${src.jpgHigh} 1080w`}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 640px, 768px"
          src={src.jpgLow}
          loading="lazy"
          alt={alt}
          className="text-center text-lg italic font-semibold object-cover object-center
          w-full h-auto absolute"
          style={{
            backgroundColor: backgroundColor,
            color: backgroundColor.length !== 0 && invert(backgroundColor),
          }}
        />
      </picture>
    </figure>
  )
}

const ImageBox = ({ isShowingLoader, errorMessage, ...image }) => {
  if (errorMessage.length !== 0) {
    return (
      <main className="container mx-auto my-6 bg-gray-100">
        <div
          className="max-w-screen-sm mx-auto min-h-full flex justify-center 
      text-center items-center min-h-screen-25">
          <h1 className="text-3xl text-gray-700 ">{errorMessage}</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto my-6 bg-gray-100">
      <div className="max-w-screen-sm mx-auto min-h-full">
        {isShowingLoader ? <ImageSkeleton /> : <Image {...image} />}
      </div>
    </main>
  )
}

const ImageDetails = ({
  isShowingLoader,
  errorMessage,
  onShareImage,
  userName,
  userImage,
  userLink,
  description,
  src,
  id,
  location,
}) => {
  if (errorMessage.length !== 0 || isShowingLoader) {
    return null
  }

  let imageDescription = null
  if (description.length !== 0) {
    imageDescription = (
      <div className="text-center mt-3 mb-10">
        {imageDescription}

        <figcaption className="text-gray-700 text-2xl font-bold">
          {description}
        </figcaption>
      </div>
    )
  }

  let displayPicture = null
  if (userImage && userImage.length !== 0) {
    displayPicture = (
      <a href={userLink} rel="noopener noreferrer" target="_blank">
        <img
          src={userImage}
          alt="user"
          loading="lazy"
          title=""
          className="h-8 w-8 object-cover rounded-full bg-white object-cover object-center border border-gray-400"
        />
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
        className="font-semibold tracking-wide text-gray-900 truncate ml-4 hover:text-gray-600"
        title={userName}>
        {userName}
      </a>
    )
  }

  let locationName = null
  if (location.length !== 0) {
    locationName = <p className="flex items-center ml-4 text-sm">{location}</p>
  }

  return (
    <div className="container mx-auto mt-12 mb-20">
      {imageDescription}
      <div className=" flex flex-col md:flex-row xl:flex-row flex-wrap justify-between">
        <div className="flex-grow px-2">
          <div className="flex flex-row items-center mb-6">
            {displayPicture}
            <div>
              {displayName}
              {locationName}
            </div>
          </div>
        </div>
        <div className="flex-grow md:flex-grow-0 xl:flex-grow-0 flex flex-col px-2 mb-4">
          <a
            href={src.download}
            download={`photo-${id}`}
            rel="noopener noreferrer"
            target="_blank"
            className="hover:bg-purple-700 border transition-colors duration-300
            ease-in-out text-white py-2 px-4 rounded flex justify-center
            bg-purple-800 border-purple-600 mb-4">
            <DownloadIcon className="mr-4 text-lg" />
            Download
          </a>
          <button
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 
            border border-gray-400 rounded flex justify-center"
            onClick={onShareImage}>
            <ShareIcon className="mr-4 text-lg" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}

const ImageView = () => {
  const networkCancellation = useMemo(() => axios.CancelToken.source(), [])

  const { imageID } = useParams()

  const [image, setImage] = useState(INITIAL_IMAGE)

  const [isShowingLoader, setLoaderTo] = useState(true)
  const [errorMessage, throwErrorMessage] = useState('')

  const [shouldShowShareDialog, toggleShareDialog] = useState(false)
  const [copiedStatus, setCopiedStatus] = useState('')

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
    const jpgOriginal = `${imageOriginalURL}&fm=jpg`

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
        download: jpgOriginal,
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
          throwErrorMessage("Image doesn't exist.")
        } else {
          const imageFromAPI = parseImageDataFromAPI(responseData)
          if (imageFromAPI.id === null) {
            throwErrorMessage("Image doesn't exist.")
          } else {
            setImage(imageFromAPI)
          }
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
            throwErrorMessage("Image doesn't exist.")
          }
        } else {
          throwErrorMessage("Image doesn't exist.")
          setLoaderTo(false)
        }
      }
    }

    scrollToTop()
    doFetchImage(imageID)

    // network cancellation effect when page transitions
    return () => {
      networkCancellation.cancel('Network cancel')
    }
  }, [])

  function onShareImage(event) {
    event.preventDefault()

    // native sharing is supported
    if (navigator.share) {
      try {
        navigator.share({
          title: 'Unswash',
          text: 'Check out this photo on Unswash',
          url: `https://unswash.netlify.app/images/${imageID}`,
        })
      } catch (err) {
        console.error(err, '> Share dialog error')
      }
    } else {
      openShareDialog()
    }
  }

  function openShareDialog() {
    toggleShareDialog(true)
  }

  function closeShareDialog() {
    toggleShareDialog(false)
    setCopiedStatus('')
  }

  async function copySelfURL() {
    try {
      await navigator.clipboard.writeText(
        `https://unswash.netlify.app/images/${imageID}`,
      )
      setCopiedStatus('Copied')
    } catch (err) {
      // clipboard api not supported
      console.error(err)
      setCopiedStatus('Select and copy the link above')
    }
  }

  return (
    <>
      <Header />
      <BackButton externalLink={image.externalLink} />
      <ImageBox
        isShowingLoader={isShowingLoader}
        errorMessage={errorMessage}
        {...image}
      />
      <ImageDetails
        isShowingLoader={isShowingLoader}
        errorMessage={errorMessage}
        onShareImage={onShareImage}
        {...image}
      />
      <Dialog
        isOpen={shouldShowShareDialog}
        onDismiss={closeShareDialog}
        aria-label="Share the photo with other"
        className="md:w-2/4 xl:w-1/4 max-w-full mx-auto bg-white p-6 outline-none mt-40 
        border shadow-lg border-gray-400 flex flex-col">
        <h1 className="text-2xl font-semibold text-gray-600 mb-4">
          Share this photo
        </h1>
        <div className="flex flex-col justify-center items-center">
          <a
            href={getShareURLs(imageID).linkedin}
            rel="noopener noreferrer"
            target="_blank"
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 
            border border-gray-400 rounded my-2 w-3/4 text-center">
            Linkedin
          </a>
          <a
            href={getShareURLs(imageID).twitter}
            rel="noopener noreferrer"
            target="_blank"
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 
            border border-gray-400 rounded my-2 w-3/4 text-center">
            Twitter
          </a>
          <a
            href={getShareURLs(imageID).whatsapp}
            rel="noopener noreferrer"
            target="_blank"
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 
            border border-gray-400 rounded my-2 w-3/4 text-center">
            Whatsapp
          </a>
          <div className="w-3/4 flex flex-row justify-center items-center">
            <input
              value={`https://unswash.netlify.app/images/${imageID}`}
              className="px-2 py-2 flex-grow rounded rounded-tr-none rounded-br-none overflow-x-visible border bg-gray-200 border-gray-400 whitespace-no-wrap"
            />
            <button
              onClick={copySelfURL}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 
            border border-gray-400 rounded my-2 text-center rounded-tl-none rounded-bl-none">
              Copy
            </button>
          </div>
          <small className="h-4">{copiedStatus}</small>
        </div>
      </Dialog>
    </>
  )
}

export default ImageView
