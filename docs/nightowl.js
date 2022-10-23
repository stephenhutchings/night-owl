/** @type {import('../lib/types').Config} */

import { marked } from "marked"
import posthtml from "posthtml"
import baseUrl from "posthtml-base-url"

const processer = posthtml([baseUrl({ url: "/night-owl", allTags: true })])

const rebase = (content, filename) => {
  if (filename.endsWith(".html")) {
    return processer.process(content).then((res) => res.html)
  } else {
    return content
  }
}

const config = {
  src: "./src",

  data: "./src/_data/index.js",

  pugOptions: {
    pretty: true,
    filters: {
      md: (content = "") => marked(content),
    },
  },

  markedOptions: {
    smartypants: true,
  },

  copy: [
    {
      src: "src/assets",
      dist: "dist/assets",
      exclude: ".DS_Store",
    },
    // {
    //   src: "../../s-ings.com/src/site/public/assets/fonts/Maestro/",
    //   dist: "dist/assets/fonts",
    //   include: "*.woff2",
    // },
  ],

  watch: ["../README.md"],

  transforms: [rebase],
}

export default config
