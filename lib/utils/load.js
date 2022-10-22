import path from "path"
import { fileURLToPath } from "url"

const relative = (url) =>
  path.relative(path.dirname(fileURLToPath(import.meta.url)), url)

let count = 0

export default (js) => {
  const url = relative(js)

  try {
    return import(url + "?" + count++).then((lib) =>
      lib.default ? lib.default : lib
    )
  } catch (err) {
    console.error("Failed to import module", js)
    console.error(err)
    return {}
  }
}
