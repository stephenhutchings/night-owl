import fs from "fs"
import path from "path"
import precinct from "precinct"
import load from "../../../lib/utils/load.js"

export default async (filename, options) => {
  const content = await fs.promises.readFile(filename, "utf8")

  const data = await load(filename)

  const render = data.render
  delete data.render

  const dependencies = precinct(content, {
    type: "es6",
    includeCore: false,
  }).map((dep) => path.join(options.src, dep))

  return {
    render,
    content,
    filename,
    dependencies,
    data,
  }
}
