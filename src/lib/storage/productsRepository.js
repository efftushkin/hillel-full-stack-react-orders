import { createUid } from '../../utils/id'
import { readDatabase, writeDatabase } from './localStorageDatabase'

export async function getProducts() {
  return readDatabase().products
}

export async function saveProduct(product) {
  const database = readDatabase()
  const savedProduct = {
    id: product.id || createUid(),
    name: product.name.trim(),
    priceCents: Number(product.priceCents),
  }
  const index = database.products.findIndex(
    (item) => item.id === savedProduct.id,
  )

  if (index >= 0) {
    database.products[index] = savedProduct
  } else {
    database.products.push(savedProduct)
  }

  writeDatabase(database)
  return savedProduct
}

export async function deleteProduct(productId) {
  const database = readDatabase()
  database.products = database.products.filter(
    (product) => product.id !== productId,
  )
  writeDatabase(database)
  return productId
}
