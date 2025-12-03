# Courier Delivery System Server

This is the server component of the Courier Delivery System application. It is built using Node.js and TypeScript, and it interacts with the iiko API to manage orders for couriers.

## Features

- **Order Retrieval**: Fetches orders from the iiko API and updates their status.
- **Courier Assignment**: Automatically assigns orders to couriers when they are marked as 'ready'.
- **Geolocation Verification**: Confirms the delivery by verifying the courier's geolocation against the order address.
- **Synchronization**: Synchronizes orders with 1C and PostgreSQL database.

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the server directory:
   ```
   cd courier-delivery-system/server
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Configure the environment variables as needed (e.g., database connection, API keys).

5. Start the server:
   ```
   npm start
   ```

## API Endpoints

- `GET /orders`: Retrieve a list of orders.
- `POST /orders/:id/deliver`: Mark an order as delivered and send geolocation.
- `POST /orders/:id/at-restaurant`: Update the order status to indicate the courier is at the restaurant.

## Database

The server uses PostgreSQL for data storage. Ensure that the database is set up and initialized using the provided SQL scripts in the `infra/postgres/init.sql` file.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.