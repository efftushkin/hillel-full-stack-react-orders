import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  deleteClient as deleteClientFromStorage,
  getClients,
  saveClient as saveClientToStorage,
} from '../../lib/storage/clientsRepository'
import { getOrders } from '../../lib/storage/ordersRepository'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Unexpected error'
}

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      return await getClients()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const saveClient = createAsyncThunk(
  'clients/saveClient',
  async (client, { rejectWithValue }) => {
    try {
      return await saveClientToStorage(client)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (clientId, { rejectWithValue }) => {
    try {
      const orders = await getOrders()
      const isUsed = orders.some((order) => order.clientId === clientId)

      if (isUsed) {
        return rejectWithValue('Client is used in orders and cannot be deleted')
      }

      return await deleteClientFromStorage(clientId)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(saveClient.pending, (state) => {
        state.status = 'saving'
        state.error = null
      })
      .addCase(saveClient.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex(
          (client) => client.id === action.payload.id,
        )

        if (index >= 0) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
      })
      .addCase(saveClient.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(deleteClient.pending, (state) => {
        state.status = 'saving'
        state.error = null
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((client) => client.id !== action.payload)
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
  },
})

export default clientsSlice.reducer
