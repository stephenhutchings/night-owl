import fs from "fs"
import gm from "gray-matter"
import { marked } from "marked"

export default async (filename, config) => {
  const content = await fs.promises.readFile(filename, "utf8")

  const { data, content: body } = gm(content)

  data.content = marked(body, config.markedOptions)

  return {
    content,
    filename,
    dependencies: [],
    data,
  }
}
