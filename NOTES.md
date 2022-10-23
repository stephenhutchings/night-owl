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

```js
{
  // Array of functions that modify the output pages
  // eg html-min, css-min, js-min
  transforms: [
    (content, outputPath) =>
      (outputPath.endsWith(".html")) ? minify(content) : content
  ]

  // Any files that match a glob are output to a specified directory
  // Should transforms be run on these too?
  copy: {
    "src/assets": "dist/assets"
    "inputglob": "outputfolder"
  }

}

```

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
- Global data

### To check

Module dependencies won't retrigger a build. Can a module's dependencies be
cheaply extracted during compile?
