/** @type {import('night-owl/lib/types').Config} */

import { marked } from "marked"
import html from "./utils/transforms/html-prod.js"

const dev = process.env.NODE_ENV === "dev"
const transforms = []

if (!dev) transforms.push(html)

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

  transforms,
}

export default config
