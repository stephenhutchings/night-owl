import path from "path"
import { fileURLToPath } from "url"

const relative = (url) =>
  path.relative(path.dirname(fileURLToPath(import.meta.url)), url)

let cachebust = 0

export default (js) => {
  const url = relative(js)

  try {
    return import(url + "?" + cachebust++).then((lib) =>
      lib.default ? lib.default : lib
    )
  } catch (err) {
    console.error("Failed to import module", js)
    console.error(err)
    return {}
  }
}
