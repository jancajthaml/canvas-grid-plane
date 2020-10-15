import Loop from './loop.js'
import Canvas from './canvas.js'
import Grid from './grid.js'

const grid = new Grid(20)
const canvas = new Canvas('canvas', [grid])

window.addEventListener("load", function() {
  new Loop(30, [canvas]).run()
})
