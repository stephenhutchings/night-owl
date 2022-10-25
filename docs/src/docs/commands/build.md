---
title: Build
layout: _includes/layouts/docs
tags: ["commands"]
---

In your `package.json` scripts, add the Night Owl `--build` command option.

```json
{
  "scripts": {
    "build": "night-owl --build"
  }
}
```

You can now run Night Owl from the command line.

```bash
npm run build
```

## Running a production build

During `build`, you may want to run extra transforms on your output. One way to
do that is to set a `NODE_ENV` variable before invoking Night Owl.

For example...

```json
{
  "scripts": {
    "build": "NODE_ENV=production night-owl --build"
  }
}
```

Then adjust your [`config`](../config/) to use the new environment variable.

For example

```js
import someMinifier from "someMinifier"

const isProduction = process.env.NODE_ENV === "production"

export default {
  transforms: isProduction ? [someMinifier] : undefined,
}
```
