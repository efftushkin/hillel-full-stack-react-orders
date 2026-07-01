const STORAGE_KEY = 'hillel-react-orders.database.v1'

const EMPTY_DATABASE = Object.freeze({
  clients: [],
  products: [],
  orders: [],
  nextOrderNumber: 1,
})

let memoryDatabase = cloneDatabase(EMPTY_DATABASE)

function cloneDatabase(database) {
  return JSON.parse(JSON.stringify(database))
}

function getLocalStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function normalizeDatabase(database) {
  return {
    clients: Array.isArray(database?.clients) ? database.clients : [],
    products: Array.isArray(database?.products) ? database.products : [],
    orders: Array.isArray(database?.orders) ? database.orders : [],
    nextOrderNumber:
      Number.isInteger(database?.nextOrderNumber) && database.nextOrderNumber > 0
        ? database.nextOrderNumber
        : 1,
  }
}

export function readDatabase() {
  const storage = getLocalStorage()

  if (!storage) {
    return cloneDatabase(memoryDatabase)
  }

  try {
    const raw = storage.getItem(STORAGE_KEY)

    if (!raw) {
      return cloneDatabase(EMPTY_DATABASE)
    }

    return normalizeDatabase(JSON.parse(raw))
  } catch {
    return cloneDatabase(EMPTY_DATABASE)
  }
}

export function writeDatabase(database) {
  const normalized = normalizeDatabase(database)
  const storage = getLocalStorage()

  if (!storage) {
    memoryDatabase = cloneDatabase(normalized)
    return normalized
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function clearDatabase() {
  const storage = getLocalStorage()
  memoryDatabase = cloneDatabase(EMPTY_DATABASE)

  if (storage) {
    storage.removeItem(STORAGE_KEY)
  }
}
