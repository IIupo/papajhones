# Courier Delivery System Mobile Application

This is the mobile application for the Courier Delivery System, built using React Native. The application allows couriers to manage their orders, update their status, and confirm deliveries.

## Features

- **Order List**: View a list of orders assigned to the courier.
- **Order Details**: Access detailed information about each order, including delivery options.
- **Geolocation**: Send geolocation data to confirm deliveries and update order status.
- **Navigation**: Navigate to the restaurant using a map view.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the mobile directory:
   ```
   cd courier-delivery-system/mobile
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

To run the application, use the following command:
```
npm start
```

This will start the Metro bundler. You can then run the app on an emulator or a physical device.

## Development

- The main entry point of the application is located in `src/App.tsx`.
- Screens are organized in the `src/screens` directory.
- Reusable components can be found in the `src/components` directory.
- API calls are managed in the `src/services/api.ts` file.
- Geolocation handling is implemented in the `src/hooks/useGeolocation.ts` file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.