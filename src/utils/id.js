export function createUid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `uid-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
