const GalleryClassName = 'gallery'
const GalleryDraggableClassName='gallery-draggable'
const GalleryLineClassName = 'gallery-line'
const GallerySlideClassName = 'gallery-slide'


class Gallery {
    constructor(element, options = {}) {
        this.containerNode = element//траляля
        this.size = element.childElementCount//количество чилдов в родителе(size это траляля назначаем сами)
        this.currentSlide = 0//сами назначили свойство currentSlide
        this.currentSlideWasChanged=false
        this.settings={
            margin: options.margin||0
        }

        this.manageHTML = this.manageHTML.bind(this)//чтобы при вызове метода не слетали контексты баиндим
        this.setParameters = this.setParameters.bind(this)
        this.setEvents = this.setEvents.bind(this)
        this.resizeGallery = this.resizeGallery.bind(this)
        this.startDrag = this.startDrag.bind(this)
        this.stopDrag = this.stopDrag.bind(this)
        this.dragging = this.dragging.bind(this)
        this.setStylePosition = this.setStylePosition.bind(this)

        this.manageHTML()
        this.setParameters()
        this.setEvents()
    }

    manageHTML() {
        this.containerNode.classList.add(GalleryClassName)
        this.containerNode.innerHTML = `
        <div class="${GalleryLineClassName}">
        ${this.containerNode.innerHTML}
        </div>`
        this.lineNode = this.containerNode.querySelector(`.${GalleryLineClassName}`)//для удобной манипуляции
        this.slideNodes = Array.from(this.lineNode.children).map((childNode) =>
            wrapElementByDiv({
                element: childNode,
                className: GallerySlideClassName
            })
        )
    }
    setParameters() {
        const coordsContainer = this.containerNode.getBoundingClientRect()
        this.width = coordsContainer.width
        this.maximumX=-(this.size-1)*(this.width+this.settings.margin)
        this.x = -this.currentSlide * (this.width+this.settings.margin)
        
   this.resetStyleTransition()
        this.lineNode.style.width = `${this.size * (this.width+this.settings.margin)}px`    
   this.setStylePosition
        Array.from(this.slideNodes).forEach((el) => {
            el.style.width = `${this.width}px`
            el.style.marginRight=`${this.settings.margin}px`
        })
    }

    setEvents() {
        this.debouncedResizeGallery = debounce(this.resizeGallery)
        window.addEventListener('resize', this.debouncedResizeGallery)
        this.lineNode.addEventListener('pointerdown', this.startDrag)//опускаем указатель (мышка,палец)
        window.addEventListener('pointerup', this.stopDrag)//поднимаем указатель (остановкаа)
    window.addEventListener('pointercancel',this.startDrag)
    }

    destroyEvents() {
        window.removeEventListener('resize', this.debouncedResizeGallery)
        this.lineNode.removeEventListener('pointerdown', this.startDrag)//опускаем указатель (мышка,палец)
        window.removeEventListener('pointerup', this.stopDrag)
        window.removeEventListener('pointercancel',this.startDrag)
    }

    resizeGallery() {
        console.log('resize')
        this.setParameters()
    }

    startDrag(event) {
        this.currentSlideWasChanged=false
        this.clickX = event.pageX
        this.startX = this.x
        this.resetStyleTransition()
        this.containerNode.classList.add(GalleryDraggableClassName)
        window.addEventListener('pointermove', this.dragging)
    }

    stopDrag() {
        window.removeEventListener('pointermove', this.dragging)
      this.x=-this.currentSlide*(this.width+this.settings.margin)
      this.containerNode.classList.remove(GalleryDraggableClassName)
      this.setStylePosition()
      this.setStyleTransition()
    }

    dragging(event) {
        console.log('dragging')
        this.dragX = event.pageX
        const dragShift = this.dragX - this.clickX
        const easing=dragShift/5
        this.x = Math.max(Math.min(this.startX + dragShift,easing),this.maximumX+easing)
        this.setStylePosition()

        //Change active slide
        if (dragShift > 20 &&
            dragShift > 0 &&
            this.currentSlide > 0 &&
            !this.currentSlideWasChanged
        ) {
            this.currentSlideWasChanged = true
            this.currentSlide =this.currentSlide- 1
        }
        if (
            dragShift < -20 &&
            dragShift < 0 &&
            this.currentSlide < this.size-1 &&
            !this.currentSlideWasChanged
        ) {
            this.currentSlideWasChanged = true
            this.currentSlide =this.currentSlide+ 1
        }
        
    }
 

    setStylePosition() {
        this.lineNode.style.transform = `translate3d(${this.x}px,0,0)`
    }

    setStyleTransition(){
        this.lineNode.style.transition=`all 0.25s ease 0s`
    }

    resetStyleTransition(){
        this.lineNode.style.transition=`all 0s ease 0s`
    }
    
}


//Helpers

function wrapElementByDiv({ element, className }) {
    const wrapperNode = document.createElement('div')
    wrapperNode.classList.add(className)

    element.parentNode.append(wrapperNode)
    wrapperNode.append(element)
    return wrapperNode
}

function debounce(func, time = 100) {
    let timer
    return function (event) {
        clearTimeout(timer)
        timer = setTimeout(func, time, event)
    }
}