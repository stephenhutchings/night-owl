---
layout: _includes/layouts/docs
---

## Glossary

### Template

A file written in a format such as Markdown, Pug or JavaScript. Templates are
compiled and rendered into one or more pages. When templates render, they are
given access to local and global data.

### Layout

Templates written in Markdown or JavaScript just contain data and/or content,
but don't include any layout. These templates can use layouts defined by other
files.

### Page

Pages are created by templates. They are usually HTML files, but can also be any
other file type. A single template can produce any number of pages.

### Data

Templates use data to control the way content is rendered. Pug and Markdown
templates might include data in the form of front-mattter, while JavaScript
templates are only data. Data can be retrieved from a global data file, and
metadata about a template is also supplied

### Collection

A collection is an array of pages grouped together. Collections are created
by using tags in the template data.
