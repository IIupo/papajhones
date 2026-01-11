import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getOrderDetails, markAsDelivered, markAtRestaurant } from '../services/api';
import useGeolocation from '../hooks/useGeolocation';

const OrderDetail = () => {
  const route = useRoute();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const { location } = useGeolocation();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderDetails = await getOrderDetails(orderId);
      setOrder(orderDetails);
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleDelivery = async () => {
    if (location) {
      const response = await markAsDelivered(orderId, location);
      if (response.success) {
        Alert.alert('Success', 'Order marked as delivered!');
      } else {
        Alert.alert('Error', 'Failed to mark order as delivered.');
      }
    } else {
      Alert.alert('Error', 'Unable to retrieve location.');
    }
  };

  const handleAtRestaurant = async () => {
    const response = await markAtRestaurant(orderId);
    if (response.success) {
      Alert.alert('Success', 'Order status updated to at restaurant!');
    } else {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  if (!order) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>Order ID: {order.id}</Text>
      <Text>Customer Name: {order.customerName}</Text>
      <Text>Address: {order.address}</Text>
      <Button title="Mark as Delivered" onPress={handleDelivery} />
      <Button title="I am at the Restaurant" onPress={handleAtRestaurant} />
    </View>
  );
};

export default OrderDetail;