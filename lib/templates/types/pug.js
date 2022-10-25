import fs from "fs"
import pug from "pug"
import gm from "gray-matter"

export default async (filename, config) => {
  const content = await fs.promises.readFile(filename, "utf8")

  const { data, content: body } = gm(content)

  const render = pug.compile(body, {
    filename,
    ...config.pugOptions,
  })

  return {
    render,
    content,
    filename,
    dependencies: render.dependencies,
    data,
  }
}
