/** @type {import('../lib/types').Config} */

import { marked } from "marked"

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
    {
      src: "../../s-ings.com/src/site/public/assets/fonts/Maestro/",
      dist: "dist/assets/fonts",
      include: "*.woff2",
    },
  ],

  watch: ["../README.md"],
}

export default config
