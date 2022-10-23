import fs from "fs"
import path from "path"
import minimatch from "minimatch"

import makeDir from "./makeDir.js"

export default async (filename, rules = []) => {
  let url = false

  const file = path.relative(process.cwd(), filename)

  for (const rule of rules) {
    const src = path.relative(process.cwd(), rule.src)

    if (
      file.startsWith(src) &&
      (!rule.include || minimatch(file, rule.include)) &&
      (!rule.exclude || !minimatch(file, rule.exclude))
    ) {
      const basename =
        rule.flat || file === src
          ? path.basename(file)
          : path.relative(src, file)

      const outputPath = path.extname(rule.dist)
        ? rule.dist
        : path.join(rule.dist, basename)

      url = outputPath
      makeDir(path.dirname(outputPath))

      await fs.promises.copyFile(file, outputPath)

      continue
    }
  }

  return url
}
