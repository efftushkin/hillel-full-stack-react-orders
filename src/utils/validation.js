import * as yup from 'yup'

function requiredNumber(label) {
  return yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? undefined : value,
    )
    .typeError(`${label} is required`)
    .required(`${label} is required`)
}

export const clientSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
})

export const productSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  price: requiredNumber('Price').min(0.01, 'Price must be greater than zero'),
})

export const orderSchema = yup.object({
  clientId: yup.string().required('Client is required'),
  items: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().required('Product is required'),
        quantity: requiredNumber('Quantity')
          .integer('Quantity must be a whole number')
          .min(1, 'Quantity must be at least 1'),
      }),
    )
    .min(1, 'Add at least one product'),
})

export function buildValidationErrors(error) {
  if (!(error instanceof yup.ValidationError)) {
    return {
      form:
        error instanceof Error
          ? error.message
          : String(error || 'Validation failed'),
    }
  }

  if (error.inner.length === 0) {
    return { [error.path || 'form']: error.message }
  }

  return error.inner.reduce((errors, current) => {
    if (current.path && !errors[current.path]) {
      errors[current.path] = current.message
    }

    return errors
  }, {})
}
