import fs from "fs"
import path from "path"
import pug from "pug"
import { marked } from "marked"
import gm from "gray-matter"

import { log } from "../utils/logger.js"
import getURL from "../utils/getURL.js"
import slugify from "../utils/slugify.js"
import load from "../utils/load.js"

const getPage = (inputPath, url, config) => {
  let outputPath = path.join(config.dist, url)

  if (path.extname(outputPath) === "") {
    outputPath = path.join(outputPath, "index.html")
  }

  url = url.split(path.sep).join("/")

  if (url[0] !== "/") url = "/" + url

  return {
    url,
    inputPath,
    outputPath,
  }
}

// Some templates, like Markdown files, use a layout.
// Compiling layouts is expensive, so they are only compiled when
// they (or one of their dependencies) changes.
const layoutCache = {}

/**
 * @typedef {object} Template
 * @property {string} filename - Name of the template file
 * @property {string} content - Content of the template file
 * @property {function} render - Method to render page content
 * @property {array} dependencies - List of files that the template depends on
 * @property {array} pages - List of pages to render
 *
 */

/**
 *
 * @param {string} filename - Name of the file
 * @param {object} config - NightOwl config
 * @returns {Template}
 */
export default async (filename, config, useLayoutCache = false) => {
  try {
    const content = await fs.promises.readFile(filename, "utf8")
    const filetype = path.extname(filename).slice(1)

    let template
    let { data, content: str } = gm(content)

    if (filetype === "js") {
      data = await load(filename)
      str = data.content
    }

    const url = data.url ?? getURL(config.src, filename)
    const page = getPage(filename, url, config)

    if (filetype === "md" || filetype === "js") {
      let render
      let dependencies = []

      if (data.layout) {
        let layout
        const filename = path.join(
          config.pugOptions.basedir,
          data.layout + ".pug"
        )

        const content = await fs.promises.readFile(filename, "utf8")

        if (useLayoutCache && layoutCache[filename]) {
          layout =
            layoutCache[filename].content === content && layoutCache[filename]
        }

        if (!layout) {
          layout = {
            content,
            render: pug.compile(content, {
              filename,
              ...config.pugOptions,
            }),
          }
        }

        layoutCache[filename] = layout

        render = layout.render
        dependencies = [filename, ...layout.render.dependencies]
      } else {
        render = data.render || ((data) => data.content)
      }

      data = { ...data, content: str }

      template = {
        render,
        content,
        filename,
        dependencies,
      }
    }

    if (filetype === "pug") {
      const render = pug.compile(str, {
        filename,
        ...config.pugOptions,
      })

      template = {
        render,
        content,
        filename,
        dependencies: render.dependencies,
      }
    }

    if (data.pages) {
      template.pages = data.pages.map((item, i) => {
        const slug = item.slug ?? slugify(item.title || (i + 1).toString())
        const url = path.join(page.url, slug)
        const parent = { ...data }

        delete parent.pages

        if (item.layout) {
          log(`Ignoring layout "${item.layout}" in ${template.filename}`)
          log(`Page items cannot specify custom layouts\n`)
        }

        return {
          page: getPage(page.inputPath, url, config),
          data: { ...parent, ...item },
        }
      })
    } else {
      template.pages = [{ page, data }]
    }

    template.pages
      .filter((item) => item.data.content)
      .forEach(
        (item) =>
          (item.data.content = marked(item.data.content, config.markedOptions))
      )

    return template
  } catch (err) {
    log(`Failed to compile template ${filename}`)
    console.error(err)
  }
}
