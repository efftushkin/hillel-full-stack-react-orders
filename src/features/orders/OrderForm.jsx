import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ORDER_STATUS, ORDER_STATUSES } from '../../constants/orderStatuses'
import { createUid } from '../../utils/id'
import { formatMoney, multiplyMoney } from '../../utils/money'
import { buildValidationErrors, orderSchema } from '../../utils/validation'
import { saveOrder } from './ordersSlice'

function createBlankItem() {
  return {
    rowId: createUid(),
    productId: '',
    quantity: '',
    priceCents: 0,
    lineTotalCents: 0,
  }
}

function createDraftFromOrder(order) {
  if (!order) {
    return {
      id: '',
      orderNumber: '',
      createdAtUtc: '',
      clientId: '',
      status: ORDER_STATUS.NEW,
      items: [createBlankItem()],
    }
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAtUtc: order.createdAtUtc,
    clientId: order.clientId,
    status: order.status,
    items: order.items.map((item) => ({
      ...item,
      rowId: createUid(),
      quantity: String(item.quantity),
    })),
  }
}

function formatUtcDate(value) {
  if (!value) {
    return 'Generated on save'
  }

  return `${new Date(value).toLocaleString('en-GB', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'UTC',
  })} UTC`
}

export function OrderForm({ orderId, onClose, onSaved }) {
  const dispatch = useDispatch()
  const order = useSelector((state) =>
    state.orders.items.find((item) => item.id === orderId),
  )
  const clients = useSelector((state) => state.clients.items)
  const products = useSelector((state) => state.products.items)
  const [draft, setDraft] = useState(() => createDraftFromOrder(order))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  const isExistingOrder = Boolean(order)
  const contentLocked = Boolean(order && order.status !== ORDER_STATUS.NEW)
  const productById = useMemo(
    () =>
      products.reduce((map, product) => {
        map[product.id] = product
        return map
      }, {}),
    [products],
  )
  const totalCents = useMemo(
    () =>
      draft.items.reduce(
        (sum, item) => sum + Number(item.lineTotalCents || 0),
        0,
      ),
    [draft.items],
  )

  if (orderId && !order) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Sales</p>
            <h1>Order not found</h1>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <span aria-hidden="true">&larr;</span>
          </button>
        </div>
      </section>
    )
  }

  function updateDraftField(field, value) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  function updateItem(rowId, updater) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      items: currentDraft.items.map((item) =>
        item.rowId === rowId ? updater(item) : item,
      ),
    }))
  }

  function handleProductChange(rowId, productId) {
    const product = productById[productId]

    updateItem(rowId, (item) => {
      const nextItem = {
        ...item,
        productId,
        priceCents: product?.priceCents || 0,
      }

      return {
        ...nextItem,
        lineTotalCents: multiplyMoney(nextItem.priceCents, nextItem.quantity),
      }
    })
  }

  function handleQuantityChange(rowId, quantity) {
    updateItem(rowId, (item) => ({
      ...item,
      quantity,
      lineTotalCents: multiplyMoney(item.priceCents, quantity),
    }))
  }

  function handleAddItem() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      items: [...currentDraft.items, createBlankItem()],
    }))
  }

  function handleRemoveItem(rowId) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      items: currentDraft.items.filter((item) => item.rowId !== rowId),
    }))
  }

  async function handleSave(closeAfterSave) {
    setMessage('')

    const payload = {
      id: draft.id || undefined,
      clientId: draft.clientId,
      status: isExistingOrder ? draft.status : ORDER_STATUS.NEW,
      items: draft.items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        priceCents: Number(item.priceCents),
      })),
    }

    try {
      await orderSchema.validate(payload, { abortEarly: false })
      const savedOrder = await dispatch(saveOrder(payload)).unwrap()
      setDraft(createDraftFromOrder(savedOrder))
      setErrors({})
      setMessage('Order saved')
      onSaved(savedOrder.id)

      if (closeAfterSave) {
        onClose()
      }
    } catch (error) {
      setErrors(buildValidationErrors(error))
      setMessage('')
    }
  }

  return (
    <section className="panel order-form">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Sales</p>
          <h1>{isExistingOrder ? `Order ${draft.orderNumber}` : 'New order'}</h1>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Back to orders"
          onClick={onClose}
        >
          <span aria-hidden="true">&larr;</span>
        </button>
      </div>

      {contentLocked && (
        <p className="notice">
          This order is not new. Only the status can be changed.
        </p>
      )}
      {message && <p className="notice">{message}</p>}
      {errors.form && <p className="notice error">{errors.form}</p>}

      <div className="form-grid">
        <label>
          <span>ID</span>
          <input value={draft.id || 'Generated on save'} readOnly />
        </label>
        <label>
          <span>Order number</span>
          <input value={draft.orderNumber || 'Generated on save'} readOnly />
        </label>
        <label>
          <span>Created UTC</span>
          <input value={formatUtcDate(draft.createdAtUtc)} readOnly />
        </label>
        <label>
          <span>Status</span>
          <select
            value={draft.status}
            disabled={!isExistingOrder}
            onChange={(event) => updateDraftField('status', event.target.value)}
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="wide-field">
          <span>Client</span>
          <select
            value={draft.clientId}
            disabled={contentLocked}
            onChange={(event) => updateDraftField('clientId', event.target.value)}
          >
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && <p className="field-error">{errors.clientId}</p>}
        </label>
      </div>

      <div className="subsection-header">
        <h2>Products</h2>
        <button
          type="button"
          className="secondary-button"
          disabled={contentLocked}
          onClick={handleAddItem}
        >
          + Add row
        </button>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th className="quantity-column">Quantity</th>
              <th className="money-column">Price</th>
              <th className="money-column">Line total</th>
              <th className="action-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {draft.items.map((item, index) => (
              <tr key={item.rowId}>
                <td>
                  <select
                    value={item.productId}
                    disabled={contentLocked}
                    onChange={(event) =>
                      handleProductChange(item.rowId, event.target.value)
                    }
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {errors[`items[${index}].productId`] && (
                    <p className="field-error">
                      {errors[`items[${index}].productId`]}
                    </p>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    disabled={contentLocked}
                    onChange={(event) =>
                      handleQuantityChange(item.rowId, event.target.value)
                    }
                  />
                  {errors[`items[${index}].quantity`] && (
                    <p className="field-error">
                      {errors[`items[${index}].quantity`]}
                    </p>
                  )}
                </td>
                <td className="money-cell">{formatMoney(item.priceCents)}</td>
                <td className="money-cell">{formatMoney(item.lineTotalCents)}</td>
                <td>
                  <button
                    type="button"
                    className="danger-button"
                    disabled={contentLocked}
                    onClick={() => handleRemoveItem(item.rowId)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {draft.items.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-cell">
                  Add at least one product
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">Total</td>
              <td className="money-cell">{formatMoney(totalCents)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      {errors.items && <p className="field-error">{errors.items}</p>}

      <div className="form-actions">
        <button type="button" onClick={() => handleSave(false)}>
          Save
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => handleSave(true)}
        >
          OK
        </button>
        <button type="button" className="secondary-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </section>
  )
}
