import fs from "fs"
import path from "path"
import pug from "pug"
import gm from "gray-matter"

// Some templates specify a Pug layout file.
// Compiling layouts is expensive, so they are only compiled when
// they (or one of their dependencies) changes.
const layoutCache = {}

export default async (layoutName, config, useLayoutCache) => {
  let layout

  const filename = path.join(config.pugOptions.basedir, layoutName + ".pug")

  if (!fs.existsSync(filename)) {
    throw Error(`Layout ${filename} does not exist`)
  }

  const content = (await fs.promises.readFile(filename, "utf8")).toString()

  // Only use the cached layout if its data is the same. Because
  // changes to dependencies are called with `useLayoutCache = false`,
  // we only need to worry about the layout itself.
  if (
    useLayoutCache &&
    layoutCache[filename] &&
    layoutCache[filename].content === content
  ) {
    layout = layoutCache[filename]
  }

  if (!layout) {
    const { data, content: body } = gm(content)

    layout = {
      content,
      data,
      render: pug.compile(body, {
        filename,
        ...config.pugOptions,
      }),
    }
  }

  layoutCache[filename] = layout

  return layout
}
