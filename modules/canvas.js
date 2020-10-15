import ViewPort from './viewport.js'
import Rectangle from './rectangle.js'
import Point from './point.js'

class Canvas {

  #isDragging
  #mousePosition
  #screen
  #buffer
  #pixelRatio
  #resolution
  #viewport
  #children
  #resizeEvent
  #dirty

  constructor(elemenId, children) {
    this.dirty = false
    this.resizeEvent = null
    this.isDragging = null
    this.mousePosition = new Point(0, 0)
    this.children = children
    const ref = document.getElementById(elemenId)
    this.screen = ref.getContext('bitmaprenderer')
    this.buffer = new OffscreenCanvas(this.screen.canvas.width, this.screen.canvas.height).getContext('2d', { alpha: false, desynchronized: true })
    this.pixelRatio = window.devicePixelRatio
    this.render = this.render.bind(this)
    this.onResize = this.onResize.bind(this)
    this.resolution = new Rectangle(0, 0, this.buffer.canvas.width, this.buffer.canvas.height)
    this.viewport = new ViewPort(0, 0, 1, this.resolution.width, this.resolution.height)
    window.addEventListener('resize', this.onResize)
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false })
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('mousedown', this.onMouseDown.bind(this))
    window.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.onResize()
  }

  onMouseMove(event) {
    if (!this.isDragging || event.target !== this.screen.canvas) {
      return
    }

    const xDelta = (event.clientX - this.mousePosition.x) / this.viewport.z
    const yDelta = (event.clientY - this.mousePosition.y) / this.viewport.z

    this.mousePosition.x = event.clientX
    this.mousePosition.y = event.clientY

    this.viewport.x += xDelta
    this.viewport.y += yDelta
    this.dirty = true
  }

  onMouseDown(event) {
    this.isDragging = true
    this.mousePosition.x = event.clientX
    this.mousePosition.y = event.clientY
  }

  onMouseUp(event) {
    this.isDragging = false
  }

  onResize() {
    const wrapper = this.screen.canvas.parentElement
    const nextWidth = wrapper.clientWidth * this.pixelRatio
    const nextHeight = wrapper.clientHeight * this.pixelRatio

    if (nextWidth !== this.viewport.width || nextHeight !== this.viewport.height) {
      this.resizeEvent = {
        width: wrapper.clientWidth * this.pixelRatio,
        height: wrapper.clientHeight * this.pixelRatio,
      }
      this.dirty = true
    }
  }

  render() {
    this.screen.imageSmoothingEnabled = false
    this.screen.transferFromImageBitmap(this.buffer.canvas.transferToImageBitmap())
  }

  update(currentTime) {
    if (!this.dirty) {
      return
    }
    if (this.resizeEvent) {
      this.screen.canvas.width = this.buffer.canvas.width = this.resolution.width = this.resizeEvent.width
      this.screen.canvas.height = this.buffer.canvas.height = this.resolution.height = this.resizeEvent.height
      this.viewport.width = this.resizeEvent.width / this.viewport.z
      this.viewport.height = this.resizeEvent.height / this.viewport.z
      this.resizeEvent = null
    }

    this.buffer.imageSmoothingEnabled = false
    const scale = this.pixelRatio * this.viewport.z
    this.buffer.setTransform(scale, 0, 0, scale, this.viewport.x * scale, this.viewport.y * scale)
    this.children.forEach((child) => {
      child.render(this.viewport, this.buffer, currentTime)
    })
    this.dirty = false
    this.render()
  }

  onWheel(event) {
    event.preventDefault()
    let nextScale = this.viewport.z
    const MIN_ZOOM = 0.25
    const MAX_ZOOM = 2.5

    if (Math.abs(event.deltaY) > 1000) {
      nextScale = event.deltaY > 0
        ? this.viewport.z * Math.pow(1.03, 4)
        : this.viewport.z / Math.pow(1.03, 4)
    } else if (Math.abs(event.deltaY) > 100) {
      nextScale = event.deltaY > 0
        ? this.viewport.z * Math.pow(1.03, 3)
        : this.viewport.z / Math.pow(1.03, 3)
    } else if (Math.abs(event.deltaY) > 10) {
      nextScale = event.deltaY > 0
        ? this.viewport.z * Math.pow(1.03, 2)
        : this.viewport.z / Math.pow(1.03, 2)
    } else {
      nextScale = event.deltaY > 0
        ? this.viewport.z * Math.pow(1.03, 1)
        : this.viewport.z / Math.pow(1.03, 1)
    }

    nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextScale))

    if (nextScale === this.viewport.z) {
      return
    }

    const x = event.clientX - this.resolution.x / 2
    const y = event.clientY - this.resolution.y / 2
    const zoomX = (x - this.viewport.x * this.viewport.z) / this.viewport.z
    const zoomY = (y - this.viewport.y * this.viewport.z) / this.viewport.z

    this.viewport.z = nextScale
    this.viewport.x = (-zoomX * this.viewport.z + x) / this.viewport.z
    this.viewport.width = this.resolution.width / this.viewport.z
    this.viewport.y = (-zoomY * this.viewport.z + y) / this.viewport.z
    this.viewport.height = this.resolution.height / this.viewport.z
    this.dirty = true
  }

}

export default Canvas;
