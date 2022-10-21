import Renderer from "./render.js"

const watch = process.argv.includes("watch")

const config = {
  src: "./src",
  dist: "./dist",

  port: 8080,

  files: {
    data: ["data.js"],
    templates: ["pug", "md", "page.js"],
    ignored: /(^|[\/\\])[\._]/,
  },
}

const render = new Renderer(config)

if (watch) {
  render.watch()
} else {
  render.build()
}
