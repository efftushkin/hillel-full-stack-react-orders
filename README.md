# Order Management App

A simple React application for managing clients, products, and orders. The app is built with Vite, Redux Toolkit, React Redux, and Yup.

## Features

- Manage clients with inline add, edit, and delete actions.
- Manage products with inline add, edit, and delete actions.
- Create and edit orders in a dedicated order form.
- Store all data in Local Storage through repository-style storage libraries.
- Use Redux Toolkit slices and async thunks for state management.
- Validate forms with Yup.
- Automatically generate stable UID values for clients, products, and orders.
- Automatically assign order numbers and UTC creation dates when an order is first saved.

## Data Rules

- Clients have `id` and `name`.
- Products have `id`, `name`, and `priceCents`.
- Orders have `id`, `orderNumber`, `createdAtUtc`, `clientId`, `status`, `items`, and `totalCents`.
- Order statuses are `new`, `processing`, `completed`, and `cancelled`.
- Client names are resolved by `clientId`, so renamed clients are shown with their latest name in existing orders.
- Product prices are copied into order lines when selected, so existing orders keep their original line prices.
- Clients and products cannot be deleted if they are used in any order.
- Orders cannot be deleted.
- If an order status is not `new`, only the status can be changed.

## Storage

The current persistence layer uses Local Storage with this key:

```text
hillel-react-orders.database.v1
```

The storage code is isolated in `src/lib/storage`, so it can later be replaced with API calls without changing the UI components.

## Project Structure

```text
src/
  constants/       Shared constants, including order statuses
  features/        Redux slices and feature UI components
  hooks/           App-level React hooks
  lib/storage/     Local Storage repositories
  store/           Redux store setup
  utils/           ID, money, and validation helpers
```

## Scripts

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```
