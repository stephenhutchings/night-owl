---
title: Global data
layout: _includes/layouts/docs
tags: ["configuration"]
sort: 2
---

Templates have access to local and global data. To use global data in your
project, point to an entry file in your project [`config`](../index/).

```js
export default {
  // The location of your global data file
  data: "./src/_data/index.js",
}
```

If the same keys are present in your template data, the local data will override
the global data for that file.
