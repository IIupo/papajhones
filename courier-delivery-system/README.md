# Courier Delivery System

## Overview
The Courier Delivery System is a mobile application and server solution designed to facilitate the management of courier orders. The mobile application allows couriers to view their assigned orders, update their status, and confirm deliveries using geolocation. The server retrieves orders from the iiko API, synchronizes them with 1C and a PostgreSQL database, and manages the assignment of orders to couriers.

## Project Structure
The project consists of two main components: the mobile application and the server.

### Mobile Application
- **Location**: `mobile/`
- **Technologies**: React Native, TypeScript
- **Key Files**:
  - `App.tsx`: Entry point of the mobile application.
  - `screens/OrdersList.tsx`: Displays a list of orders for couriers.
  - `screens/OrderDetail.tsx`: Shows details of a specific order.
  - `components/DeliveredButton.tsx`: Button to confirm delivery.
  - `components/AtRestaurantButton.tsx`: Button to mark as at the restaurant.

### Server
- **Location**: `server/`
- **Technologies**: Node.js, Express, TypeScript
- **Key Files**:
  - `index.ts`: Entry point of the server application.
  - `routes/orders.ts`: Routes for order management.
  - `controllers/ordersController.ts`: Handles order-related requests.
  - `services/iikoClient.ts`: Interacts with the iiko API.
  - `services/oneCClient.ts`: Synchronizes orders with 1C.
  - `db/postgres.ts`: Connects to the PostgreSQL database.

## Features
- **Order Management**: Retrieve and update order statuses based on their readiness.
- **Geolocation**: Couriers can send their geolocation to confirm deliveries.
- **Status Updates**: Couriers can mark themselves as 'at the restaurant' to update order statuses.
- **Synchronization**: Orders are synchronized with external systems (iiko and 1C) and stored in a PostgreSQL database.

## Getting Started
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd courier-delivery-system
   ```

2. **Set up the mobile application**:
   - Navigate to the `mobile` directory.
   - Install dependencies:
     ```
     npm install
     ```
   - Run the application:
     ```
     npm start
     ```

3. **Set up the server**:
   - Navigate to the `server` directory.
   - Install dependencies:
     ```
     npm install
     ```
   - Run the server:
     ```
     npm start
     ```

4. **Database Initialization**:
   - Ensure PostgreSQL is running and execute the SQL commands in `infra/postgres/init.sql` to set up the database.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.