import React from 'react';
import { Button, Alert } from 'react-native';
import { useGeolocation } from '../hooks/useGeolocation';
import { markOrderAsDelivered } from '../services/api';

interface DeliveredButtonProps {
  orderId: string;
  orderAddress: string;
}

const DeliveredButton: React.FC<DeliveredButtonProps> = ({ orderId, orderAddress }) => {
  const { getCurrentLocation } = useGeolocation();

  const handleDelivery = async () => {
    const location = await getCurrentLocation();
    if (location) {
      const isLocationValid = await verifyLocation(location, orderAddress);
      if (isLocationValid) {
        await markOrderAsDelivered(orderId, location);
        Alert.alert('Success', 'Заказ отмечен как доставленный');
      } else {
        Alert.alert('Error', 'Ваш адрес не совпадает с адресом доставки');
      }
    } else {
      Alert.alert('Error', 'Не могу получить вашу геопозицию');
    }
  };

  return (
    <Button title="Mark as Delivered" onPress={handleDelivery} />
  );
};

export default DeliveredButton;