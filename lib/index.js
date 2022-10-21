import Renderer from "./render.js"

const watch = process.argv.includes("watch")

const config = {
  src: "./src",
  dist: "./dist",
  ignore: /(^|[\/\\])[\._]/,
  templateRx: /\.(pug|md|page\.js)$/,
  port: 8080,
}

const render = new Renderer(config)

if (watch) {
  render.watch()
} else {
  render.build()
}
