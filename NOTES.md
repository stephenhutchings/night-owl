## Compilation logic

```
// Unnamed template
/src/to/index.pug
=> /dist/to/index.html

// Named template with data
/src/to/name.pug
=> /dist/to/name/index.html

// Named/unnamed pages template
/src/to/name.page.js using { pages: [...] } as data
=> /src/to/name/slug-one/index.html
   /src/to/name/slug-two/index.html
   /src/to/name/slug-two/etc.

```

## TODO

- ~~global data~~
- ~~compute data from files~~
- ~~markdown~~
- ~~frontmatter~~
- ~~handle markdown templates~~
- ~~load user config~~
- ~~11ty-style collections~~ Use `tags` property to define collections
- ~~11ty-style passthrough copy~~
- 11ty-style pagination

~~Some data is loaded at compile time, some at render time. Rendering shouldn't
care about loading data. Not sure compile should either. If is page, add to
dictionary. Then compute data and render method. Compiler shouldn't store
templates, only return render method for a file.~~

- watch
- build
- serve
- page
  - getData
  - getRender

The problem with passing data listing the rendered files is that it requires
that all pages are rerendered after any change. But rendering is cheap, and
compilation is expensive, especially for Pug templates.

build => list => compile => render
watch => compile changes => render

### Data cascade

This has been intentionally removed. Data must be explicitly added to templates.
However, items in a `pages` array inherit data from the parent template.

### Pagination ideas

```js
paginate: {
  size: 10,
  layout: "template.pug",
  url: "/pages",
  // or a function for more control
  url: (i) => `/pages-${i}`
}
```

### Config

Un-implemented ideas.

### Doc sections

Convert example "./src" to "./docs"

- Build, watch and serve scripts
- Config
- Template data
  - Special properties
    - pages
    - tags
    - url
    - layout
    - content
  - Front-matter
  - Javascript
  - Reserved words (produce warnings)
    - page
    - collections
    - filters
- Global data
- Night owl data
  - collections
  - filters
- Languages? Engines? Compilers?
  - pug
  - js
  - md
  - sass

### To check

Module dependencies won't retrigger a build.
q: Can a module's dependencies be cheaply extracted during compile?
a: Yes, but the import cache cannot be cleared.

- https://github.com/nodejs/modules/issues/307
- https://github.com/FredKSchott/esm-hmr

### No render for serve

If running serve and watch, don't render everything (anything?) to disk. Just
let the server request a specific URL, check if it exists in the pages array,
and render on demand. Fallback to using file system for pages not-found in the
template list. Could it even be the import cache fix using a custom
resolver?
