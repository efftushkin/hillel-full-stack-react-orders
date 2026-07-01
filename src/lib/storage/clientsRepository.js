import { createUid } from '../../utils/id'
import { readDatabase, writeDatabase } from './localStorageDatabase'

export async function getClients() {
  return readDatabase().clients
}

export async function saveClient(client) {
  const database = readDatabase()
  const savedClient = {
    id: client.id || createUid(),
    name: client.name.trim(),
  }
  const index = database.clients.findIndex((item) => item.id === savedClient.id)

  if (index >= 0) {
    database.clients[index] = savedClient
  } else {
    database.clients.push(savedClient)
  }

  writeDatabase(database)
  return savedClient
}

export async function deleteClient(clientId) {
  const database = readDatabase()
  database.clients = database.clients.filter((client) => client.id !== clientId)
  writeDatabase(database)
  return clientId
}
