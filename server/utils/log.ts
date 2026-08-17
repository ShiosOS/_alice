type LogFields = Record<string, unknown>

export function logInfo(event: string, fields: LogFields = {}) {
  console.info(JSON.stringify({ level: 'info', event, ts: new Date().toISOString(), ...sanitize(fields) }))
}

export function logError(event: string, fields: LogFields = {}) {
  console.error(JSON.stringify({ level: 'error', event, ts: new Date().toISOString(), ...sanitize(fields) }))
}

function sanitize(fields: LogFields): LogFields {
  const out: LogFields = {}
  for (const [k, v] of Object.entries(fields)) {
    const key = k.toLowerCase()
    if (key.includes('key') || key.includes('secret') || key.includes('password') || key.includes('token')) {
      out[k] = '[redacted]'
      continue
    }
    out[k] = v
  }
  return out
}
