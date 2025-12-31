import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface OrderItemProps {
  orderId: string;
  orderDetails: string;
  onDelivered: (orderId: string, geolocation: { latitude: number; longitude: number }) => void;
  onAtRestaurant: (orderId: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ orderId, orderDetails, onDelivered, onAtRestaurant }) => {
  const handleDelivered = () => {
    // Get geolocation (this should be replaced with actual geolocation retrieval logic)
    const geolocation = { latitude: 0, longitude: 0 }; // Placeholder values
    onDelivered(orderId, geolocation);
  };

  const handleAtRestaurant = () => {
    onAtRestaurant(orderId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.orderDetails}>{orderDetails}</Text>
      <Button title="Доставлено" onPress={handleDelivered} />
      <Button title="В ресторане" onPress={handleAtRestaurant} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  orderDetails: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default OrderItem;