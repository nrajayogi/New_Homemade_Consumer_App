import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Vibration pattern: [wait, vibrate, wait, vibrate]
const VIBRATION_PATTERN = [0, 500, 200, 500];

const STORAGE_KEYS = {
    CART_TIMESTAMP: '@homemade_cart_timestamp',
    NOTIFICATION_ID: '@homemade_notification_id',
};

class NotificationService {
    constructor() {
        this.notificationListener = null;
        this.responseListener = null;
        this.abandonedCartTimer = null;
    }

    /**
     * Initialize notification service and request permissions
     * @returns {Promise<string|null>} Push token or null if permissions denied
     */
    async initialize() {
        try {
            // Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('[NotificationService] Permission not granted');
                return null;
            }

            // Configure Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('cart-reminders', {
                    name: 'Cart Reminders',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: VIBRATION_PATTERN,
                    sound: 'whistle.mp3', // Custom sound
                    enableVibrate: true,
                    showBadge: true,
                });

                await Notifications.setNotificationChannelAsync('order-updates', {
                    name: 'Order Updates',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: VIBRATION_PATTERN,
                    sound: 'whistle.mp3', // Custom sound
                    enableVibrate: true,
                    showBadge: true,
                });
            }

            // Get push token (for future remote notifications)
            if (Device.isDevice) {
                const token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log('[NotificationService] Push token:', token);
                return token;
            }

            return null;
        } catch (error) {
            console.error('[NotificationService] Initialization error:', error);
            return null;
        }
    }

    /**
     * Set up notification listeners
     * @param {Function} onNotificationReceived - Callback when notification is received
     * @param {Function} onNotificationTapped - Callback when notification is tapped
     */
    setupListeners(onNotificationReceived, onNotificationTapped) {
        // Listener for notifications received while app is foregrounded
        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('[NotificationService] Notification received:', notification);
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            }
        });

        // Listener for when user taps on notification
        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('[NotificationService] Notification tapped:', response);
            if (onNotificationTapped) {
                onNotificationTapped(response);
            }
        });
    }

    /**
     * Remove notification listeners
     */
    removeListeners() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(this.notificationListener);
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener);
        }
    }

    /**
     * Schedule abandoned cart notification
     * @param {number} itemCount - Number of items in cart
     * @param {number} delayMinutes - Delay in minutes before notification (default: 15)
     */
    async scheduleAbandonedCartNotification(itemCount, delayMinutes = 15) {
        try {
            // Cancel any existing notification
            await this.cancelAbandonedCartNotification();

            // Schedule new notification
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🍽️ Complete Your Order',
                    body: `You have ${itemCount} delicious ${itemCount === 1 ? 'item' : 'items'} waiting in your cart!`,
                    data: { type: 'abandoned_cart', itemCount },
                    sound: 'default',
                    vibrate: VIBRATION_PATTERN,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    categoryIdentifier: 'cart-reminders',
                },
                trigger: {
                    seconds: delayMinutes * 60,
                    channelId: 'cart-reminders',
                },
            });

            // Store notification ID for later cancellation
            await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_ID, notificationId);

            console.log(`[NotificationService] Scheduled abandoned cart notification (${delayMinutes} min):`, notificationId);

            return notificationId;
        } catch (error) {
            console.error('[NotificationService] Error scheduling notification:', error);
            return null;
        }
    }

    /**
     * Cancel abandoned cart notification
     */
    async cancelAbandonedCartNotification() {
        try {
            const notificationId = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_ID);

            if (notificationId) {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
                await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_ID);
                console.log('[NotificationService] Cancelled abandoned cart notification:', notificationId);
            }
        } catch (error) {
            console.error('[NotificationService] Error cancelling notification:', error);
        }
    }

    /**
     * Send immediate notification (for order updates, cooking status, etc.)
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {object} data - Additional data
     */
    async sendImmediateNotification(title, body, data = {}) {
        try {
            // Trigger vibration
            Vibration.vibrate(VIBRATION_PATTERN);

            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: 'default',
                    vibrate: VIBRATION_PATTERN,
                    priority: Notifications.AndroidNotificationPriority.MAX,
                    categoryIdentifier: 'order-updates',
                },
                trigger: null, // Immediate
            });

            console.log('[NotificationService] Sent immediate notification:', title);
        } catch (error) {
            console.error('[NotificationService] Error sending notification:', error);
        }
    }

    /**
     * Update cart timestamp in storage
     * @param {Date} timestamp - Timestamp when cart was modified
     */
    async updateCartTimestamp(timestamp = new Date()) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.CART_TIMESTAMP, timestamp.toISOString());
        } catch (error) {
            console.error('[NotificationService] Error updating cart timestamp:', error);
        }
    }

    /**
     * Get cart timestamp from storage
     * @returns {Promise<Date|null>} Cart timestamp or null
     */
    async getCartTimestamp() {
        try {
            const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.CART_TIMESTAMP);
            return timestamp ? new Date(timestamp) : null;
        } catch (error) {
            console.error('[NotificationService] Error getting cart timestamp:', error);
            return null;
        }
    }

    /**
     * Clear cart timestamp from storage
     */
    async clearCartTimestamp() {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.CART_TIMESTAMP);
        } catch (error) {
            console.error('[NotificationService] Error clearing cart timestamp:', error);
        }
    }

    /**
     * Get all scheduled notifications (for debugging)
     */
    async getScheduledNotifications() {
        try {
            const notifications = await Notifications.getAllScheduledNotificationsAsync();
            console.log('[NotificationService] Scheduled notifications:', notifications);
            return notifications;
        } catch (error) {
            console.error('[NotificationService] Error getting scheduled notifications:', error);
            return [];
        }
    }

    /**
     * Cancel all notifications
     */
    async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_ID);
            console.log('[NotificationService] Cancelled all notifications');
        } catch (error) {
            console.error('[NotificationService] Error cancelling all notifications:', error);
        }
    }
}

export default new NotificationService();
