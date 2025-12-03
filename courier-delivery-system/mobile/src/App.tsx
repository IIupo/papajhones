import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OrdersList from './screens/OrdersList';
import OrderDetail from './screens/OrderDetail';
import MapViewScreen from './screens/MapViewScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="OrdersList">
        <Stack.Screen name="OrdersList" component={OrdersList} />
        <Stack.Screen name="OrderDetail" component={OrderDetail} />
        <Stack.Screen name="MapView" component={MapViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;