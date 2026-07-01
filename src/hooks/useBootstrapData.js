import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchClients } from '../features/clients/clientsSlice'
import { fetchOrders } from '../features/orders/ordersSlice'
import { fetchProducts } from '../features/products/productsSlice'

export function useBootstrapData() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchClients())
    dispatch(fetchProducts())
    dispatch(fetchOrders())
  }, [dispatch])
}
