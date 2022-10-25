---
title: Layouts
layout: _includes/layouts/docs
tags: ["templates"]
---

Templates written in Markdown or JavaScript just contain data and/or content,
but don't include any `layout`. These templates can use a separate Pug file to
control how their content is rendered.

## Markdown

For a Markdown template, declare a `layout` in your front-matter.

```md
---
layout: "/my-layout"
---
```

## JavaScript

For a JavaScript template, declare a `layout` in your data.

```js
export default {
  layout: "/my-layout",
}
```

An alternative way to control how JavaScript templates render is to add a
`render` function.

```js
export default {
  // This will output a JSON string representing your data
  render: function (data) {
    return JSON.stringify(data)
  },
}
```

## Layout data

Layouts can also declare data using front-matter.

```md
---
myVariable: 42
---

extends default-layout
```

However, you cannot use front-matter in any files that a layout extends or
includes. In the example above, using front-matter in `default-layout.pug` will
cause an error.
