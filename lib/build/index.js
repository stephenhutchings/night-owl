import fs from "fs"
import path from "path"
import * as utils from "../utils/logger.js"

import compile from "../templates/compile.js"
import render from "../templates/render.js"
import list from "../templates/list.js"

export const getFiles = async function (dir, result = []) {
  const list = await fs.promises.readdir(dir, { withFileTypes: true })

  for (const item of list) {
    const child = path.resolve(dir, item.name)
    if (item.isDirectory()) {
      result = await getFiles(child, result)
    } else {
      result = [...result, child]
    }
  }

  return result
}

export default async (config) =>
  utils
    .time("Build", async () => {
      const files = await getFiles(config.src)

      return Promise.all(
        files
          .map((file) => path.relative(".", file))
          .filter((file) => config.isTemplate(file))
          .map((file) => {
            return new Promise((res) => compile(file, config, true).then(res))
          })
      )
    })
    .then(async (result) => {
      const templates = list(result.filter((template) => template))

      await render(templates, config)

      return templates
    })
