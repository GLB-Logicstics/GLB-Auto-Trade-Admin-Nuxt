export function getPath(source: Record<string, unknown>, path: string): unknown {
  let value: unknown = source
  for (const key of path.split('.')) {
    if (value === null || typeof value !== 'object') return undefined
    value = (value as Record<string, unknown>)[key]
  }
  return value
}

export function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.')
  const last = keys.pop() as string
  let current = target

  for (const key of keys) {
    if (current[key] === null || typeof current[key] !== 'object') current[key] = {}
    current = current[key] as Record<string, unknown>
  }

  current[last] = value
}
