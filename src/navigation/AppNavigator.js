import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import OrderScreen from '../screens/OrderScreen';
import RoutePrepareScreen from '../screens/RoutePrepareScreen';
import ActiveTripScreen from '../screens/ActiveTripScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EcoProofCameraScreen from '../screens/EcoProofCameraScreen';
import AIChatScreen from '../screens/AIChatScreen';
import RewardsScreen from '../screens/RewardsScreen';
import RewardShopScreen from '../screens/RewardShopScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Order" component={OrderScreen} />
                <Stack.Screen name="RoutePrepare" component={RoutePrepareScreen} />
                <Stack.Screen name="Payment" component={PaymentScreen} />
                <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="EcoProofCamera" component={EcoProofCameraScreen} />
                <Stack.Screen name="AIChat" component={AIChatScreen} />
                <Stack.Screen name="Rewards" component={RewardsScreen} />
                <Stack.Screen name="RewardShop" component={RewardShopScreen} />
                <Stack.Screen name="Notifications" component={NotificationScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
