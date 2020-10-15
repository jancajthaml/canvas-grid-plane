
class Grid {

  #size

  constructor(size) {
    this.size = size
  }

  render(viewport, buffer) {
    let x1 = -viewport.x
    let y1 = -viewport.y
    let width = buffer.canvas.width / viewport.z
    let height = buffer.canvas.height / viewport.z

    buffer.fillStyle = "white"
    buffer.fillRect(x1, y1, width, height)

    let x = 0.5 - (x1 % this.size)
    let y = 0.5 - (y1 % this.size)

    buffer.beginPath()

    width += x1
    x += x1
    while (x < width) {
      buffer.moveTo(x, y1)
      buffer.lineTo(x, y1 + height)
      x += this.size
    }

    height += y1
    x -= x1
    y += y1
    while (y < height) {
      buffer.moveTo(x1, y)
      buffer.lineTo(x1 + width, y)
      y += this.size
    }

    buffer.lineWidth = ((viewport.z / 3) + 0.2) / viewport.z
    buffer.strokeStyle = "#777"
    buffer.stroke()

    for (let i = 0 ; i < 200 ; i+= 1) {
      for (let j = 0 ; j < 200 ; j+= 1) {
        buffer.fillStyle = "red"
        buffer.fillRect(1+40*i, 1+40*j, this.size-1, this.size-1)
      }
    }

  }

}

export default Grid;
