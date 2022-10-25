/** @type {import('night-owl/lib/types').Config} */

import { marked } from "marked"
import hljs from "highlight.js"
import html from "./utils/transforms/html-prod.js"

const dev = process.env.NODE_ENV === "dev"

const transforms = []
if (!dev) transforms.push(html)

const highlight = (code, language) =>
  hljs.highlight(code, language ? { language } : undefined).value

const markedOptions = {
  smartypants: true,
  highlight,
}

const config = {
  data: "./src/_data/index.js",

  pugOptions: {
    pretty: true,
    filters: {
      md: (content = "") => marked(content, markedOptions),
      highlight,
    },
  },

  markedOptions,

  sassOptions: {
    loadPaths: ["./src/styles/"],
  },

  templates: {
    include: ["**/*.@(pug|md|sass|page.js)"],
  },

  copy: [
    {
      src: "src/assets",
      dist: "dist/assets",
      exclude: ".DS_Store",
    },
    dev && {
      src: "../../s-ings.com/src/site/public/assets/fonts/Maestro/",
      dist: "dist/assets/fonts",
      include: "*.woff2",
    },
  ],

  watch: ["../README.md"],

  transforms,
}

export default config
