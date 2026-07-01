import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getOrders } from '../../lib/storage/ordersRepository'
import {
  deleteProduct as deleteProductFromStorage,
  getProducts,
  saveProduct as saveProductToStorage,
} from '../../lib/storage/productsRepository'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Unexpected error'
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await getProducts()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const saveProduct = createAsyncThunk(
  'products/saveProduct',
  async (product, { rejectWithValue }) => {
    try {
      return await saveProductToStorage(product)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const orders = await getOrders()
      const isUsed = orders.some((order) =>
        order.items.some((item) => item.productId === productId),
      )

      if (isUsed) {
        return rejectWithValue('Product is used in orders and cannot be deleted')
      }

      return await deleteProductFromStorage(productId)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(saveProduct.pending, (state) => {
        state.status = 'saving'
        state.error = null
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex(
          (product) => product.id === action.payload.id,
        )

        if (index >= 0) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
      })
      .addCase(saveProduct.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(deleteProduct.pending, (state) => {
        state.status = 'saving'
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter(
          (product) => product.id !== action.payload,
        )
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export default productsSlice.reducer
