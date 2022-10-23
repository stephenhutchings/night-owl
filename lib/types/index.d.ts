export interface CopyRule {
  /**
   * The directory from which to copy files
   */
  src: string

  /**
   * The directory where files are copied to
   */
  dist: string

  /**
   * A glob pattern specifying files to include
   * If not defined, all files are included
   */
  include?: string

  /**
   * A glob pattern specifying files to exclude
   */
  exclude?: string

  /**
   * Copy all files to the root of the specified `dist` directory
   */
  flat?: true
}

export interface Config {
  /**
   * The input directory
   */
  src?: string

  /**
   * The directory where files are output
   */
  dist?: string

  /**
   * The path to the global data module
   */
  data?: string

  /**
   * The port to use when serving files
   */
  port?: number

  /**
   * Rules for which files are considered templates
   */
  templates?: {
    include?: string[]
    exclude?: string[]
  }

  /**
   * A map of input globs and output directories
   * used to copy files without any modification
   * @example {
   *   "src/assets/**\/*": "dist/assets/"
   * }
   */
  copy?: CopyRule[]

  /**
   * Additional paths to watch. Changes to files that match
   * the watcher will trigger the server to reload the page
   * @example [ "dist/compiled.js" ]
   */
  watch?: string[]

  /**
   * Options to pass to [`pug`](https://pugjs.org/api/reference.html#options)
   */
  pugOptions?: {
    /**
     * Specify the
     * [doctype](https://pugjs.org/language/doctype.html#doctype-option) for
     * templates that don't declare one
     */
    doctype?: string

    /**
     * Adds whitespace to the resulting HTML
     * @deprecated
     */
    pretty?: boolean | string

    /**
     * The root directory of all absolute inclusion
     */
    basedir: string

    /**
     * Hash table of [custom filters](https://pugjs.org/language/filters.html#custom-filters)
     */
    filters?: object

    /**
     * Use a self namespace to hold the locals
     */
    self: boolean
  }

  /**
   * Options to pass to [`marked`](https://marked.js.org/using_advanced#options)
   */
  markedOptions?: {
    smartypants: boolean
  }
}
