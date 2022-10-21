import fs from "fs"
import path from "path"
import pug from "pug"
import { marked } from "marked"
import gm from "gray-matter"

import * as utils from "../utils/index.js"

const layoutCache = []

export default async function compile(
  filename,
  templates,
  config,
  useCache = true
) {
  if (!utils.isTemplate(filename, config.templateRx)) {
    return
  }

  const content = await fs.promises.readFile(filename, "utf8")
  const filetype = path.extname(filename).slice(1)
  const cached = templates && templates.find((t) => t.filename === filename)

  // If content is unchanged, use the cache
  if (useCache && cached?.content === content) {
    return cached
  }

  try {
    let template
    let { data, content: str } = gm(content)

    if (filetype === "js") {
      data = await utils.load(filename)
      str = data.content ?? ""
    }

    data.url ??= utils.getURL(config.src, filename)

    if (data.pages) {
      data.pages
        .filter((item) => item.content)
        .forEach((item) => (item.content = marked(item.content)))
    }

    if (filetype === "md" || filetype === "js") {
      let render, dependencies

      if (data.layout) {
        const layoutname = path.join(config.src, data.layout + ".pug")
        const layout = await compile(layoutname, layoutCache, config)

        render = layout.render
        dependencies = [layoutname, ...layout.dependencies]
      } else {
        render = (str) => str
      }

      template = {
        render,
        content,
        filename,
        dependencies,
        data: { ...data, content: marked(str) },
      }
    }

    if (filetype === "pug") {
      const render = pug.compile(str, { basedir: config.src, filename })

      const js = path.format({
        dir: path.dirname(filename),
        name: path.basename(filename, ".pug"),
        ext: ".js",
      })

      if (fs.existsSync(js)) {
        utils.log(`Loading page data from ${js}`)

        render.dependencies.push(js)

        await utils.time(`Import module ${js}`, async () =>
          Object.assign(data, await utils.load(js))
        )
      }

      template = {
        render,
        content,
        filename,
        dependencies: render.dependencies,
        data,
      }
    }

    if (templates) {
      if (cached) {
        templates[templates.indexOf(cached)] = template
      } else {
        templates.push(template)
      }
    }

    return template

    if (data.pages) {
      return data.pages.map((item) => {})
      for (const item of data.pages) {
        const base = path.basename(filename).replace(config.templateRx, "")

        item.slug ??= utils.slug(item.title)
        item.url ??= utils.getURL(
          config.src,
          path.join(
            path.dirname(filename),
            base !== "index" ? base : "",
            item.slug,
            "index.html"
          )
        )

        await write(config.dist, item.url, render({ ...globals, ...item }))
      }
    } else {
      return (templates[filename] = template)
    }
  } catch (error) {
    console.error(`Failed to compile ${filename}`)
    console.error(error)
    return
  }
}
