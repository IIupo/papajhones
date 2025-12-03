#!/bin/bash

# Sync orders from iiko API to PostgreSQL and 1C

# Fetch orders from iiko API
echo "Fetching orders from iiko API..."
node server/src/services/iikoClient.js fetchOrders

# Sync orders with PostgreSQL
echo "Syncing orders with PostgreSQL..."
node server/src/db/postgres.js syncOrders

# Sync orders with 1C
echo "Syncing orders with 1C..."
node server/src/services/oneCClient.js syncOrders

echo "Order synchronization completed."