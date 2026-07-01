export const ORDER_STATUS = Object.freeze({
  NEW: 'new',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
})

export const ORDER_STATUSES = [
  { value: ORDER_STATUS.NEW, label: 'New' },
  { value: ORDER_STATUS.PROCESSING, label: 'Processing' },
  { value: ORDER_STATUS.COMPLETED, label: 'Completed' },
  { value: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
]

export function getOrderStatusLabel(status) {
  return ORDER_STATUSES.find((item) => item.value === status)?.label ?? status
}
