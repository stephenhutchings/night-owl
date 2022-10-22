const DEBUG = true

const prefix = (msg) => "[night-owl] " + timestamp() + (msg ? " " + msg : "")

const timestamp = Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
}).format

export const time = async (label, fn) => {
  label = prefix(label)
  if (DEBUG) console.time(label)
  const result = await fn()
  if (DEBUG) console.timeEnd(label)
  return result
}

export const log = (...args) => {
  if (DEBUG) {
    console.log(prefix(), ...args)
  }
}