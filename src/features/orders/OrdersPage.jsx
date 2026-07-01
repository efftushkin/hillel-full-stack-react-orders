import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { getOrderStatusLabel } from '../../constants/orderStatuses'
import { formatMoney } from '../../utils/money'
import { OrderForm } from './OrderForm'

function formatUtcDate(value) {
  if (!value) {
    return ''
  }

  return `${new Date(value).toLocaleString('en-GB', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'UTC',
  })} UTC`
}

export function OrdersPage() {
  const orders = useSelector((state) => state.orders.items)
  const clients = useSelector((state) => state.clients.items)
  const status = useSelector((state) => state.orders.status)
  const error = useSelector((state) => state.orders.error)
  const [editorOrderId, setEditorOrderId] = useState(null)

  const clientNames = useMemo(
    () =>
      clients.reduce((names, client) => {
        names[client.id] = client.name
        return names
      }, {}),
    [clients],
  )

  if (editorOrderId !== null) {
    return (
      <OrderForm
        key={editorOrderId}
        orderId={editorOrderId === 'new' ? null : editorOrderId}
        onClose={() => setEditorOrderId(null)}
        onSaved={(orderId) => setEditorOrderId(orderId)}
      />
    )
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Sales</p>
          <h1>Orders</h1>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setEditorOrderId('new')}
        >
          + New order
        </button>
      </div>

      {error && <p className="notice error">{error}</p>}

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th className="id-column">ID</th>
              <th>No.</th>
              <th>Created UTC</th>
              <th>Client</th>
              <th>Status</th>
              <th className="money-column">Total</th>
              <th className="action-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="id-cell">{order.id}</td>
                <td>{order.orderNumber}</td>
                <td>{formatUtcDate(order.createdAtUtc)}</td>
                <td>{clientNames[order.clientId] || 'Missing client'}</td>
                <td>
                  <span className={`status-pill status-${order.status}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </td>
                <td className="money-cell">{formatMoney(order.totalCents)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => setEditorOrderId(order.id)}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-cell">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {status === 'loading' && <p className="muted">Loading orders...</p>}
    </section>
  )
}
