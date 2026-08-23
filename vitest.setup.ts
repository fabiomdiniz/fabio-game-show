import '@testing-library/jest-dom'

// jsdom in this environment does not always expose a working `window.localStorage`.
// Provide a deterministic in-memory shim so persistence code under test works.
if (typeof window !== 'undefined' && !window.localStorage) {
  const store = new Map<string, string>()
  const storage: Storage = {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true })
}
