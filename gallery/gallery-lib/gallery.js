const WrapperClassNamme='wrapper'
const WrapperLeft='wrapper-left'
const WrapperRight='wrapper-right'


const GalleryClassName = 'gallery'
const GalleryDraggableClassName = 'gallery-draggable'
const GalleryLineClassName = 'gallery-line'
const GallerySlideClassName = 'gallery-slide'
const GalleryDotsClassName = 'gallery-dots'
const GalleryDotClassName = 'gallery-dot'
const GalleryDotActiveClassName = 'gallery-dot-active'
const GalleryNavClassName = 'gallery-nav'
const GalleryNavLeftClassName = 'gallery-nav-left'
const GalleryNavRightClassName = 'gallery-nav-right'
const GalleryActiveSlideNodClassName='gallery-nod-active'


class Gallery {
    constructor(element, options = {}) {
        this.containerNode = element//траляля
        this.size = element.childElementCount//количество чилдов в родителе(size это траляля назначаем сами)    
        this.currentSlide = 0//сами назначили свойство currentSlide
        this.currentSlideWasChanged = false

//-----------------------------------------------------------------------------------------------------------------bind(this)
        this.manageHTML = this.manageHTML.bind(this)//чтобы при вызове метода не слетали контексты баиндим
        this.setParameters = this.setParameters.bind(this)
        this.setEvents = this.setEvents.bind(this)
        this.resizeGallery = this.resizeGallery.bind(this)
        this.startDrag = this.startDrag.bind(this)
        this.stopDrag = this.stopDrag.bind(this)
        this.dragging = this.dragging.bind(this)
        this.setStylePosition = this.setStylePosition.bind(this)
        this.clickDots = this.clickDots.bind(this)
        this.moveToLeft = this.moveToLeft.bind(this)
        this.moveToRight = this.moveToRight.bind(this)
        this.changeCurrentSlide = this.changeCurrentSlide.bind(this)
        this.changeActiveDotClass = this.changeActiveDotClass.bind(this)
        this.changeActiveSlideNodes=this.changeActiveSlideNodes.bind(this)

        this.manageHTML()
        this.setParameters()
        this.setEvents()
    }

    //--------------------------------------------------------------------------------------------------manageHTML()

    manageHTML() {
        this.containerNode.classList.add(WrapperClassNamme)
        this.containerNode.innerHTML = `
        <div class="${WrapperLeft}"><button class="${GalleryNavLeftClassName}"></button></div>
        <div class="${GalleryClassName}">
        <div class="${GalleryLineClassName}">
        ${this.containerNode.innerHTML}
        </div>
        <div class="${GalleryNavClassName}">
        </div>
        <div class="${GalleryDotsClassName}"></div>
        </div>
        <div class="${WrapperRight}"><button class="${GalleryNavRightClassName}"></button></div>
        `
        this.lineNode = this.containerNode.querySelector(`.${GalleryLineClassName}`)
        this.dotsNode = this.containerNode.querySelector(`.${GalleryDotsClassName}`)

        this.slideNodes = Array.from(this.lineNode.children).map((childNode) =>
            wrapElementByDiv({
                element: childNode,
                className: GallerySlideClassName
            })
        )
        this.dotsNode.innerHTML = Array.from((Array(this.size).keys())).map((key) =>
            `<button class="${GalleryDotClassName} ${key === this.currentSlide ? GalleryDotActiveClassName : ''}"></button>`
        ).join('')

        this.dotNodes = this.dotsNode.querySelectorAll(`.${GalleryDotClassName}`)
        this.navLeft = this.containerNode.querySelector(`.${GalleryNavLeftClassName}`)
        this.navRight = this.containerNode.querySelector(`.${GalleryNavRightClassName}`)  
        this.WrapperRight = this.containerNode.querySelector(`.${WrapperRight}`)
        this.WrapperLeft = this.containerNode.querySelector(`.${WrapperLeft}`)

    }
//------------------------------------------------------------------------------------------------------------setParameters()

    setParameters() {
        const coordsContainer = this.containerNode.getBoundingClientRect()
        this.width = coordsContainer.width*0.8
        this.maximumX = -(this.size - 1) * (this.width )
        this.x = -this.currentSlide * (this.width )

        this.resetStyleTransition()
        this.lineNode.style.width = `${this.size * (this.width )}px`
        this.slideNodes[0].classList.add(GalleryActiveSlideNodClassName)
        this.setStylePosition()
        this.slideNodes.forEach((el) => {
            el.style.width = `${this.width}px` 
        })
    }

    //--------------------------------------------------------------------------------------------------------setEvents()

    setEvents() {
        this.debouncedResizeGallery = debounce(this.resizeGallery)
        window.addEventListener('resize', this.debouncedResizeGallery)
        this.lineNode.addEventListener('pointerdown', this.startDrag)//опускаем указатель (мышка,палец)
        window.addEventListener('pointerup', this.stopDrag)//поднимаем указатель (остановкаа)
        window.addEventListener('pointercancel', this.startDrag)

        this.dotsNode.addEventListener('click', this.clickDots)
        this.navLeft.addEventListener('click', this.moveToLeft)
        this.navRight.addEventListener('click', this.moveToRight)

        
        this.WrapperLeft.addEventListener('click', this.moveToLeft)
        this.WrapperRight.addEventListener('click', this.moveToRight)
       
    }

    //----------------------------------------------------------------------------------------------------------destroyEvents()

    destroyEvents() {
        window.removeEventListener('resize', this.debouncedResizeGallery)
        this.lineNode.removeEventListener('pointerdown', this.startDrag)//опускаем указатель (мышка,палец)
        window.removeEventListener('pointerup', this.stopDrag)
        window.removeEventListener('pointercancel', this.startDrag)

        this.dotsNode.removeEventListener('click', this.clickDots)
        this.navLeft.removeEventListener('click', this.moveToLeft)
        this.navRight.removeEventListener('click', this.moveToRight)
    }

    //---------------------------------------------------------------------------------------------------------resizeGallery()

    resizeGallery() {
        this.setParameters()
    }

    //------------------------------------------------------------------------------------------------------------startDrag()

    startDrag(event) {
        this.currentSlideWasChanged = false
        this.clickX = event.pageX
        this.startX = this.x
        this.resetStyleTransition()
        this.containerNode.classList.add(GalleryDraggableClassName)
        window.addEventListener('pointermove', this.dragging)
    }

    //----------------------------------------------------------------------------------------------------------stopDrag()

    stopDrag() {
        window.removeEventListener('pointermove', this.dragging)
        this.containerNode.classList.remove(GalleryDraggableClassName)
        this.changeCurrentSlide()
    }

    //---------------------------------------------------------------------------------------------------------dragging

    dragging(event) {
        this.dragX = event.pageX
        const dragShift = this.dragX - this.clickX
        const easing = dragShift / 5
        this.x = Math.max(Math.min(this.startX + dragShift, easing), this.maximumX + easing)
        this.setStylePosition()

        //Change active slide
        if (dragShift > 20 &&
            dragShift > 0 &&
            this.currentSlide > 0 &&
            !this.currentSlideWasChanged
        ) {
            this.currentSlideWasChanged = true
            this.currentSlide = this.currentSlide - 1
            
        }
        if (
            dragShift < -20 &&
            dragShift < 0 &&
            this.currentSlide < this.size - 1 &&
            !this.currentSlideWasChanged
        ) {
            this.currentSlideWasChanged = true
            this.currentSlide = this.currentSlide + 1          
        }
    }

    //-------------------------------------------------------------------------------------------clickDots()

    clickDots(event) {
        const dotNode = event.target.closest('button')
        if (!dotNode) {
            return
        }
        let dotNumber
        for (let i = 0; i < this.dotNodes.length; i++) {
            if (this.dotNodes[i] === dotNode) {
                dotNumber = i
                break
            }
        }

        if (dotNumber === this.currentSlide) {
            return
        }
        const countSwipes = Math.abs(this.currentSlide - dotNumber)

        this.currentSlide = dotNumber
        this.changeCurrentSlide(countSwipes)


    }

    //--------------------------------------------------------------------------------------------moveToLeft()

    moveToLeft() {
        if (this.currentSlide <= 0) {
            return
        }
        this.currentSlide = this.currentSlide - 1
        this.changeCurrentSlide()
    }

    //--------------------------------------------------------------------------------------------moveToRight()

    moveToRight() {
        if (this.currentSlide >= this.size - 1) {
            return
        }
        this.currentSlide = this.currentSlide + 1
        this.changeCurrentSlide()
    }

    //------------------------------------------------------------------------------------------changeCurrentSlide()

    changeCurrentSlide(countSwipes) {
        this.x = -this.currentSlide * (this.width )
        this.setStylePosition()
        this.setStyleTransition(countSwipes)
        this.changeActiveDotClass()
        this.changeActiveSlideNodes()
    }

    //-------------------------------------------------------------------------------------changeActiveDotClass()

    changeActiveDotClass() {

        for (let i = 0; i < this.dotNodes.length; i++) {
            this.dotNodes[i].classList.remove(GalleryDotActiveClassName)
        }
        this.dotNodes[this.currentSlide].classList.add(GalleryDotActiveClassName)
    }

    //--------------------------------------------------------------------------------------changeActiveSlideNode()

    changeActiveSlideNodes(){
        for (let i = 0; i < this.slideNodes.length; i++) {
            this.slideNodes[i].classList.remove(GalleryActiveSlideNodClassName)
        }
        this.slideNodes[this.currentSlide].classList.add(GalleryActiveSlideNodClassName)
    }

    //-----------------------------------------------------------------------------------------setStylePosition()

    setStylePosition() {
        this.lineNode.style.transform = `translate3d(${this.x}px,0,0)`
    }

    //-----------------------------------------------------------------------------------------setStyleTransition()

    setStyleTransition(countSwipes=1) {
        this.lineNode.style.transition = `all ${countSwipes*0.25}s ease 0s`
    }

    //-----------------------------------------------------------------------------------------resetStyleTransition()

    resetStyleTransition() {
        this.lineNode.style.transition = `all 0s ease 0s`
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

