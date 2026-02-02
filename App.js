import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { CartProvider } from './src/context/CartContext';
import { RewardsProvider } from './src/context/RewardsContext';
import NotificationService from './src/services/NotificationService';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  const navigationRef = useRef();

  useEffect(() => {
    // Initialize notification service
    NotificationService.initialize();

    // Set up notification listeners
    NotificationService.setupListeners(
      (notification) => {
        // Handle notification received while app is open
        console.log('[App] Notification received:', notification);
      },
      (response) => {
        // Handle notification tap - navigate to cart
        console.log('[App] Notification tapped:', response);
        const notificationType = response.notification.request.content.data?.type;

        if (notificationType === 'abandoned_cart' && navigationRef.current) {
          // Navigate to cart/checkout screen
          navigationRef.current.navigate('RoutePrepare');
        } else if (navigationRef.current) {
          // Default: Navigate to Notifications screen
          navigationRef.current.navigate('Notifications');
        }
      }
    );

    // Cleanup listeners on unmount
    return () => {
      NotificationService.removeListeners();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <CartProvider>
          <RewardsProvider>
            <AppNavigator ref={navigationRef} />
          </RewardsProvider>
        </CartProvider>
      </ErrorBoundary>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
