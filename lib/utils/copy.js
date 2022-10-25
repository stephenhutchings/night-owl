import fs from "fs"
import path from "path"
import minimatch from "minimatch"

import makeDir from "./makeDir.js"

export default async (filename, rules = [], dist = "/") => {
  let url = false

  const file = path.relative(process.cwd(), filename)

  for (const rule of rules) {
    if (!rule || !rule.src) continue
    const src = path.relative(process.cwd(), rule.src)
    const rel = path.relative(src, file)

    if (
      file.startsWith(src) &&
      (!rule.include || minimatch(rel, rule.include)) &&
      (!rule.exclude || !minimatch(rel, rule.exclude))
    ) {
      const basename =
        rule.flat || file === src
          ? path.basename(file)
          : path.relative(src, file)

      const outputPath = path.extname(rule.dist)
        ? rule.dist
        : path.join(rule.dist, basename)

      url = path.relative(dist, outputPath)
      makeDir(path.dirname(outputPath))

      await fs.promises.copyFile(file, outputPath)

      continue
    }
  }

  return url
}
