export const scrollToTop = () => {
  if (document && typeof document !== 'undefined') {
    const topScrollElement = document.getElementById('SCROLL-TO-TOP-ELEMENT')

    topScrollElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  }
}
