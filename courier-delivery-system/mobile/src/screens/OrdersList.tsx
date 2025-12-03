import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { fetchOrders, updateOrderStatus } from '../services/api';
import OrderItem from '../components/OrderItem';
import useGeolocation from '../hooks/useGeolocation';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const { location } = useGeolocation();

  useEffect(() => {
    const getOrders = async () => {
      const fetchedOrders = await fetchOrders();
      setOrders(fetchedOrders);
    };

    getOrders();
  }, []);

  const handleDelivery = async (orderId) => {
    if (!location) {
      Alert.alert('Error', 'Unable to retrieve geolocation.');
      return;
    }

    const success = await updateOrderStatus(orderId, 'delivered', location);
    if (success) {
      Alert.alert('Success', 'Order marked as delivered.');
      setOrders(orders.filter(order => order.id !== orderId));
    } else {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const handleAtRestaurant = async (orderId) => {
    const success = await updateOrderStatus(orderId, 'at_restaurant');
    if (success) {
      Alert.alert('Success', 'Order status updated to at restaurant.');
    } else {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  return (
    <View>
      <Text>Orders List</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OrderItem
            order={item}
            onDelivered={() => handleDelivery(item.id)}
            onAtRestaurant={() => handleAtRestaurant(item.id)}
          />
        )}
      />
    </View>
  );
};

export default OrdersList;