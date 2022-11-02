import path from "path"
import deepmerge from "deepmerge"

import getURL from "../utils/getURL.js"
import slugify from "../utils/slugify.js"
import { warn, fail } from "../utils/logger.js"

import getLayout from "./layout.js"

// Template types
import pug from "./types/pug.js"
import sass from "./types/sass.js"
import javascript from "./types/javascript.js"
import markdown from "./types/markdown.js"

const getPage = (inputPath, url, config) => {
  let slash = "/"
  let outputPath = path.join(config.dist, url)

  if (path.extname(outputPath) === "") {
    if (config.trailingSlash) url = path.normalize(url + slash)
    outputPath = path.join(outputPath, "index.html")
  }

  // We have been using `path` methods so far
  // On Windows, we need to fix the slashes
  if (path.sep !== slash) url = url.split(path.sep).join(slash)

  // Everything get a leading slash
  if (url[0] !== slash) url = slash + url

  return {
    url,
    inputPath,
    outputPath,
  }
}

export default async (filename, config, useLayoutCache = false) => {
  try {
    const timestamp = Date.now()
    const filetype = path.extname(filename).slice(1)

    let template

    if (filetype === "sass" || filetype === "scss") {
      template = await sass(filename, config)
    } else if (filetype === "js") {
      template = await javascript(filename, config)
    } else if (filetype === "pug") {
      template = await pug(filename, config)
    } else if (filetype === "md") {
      template = await markdown(filename, config)
    } else {
      throw Error("No compiler for", filetype)
    }

    const url = template.data.url ?? getURL(config.src, filename)
    const page = getPage(filename, url, config)

    // Ensure content is string for cache checking
    template.content = template.content.toString()

    // Overide template with layout
    if (template.data.layout) {
      const layout = await getLayout(
        template.data.layout,
        config,
        useLayoutCache
      )

      template.data = { ...layout.data, ...template.data }
      template.render = layout.render
      template.dependencies.push(layout.filename, ...layout.render.dependencies)
    }

    // For example, a .md or .js template without a layout
    if (!template.render) {
      template.render = (data) => data.content
    }

    if (template.data.pages && template.data.pages.length > 0) {
      template.pages = template.data.pages.map((item, i) => {
        const slug = item.slug ?? slugify(item.title || (i + 1).toString())
        const url = item.url ?? path.join(page.url, slug)

        // Child pages extend the parent's data, but there is no need
        // to copy the `pages` property down to the child.
        const parent = { ...template.data }
        delete parent.pages

        if (item.layout) {
          warn(`Ignoring layout ${item.layout} in ${template.filename}`)
          warn(`Page items cannot specify custom layouts`)
        }

        return {
          render: item.render || template.render,
          page: getPage(page.inputPath, url, config),
          data: deepmerge(parent, item),
        }
      })
    } else {
      template.pages = [{ page, render: template.render, data: template.data }]
    }

    delete template.data
    delete template.render

    template.pages.forEach((item) => {
      delete item.data.render

      if (item.data.date) {
        const date = new Date(item.data.date)
        if (Number.isInteger(+date)) item.data.date = date
        else warn(`Invalid date format "${item.data.date}" in ${filename}`)
      }
    })

    if (Date.now() - timestamp > 100) {
      warn(`${filename} took ${Date.now() - timestamp}ms to compile`)
    }

    return template
  } catch (err) {
    fail(`Failed to compile ${filename}`, err)
  }
}
