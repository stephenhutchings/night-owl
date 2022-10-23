import fs from "fs"
import path from "path"

import { time } from "../utils/logger.js"
import copy from "../utils/copy.js"
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
  time("Build", async () => {
    const files = await getFiles(config.src)

    await time("Copy", () =>
      Promise.all(
        config.copy.map((rule) => {
          return new Promise(async (resolve) => {
            const files = await fs.promises
              .stat(rule.src)
              .then((stats) =>
                stats.isDirectory() ? getFiles(rule.src) : [rule.src]
              )

            for (const file of files) {
              await copy(file, [rule])
            }

            resolve()
          })
        })
      )
    )

    const compiled = await time("Compile", () =>
      Promise.all(
        files
          .map((file) => path.relative(".", file))
          .filter((file) => config.isTemplate(file))
          .map((file) => {
            return new Promise((resolve) => {
              compile(file, config, true).then(resolve)
            })
          })
      )
    )

    const templates = list(compiled.filter((template) => template))

    await render(templates, config)

    return templates
  })
