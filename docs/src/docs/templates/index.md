---
title: Templates
layout: _includes/layouts/docs
tags: ["templates"]
---

Configuration files are optional.

Add a file called `nightowl.js` to the root directory of your project to change
the default configuration.

The file is a module that declares an object as the default export. A basic
configuration file might set input and output directories, like this:

```js
export default {
  // The location of your source files
  src: "./src",

  // The output destination for built files
  dist: "./dist",
}
```
