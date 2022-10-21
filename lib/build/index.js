import fs from "fs"
import path from "path"
import * as utils from "../utils/index.js"

import compile from "../page/compile.js"
import render from "../page/render.js"

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
  utils.time("Build", async () => {
    const files = await getFiles(config.src)

    return Promise.all(
      files
        .map((file) => path.relative(".", file))
        .filter((file) => !utils.isIgnored(file, config.files.ignored))
        .map(
          (file) =>
            new Promise((res) =>
              compile(file, null, config)
                .then((template) => render(template, config))
                .then(res)
            )
        )
    ).then((list) => list.filter((f) => f))
  })
