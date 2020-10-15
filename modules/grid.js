
class Grid {

  #size

  constructor(size) {
    this.size = size
  }

  render(viewport, buffer) {
    const x1 = -viewport.x
    const y1 = -viewport.y
    const width = buffer.canvas.width / viewport.z
    const height = buffer.canvas.height / viewport.z

    buffer.fillStyle = "white"
    buffer.fillRect(x1, y1, width, height)

    const xOffset = x1 % this.size
    const yOffset = y1 % this.size

    buffer.lineWidth = ((viewport.z / 3) + 0.2) / viewport.z

    buffer.beginPath()
    let x = 0.5 -xOffset
    let y = 0.5 -yOffset

    while (x < width) {
      buffer.moveTo(x1 + x, y1)
      buffer.lineTo(x1 + x, y1 + height)
      x += this.size
    }
    while (y < height) {
      buffer.moveTo(x1, y1 + y)
      buffer.lineTo(x1 + width, y1 + y)
      y += this.size
    }

    buffer.strokeStyle = "#777"
    buffer.stroke()

    buffer.fillStyle = "red"
    buffer.fillRect(10, 10, this.size, this.size)

    buffer.fillStyle = "red"
    buffer.fillRect(50, 10, this.size, this.size)

    buffer.fillStyle = "red"
    buffer.fillRect(10, 50, this.size, this.size)
  }

}

export default Grid;
