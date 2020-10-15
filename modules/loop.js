
class Loop {

  #lastTime
  #FPS
  #children

  constructor(fps, children) {
    this.children = children
    this.FPS = fps
    this.lastTime = window.performance.now()
    this.run = this.run.bind(this)
  }

  run(now) {
    requestAnimationFrame(this.run)
    const delta = now - this.lastTime
    const interval = 1000 / this.FPS

    if (delta > interval) {
      this.children.forEach((child) => {
        child.update(now)
      })
      this.lastTime = now - (delta - ((delta / interval) | 0) * interval)
    }
  }

}

export default Loop;
