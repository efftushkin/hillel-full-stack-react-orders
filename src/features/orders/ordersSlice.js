import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getOrders,
  saveOrder as saveOrderToStorage,
} from '../../lib/storage/ordersRepository'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Unexpected error'
}

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await getOrders()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const saveOrder = createAsyncThunk(
  'orders/saveOrder',
  async (order, { rejectWithValue }) => {
    try {
      return await saveOrderToStorage(order)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(saveOrder.pending, (state) => {
        state.status = 'saving'
        state.error = null
      })
      .addCase(saveOrder.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex(
          (order) => order.id === action.payload.id,
        )

        if (index >= 0) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
      })
      .addCase(saveOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export default ordersSlice.reducer
