import ViewPort from './viewport.js'
import Rectangle from './rectangle.js'
import Point from './point.js'

class Canvas {

  #mousePosition
  #screen
  #buffer
  #resolution
  #viewport
  #children
  #resizeEvent
  #zoomEvent
  #translateEvent
  #dirty

  constructor(elemenId, children) {
    this.dirty = false
    this.resizeEvent = new Rectangle(0, 0)
    this.translateEvent = new Point(0, 0)
    this.zoomEvent = new Point(0, 0, 0)
    this.mousePosition = new Point(-1, -1)
    this.children = children
    const ref = document.getElementById(elemenId)
    this.screen = ref.getContext('bitmaprenderer')
    this.buffer = new OffscreenCanvas(this.screen.canvas.width, this.screen.canvas.height).getContext('2d', { alpha: false, desynchronized: true })
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
    if (this.mousePosition.x === -1 || event.target !== this.screen.canvas) {
      return
    }

    const xDelta = (event.clientX - this.mousePosition.x) / this.viewport.z
    const yDelta = (event.clientY - this.mousePosition.y) / this.viewport.z

    this.mousePosition.x = event.clientX
    this.mousePosition.y = event.clientY

    this.translateEvent.x += xDelta
    this.translateEvent.y += yDelta

    this.dirty = true
  }

  onMouseDown(event) {
    this.mousePosition.x = event.clientX
    this.mousePosition.y = event.clientY
  }

  onMouseUp(event) {
    this.mousePosition.x = -1
    this.mousePosition.y = -1
  }

  onWheel(event) {
    event.preventDefault()

    this.zoomEvent.x = event.clientX
    this.zoomEvent.y = event.clientY

    if (Math.abs(event.deltaY) > 1000) {
      this.zoomEvent.z += event.deltaY > 0 ? 4 : -4
    } else if (Math.abs(event.deltaY) > 100) {
      this.zoomEvent.z += event.deltaY > 0 ? 3 : -3
    } else if (Math.abs(event.deltaY) > 10) {
      this.zoomEvent.z += event.deltaY > 0 ? 2 : -2
    } else {
      this.zoomEvent.z += event.deltaY > 0 ? 1 : -1
    }

    this.dirty = true
  }

  onResize() {
    const wrapper = this.screen.canvas.parentElement
    const nextWidth = wrapper.clientWidth * window.devicePixelRatio
    const nextHeight = wrapper.clientHeight * window.devicePixelRatio

    if (nextWidth !== this.viewport.width || nextHeight !== this.viewport.height) {
      this.resizeEvent.width = wrapper.clientWidth * window.devicePixelRatio
      this.resizeEvent.height = wrapper.clientHeight * window.devicePixelRatio
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
    let viewPortChanged = false
    if (this.resizeEvent.width !== 0) {
      this.screen.canvas.width = this.buffer.canvas.width = this.resolution.width = this.resizeEvent.width
      this.screen.canvas.height = this.buffer.canvas.height = this.resolution.height = this.resizeEvent.height
      this.viewport.width = this.resizeEvent.width / this.viewport.z
      this.viewport.height = this.resizeEvent.height / this.viewport.z
      this.resizeEvent.width = 0
      this.resizeEvent.height = 0
      viewPortChanged = true
    }

    if (this.zoomEvent.z !== 0) {
      let nextScale = this.zoomEvent.z > 0
        ? this.viewport.z * Math.pow(1.03, this.zoomEvent.z)
        : this.viewport.z / Math.pow(1.03, -this.zoomEvent.z)

      const MIN_ZOOM = 0.25
      const MAX_ZOOM = 2.5

      nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextScale))

      if (nextScale !== this.viewport.z) {
        const x = this.zoomEvent.x - this.resolution.x / 2
        const y = this.zoomEvent.y - this.resolution.y / 2
        const zoomX = (x - this.viewport.x * this.viewport.z) / this.viewport.z
        const zoomY = (y - this.viewport.y * this.viewport.z) / this.viewport.z

        this.viewport.z = nextScale
        this.viewport.x = (-zoomX * this.viewport.z + x) / this.viewport.z
        this.viewport.width = this.resolution.width / this.viewport.z
        this.viewport.y = (-zoomY * this.viewport.z + y) / this.viewport.z
        this.viewport.height = this.resolution.height / this.viewport.z
      }

      this.zoomEvent.x = 0
      this.zoomEvent.y = 0
      this.zoomEvent.z = 0
      viewPortChanged = true
    }

    if (this.translateEvent.x !== 0) {
      this.viewport.x += this.translateEvent.x
      this.viewport.y += this.translateEvent.y
      this.translateEvent.x = 0
      this.translateEvent.y = 0
      viewPortChanged = true
    }

    this.buffer.imageSmoothingEnabled = false

    if (viewPortChanged) {
      const scale = window.devicePixelRatio * this.viewport.z
      this.buffer.setTransform(scale, 0, 0, scale, this.viewport.x * scale, this.viewport.y * scale)
    }

    this.children.forEach((child) => {
      child.render(this.viewport, this.buffer, currentTime)
    })
    this.dirty = false
    this.render()
  }

}

export default Canvas;
