import { configureStore } from '@reduxjs/toolkit'
import clientsReducer from '../features/clients/clientsSlice'
import ordersReducer from '../features/orders/ordersSlice'
import productsReducer from '../features/products/productsSlice'

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    products: productsReducer,
    orders: ordersReducer,
  },
})
