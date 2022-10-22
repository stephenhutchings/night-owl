import slugify from "slugify"

export default (slug) =>
  slugify(slug, {
    lower: true,
    strict: true,
  })
