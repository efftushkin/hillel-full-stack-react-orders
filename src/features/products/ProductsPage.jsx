import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { centsFromDecimal, decimalFromCents } from '../../utils/money'
import { buildValidationErrors, productSchema } from '../../utils/validation'
import { deleteProduct, saveProduct } from './productsSlice'

export function ProductsPage() {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.products.items)
  const orders = useSelector((state) => state.orders.items)
  const status = useSelector((state) => state.products.status)
  const sliceError = useSelector((state) => state.products.error)
  const [isAdding, setIsAdding] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: '' })
  const [drafts, setDrafts] = useState({})
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  const usedProductIds = useMemo(() => {
    const ids = new Set()
    orders.forEach((order) => {
      order.items.forEach((item) => ids.add(item.productId))
    })
    return ids
  }, [orders])

  useEffect(() => {
    setDrafts((currentDrafts) =>
      products.reduce((nextDrafts, product) => {
        nextDrafts[product.id] = currentDrafts[product.id] || {
          name: product.name,
          price: decimalFromCents(product.priceCents),
        }

        return nextDrafts
      }, {}),
    )
  }, [products])

  async function validateProduct(data) {
    await productSchema.validate(data, { abortEarly: false })
  }

  async function handleCreateProduct() {
    setMessage('')

    try {
      await validateProduct(newProduct)
      await dispatch(
        saveProduct({
          name: newProduct.name,
          priceCents: centsFromDecimal(newProduct.price),
        }),
      ).unwrap()
      setNewProduct({ name: '', price: '' })
      setIsAdding(false)
      resetErrors()
      setMessage('Product saved')
    } catch (error) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        new: buildValidationErrors(error),
      }))
    }
  }

  async function handleSaveProduct(productId) {
    setMessage('')
    const draft = drafts[productId]

    try {
      await validateProduct(draft)
      const savedProduct = await dispatch(
        saveProduct({
          id: productId,
          name: draft.name,
          priceCents: centsFromDecimal(draft.price),
        }),
      ).unwrap()
      setDrafts((currentDrafts) => ({
        ...currentDrafts,
        [productId]: {
          name: savedProduct.name,
          price: decimalFromCents(savedProduct.priceCents),
        },
      }))
      setErrors((currentErrors) => ({ ...currentErrors, [productId]: undefined }))
      setMessage('Product saved')
    } catch (error) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [productId]: buildValidationErrors(error),
      }))
    }
  }

  async function handleDeleteProduct(productId) {
    setMessage('')

    try {
      await dispatch(deleteProduct(productId)).unwrap()
      setMessage('Product deleted')
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
          <p className="eyebrow">Catalog</p>
          <h1>Products</h1>
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
              <th className="money-column">Price</th>
              <th className="action-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr>
                <td className="muted">Generated on save</td>
                <td>
                  <input
                    value={newProduct.name}
                    onChange={(event) =>
                      setNewProduct((currentProduct) => ({
                        ...currentProduct,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Product name"
                  />
                  {errors.new?.name && (
                    <p className="field-error">{errors.new.name}</p>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(event) =>
                      setNewProduct((currentProduct) => ({
                        ...currentProduct,
                        price: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                  {errors.new?.price && (
                    <p className="field-error">{errors.new.price}</p>
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={handleCreateProduct}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setIsAdding(false)
                        setNewProduct({ name: '', price: '' })
                        resetErrors()
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {products.map((product) => {
              const isUsed = usedProductIds.has(product.id)

              return (
                <tr key={product.id}>
                  <td className="id-cell">{product.id}</td>
                  <td>
                    <input
                      value={drafts[product.id]?.name || ''}
                      onChange={(event) =>
                        setDrafts((currentDrafts) => ({
                          ...currentDrafts,
                          [product.id]: {
                            ...currentDrafts[product.id],
                            name: event.target.value,
                          },
                        }))
                      }
                    />
                    {errors[product.id]?.name && (
                      <p className="field-error">{errors[product.id].name}</p>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={drafts[product.id]?.price || ''}
                      onChange={(event) =>
                        setDrafts((currentDrafts) => ({
                          ...currentDrafts,
                          [product.id]: {
                            ...currentDrafts[product.id],
                            price: event.target.value,
                          },
                        }))
                      }
                    />
                    {errors[product.id]?.price && (
                      <p className="field-error">{errors[product.id].price}</p>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        onClick={() => handleSaveProduct(product.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        disabled={isUsed}
                        title={
                          isUsed
                            ? 'Product is used in orders and cannot be deleted'
                            : 'Delete product'
                        }
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {products.length === 0 && !isAdding && (
              <tr>
                <td colSpan="4" className="empty-cell">
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {status === 'loading' && <p className="muted">Loading products...</p>}
    </section>
  )
}
