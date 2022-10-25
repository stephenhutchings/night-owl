import fs from "fs"
import path from "path"
import sass from "sass"
import gm from "gray-matter"

export default async (filename, config) => {
  const content = await fs.promises.readFile(filename, "utf8")
  const filetype = path.extname(filename).slice(1)

  const { data, content: body } = gm(content)

  const { css, loadedUrls } = sass.compileString(body, {
    ...config.sassOptions,
    syntax: filetype === "sass" ? "indented" : "scss",
  })

  const render = () => css

  const dependencies = loadedUrls.map((dep) =>
    path.relative(process.cwd(), dep.pathname)
  )

  return {
    render,
    content,
    filename,
    dependencies,
    data,
  }
}
