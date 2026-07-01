import { ORDER_STATUS } from '../../constants/orderStatuses'
import { createUid } from '../../utils/id'
import { multiplyMoney } from '../../utils/money'
import { readDatabase, writeDatabase } from './localStorageDatabase'

export async function getOrders() {
  return readDatabase().orders
}

function normalizeOrderItems(items) {
  return items.map((item) => {
    const quantity = Number(item.quantity)
    const priceCents = Number(item.priceCents)

    return {
      productId: item.productId,
      quantity,
      priceCents,
      lineTotalCents: multiplyMoney(priceCents, quantity),
    }
  })
}

export async function saveOrder(order) {
  const database = readDatabase()
  const existingIndex = database.orders.findIndex((item) => item.id === order.id)
  const existingOrder =
    existingIndex >= 0 ? database.orders[existingIndex] : undefined
  const isNewOrder = !existingOrder

  if (existingOrder && existingOrder.status !== ORDER_STATUS.NEW) {
    const statusOnlyOrder = {
      ...existingOrder,
      status: order.status,
    }

    database.orders[existingIndex] = statusOnlyOrder
    writeDatabase(database)
    return statusOnlyOrder
  }

  const items = normalizeOrderItems(order.items)
  const totalCents = items.reduce(
    (sum, item) => sum + Number(item.lineTotalCents || 0),
    0,
  )
  const orderNumber = isNewOrder
    ? database.nextOrderNumber
    : existingOrder.orderNumber
  const savedOrder = {
    id: existingOrder?.id || order.id || createUid(),
    orderNumber,
    createdAtUtc: existingOrder?.createdAtUtc || new Date().toISOString(),
    clientId: order.clientId,
    status: isNewOrder ? ORDER_STATUS.NEW : order.status,
    items,
    totalCents,
  }

  if (isNewOrder) {
    database.orders.push(savedOrder)
    database.nextOrderNumber = orderNumber + 1
  } else {
    database.orders[existingIndex] = savedOrder
  }

  writeDatabase(database)
  return savedOrder
}
