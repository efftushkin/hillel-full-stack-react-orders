import { useState } from 'react'
import './App.css'
import { ClientsPage } from './features/clients/ClientsPage'
import { OrdersPage } from './features/orders/OrdersPage'
import { ProductsPage } from './features/products/ProductsPage'
import { useBootstrapData } from './hooks/useBootstrapData'

const SECTIONS = [
  { id: 'clients', label: 'Clients' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
]

function App() {
  const [activeSection, setActiveSection] = useState('clients')
  useBootstrapData()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="app-kicker">Order Manager</p>
          <h2>Workspace</h2>
        </div>

        <nav aria-label="Main navigation">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? 'active' : ''}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        {activeSection === 'clients' && <ClientsPage />}
        {activeSection === 'products' && <ProductsPage />}
        {activeSection === 'orders' && <OrdersPage />}
      </main>
    </div>
  )
}

export default App
