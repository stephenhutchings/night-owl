import pc from "picocolors"

const DEBUG = true

const prefix = (msg) =>
  `${pc.blue("[night-owl]")} ${pc.gray(timestamp())}${msg ? " " + msg : ""}`

const timestamp = Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
}).format

export const time = async (label, fn) => {
  label = prefix(pc.italic(label))
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
