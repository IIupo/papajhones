import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import useGeolocation from '../hooks/useGeolocation';
import { getOrderLocation } from '../services/api';

const MapViewScreen = ({ route }) => {
    const { orderId } = route.params;
    const [orderLocation, setOrderLocation] = useState(null);
    const { location, requestLocationPermission } = useGeolocation();

    useEffect(() => {
        const fetchOrderLocation = async () => {
            const locationData = await getOrderLocation(orderId);
            setOrderLocation(locationData);
        };

        fetchOrderLocation();
    }, [orderId]);

    const handleDeliver = () => {
        // Logic to handle delivery confirmation
    };

    const handleAtRestaurant = () => {
        // Logic to update status to 'at restaurant'
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {orderLocation && (
                    <Marker
                        coordinate={{
                            latitude: orderLocation.latitude,
                            longitude: orderLocation.longitude,
                        }}
                        title="Order Location"
                    />
                )}
            </MapView>
            <Button title="Deliver" onPress={handleDeliver} />
            <Button title="At Restaurant" onPress={handleAtRestaurant} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '80%',
    },
});

export default MapViewScreen;