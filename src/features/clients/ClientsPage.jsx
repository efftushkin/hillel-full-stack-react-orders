import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { buildValidationErrors, clientSchema } from '../../utils/validation'
import { deleteClient, saveClient } from './clientsSlice'

export function ClientsPage() {
  const dispatch = useDispatch()
  const clients = useSelector((state) => state.clients.items)
  const orders = useSelector((state) => state.orders.items)
  const status = useSelector((state) => state.clients.status)
  const sliceError = useSelector((state) => state.clients.error)
  const [isAdding, setIsAdding] = useState(false)
  const [newClient, setNewClient] = useState({ name: '' })
  const [drafts, setDrafts] = useState({})
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  const usedClientIds = useMemo(
    () => new Set(orders.map((order) => order.clientId)),
    [orders],
  )

  useEffect(() => {
    setDrafts((currentDrafts) =>
      clients.reduce((nextDrafts, client) => {
        nextDrafts[client.id] = currentDrafts[client.id] || {
          name: client.name,
        }

        return nextDrafts
      }, {}),
    )
  }, [clients])

  async function validateClient(data) {
    await clientSchema.validate(data, { abortEarly: false })
  }

  async function handleCreateClient() {
    setMessage('')

    try {
      await validateClient(newClient)
      await dispatch(saveClient({ name: newClient.name })).unwrap()
      setNewClient({ name: '' })
      setIsAdding(false)
      resetErrors()
      setMessage('Client saved')
    } catch (error) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        new: buildValidationErrors(error),
      }))
    }
  }

  async function handleSaveClient(clientId) {
    setMessage('')
    const draft = drafts[clientId]

    try {
      await validateClient(draft)
      const savedClient = await dispatch(
        saveClient({ id: clientId, name: draft.name }),
      ).unwrap()
      setDrafts((currentDrafts) => ({
        ...currentDrafts,
        [clientId]: { name: savedClient.name },
      }))
      setErrors((currentErrors) => ({ ...currentErrors, [clientId]: undefined }))
      setMessage('Client saved')
    } catch (error) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [clientId]: buildValidationErrors(error),
      }))
    }
  }

  async function handleDeleteClient(clientId) {
    setMessage('')

    try {
      await dispatch(deleteClient(clientId)).unwrap()
      setMessage('Client deleted')
    } catch (error) {
      setMessage(error.message || String(error))
    }
  }

  function resetErrors() {
    setErrors((currentErrors) => ({ ...currentErrors, new: undefined }))
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>Clients</h1>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setIsAdding(true)}
        >
          + Add
        </button>
      </div>

      {(message || sliceError) && (
        <p className={sliceError ? 'notice error' : 'notice'}>
          {sliceError || message}
        </p>
      )}

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th className="id-column">ID</th>
              <th>Name</th>
              <th className="action-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr>
                <td className="muted">Generated on save</td>
                <td>
                  <input
                    value={newClient.name}
                    onChange={(event) =>
                      setNewClient({ name: event.target.value })
                    }
                    placeholder="Client name"
                  />
                  {errors.new?.name && (
                    <p className="field-error">{errors.new.name}</p>
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={handleCreateClient}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setIsAdding(false)
                        setNewClient({ name: '' })
                        resetErrors()
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {clients.map((client) => {
              const isUsed = usedClientIds.has(client.id)

              return (
                <tr key={client.id}>
                  <td className="id-cell">{client.id}</td>
                  <td>
                    <input
                      value={drafts[client.id]?.name || ''}
                      onChange={(event) =>
                        setDrafts((currentDrafts) => ({
                          ...currentDrafts,
                          [client.id]: { name: event.target.value },
                        }))
                      }
                    />
                    {errors[client.id]?.name && (
                      <p className="field-error">{errors[client.id].name}</p>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        onClick={() => handleSaveClient(client.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        disabled={isUsed}
                        title={
                          isUsed
                            ? 'Client is used in orders and cannot be deleted'
                            : 'Delete client'
                        }
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {clients.length === 0 && !isAdding && (
              <tr>
                <td colSpan="3" className="empty-cell">
                  No clients yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {status === 'loading' && <p className="muted">Loading clients...</p>}
    </section>
  )
}
