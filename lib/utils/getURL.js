import path from "path"

export default (src, filename) => {
  filename = path.relative(src, filename)
  filename = filename.replace(/\.(pug|md|page\.js)$/, "")
  filename = filename.replace(/\.html$/, "")
  filename = filename.replace(/index$/, "")

  return path.normalize("/" + filename)
}
