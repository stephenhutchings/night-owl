export default (fn, ms) => {
  let timeout

  return () =>
    new Promise((resolve) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => resolve(fn()), ms)
    })
}
