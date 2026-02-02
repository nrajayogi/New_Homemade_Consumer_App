import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = '@homemade_cart';
const ABANDONED_CART_DELAY_MINUTES = 15; // Trigger notification after 15 minutes

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [abandonedCartTimer, setAbandonedCartTimer] = useState(null);

    // Load cart from storage on mount
    useEffect(() => {
        loadCart();
    }, []);

    // Save cart to storage whenever it changes
    useEffect(() => {
        saveCart();
        handleCartChange();
    }, [cartItems]);

    /**
     * Load cart from AsyncStorage
     */
    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);

                // Check if we should schedule notification for existing cart
                if (parsedCart.length > 0) {
                    const timestamp = await NotificationService.getCartTimestamp();
                    if (timestamp) {
                        const minutesSinceUpdate = (new Date() - timestamp) / 1000 / 60;
                        const remainingMinutes = ABANDONED_CART_DELAY_MINUTES - minutesSinceUpdate;

                        if (remainingMinutes > 0) {
                            // Reschedule notification for remaining time
                            await NotificationService.scheduleAbandonedCartNotification(
                                parsedCart.reduce((total, item) => total + item.quantity, 0),
                                remainingMinutes
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[CartContext] Error loading cart:', error);
        }
    };

    /**
     * Save cart to AsyncStorage
     */
    const saveCart = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error('[CartContext] Error saving cart:', error);
        }
    };

    /**
     * Handle cart changes - schedule or cancel abandoned cart notification
     */
    const handleCartChange = async () => {
        // Cancel existing timer
        if (abandonedCartTimer) {
            clearTimeout(abandonedCartTimer);
        }

        if (cartItems.length > 0) {
            // Update timestamp
            await NotificationService.updateCartTimestamp();

            // Schedule abandoned cart notification
            const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
            await NotificationService.scheduleAbandonedCartNotification(
                itemCount,
                ABANDONED_CART_DELAY_MINUTES
            );
        } else {
            // Cart is empty, cancel notification and clear timestamp
            await NotificationService.cancelAbandonedCartNotification();
            await NotificationService.clearCartTimestamp();
        }
    };

    // Add item to cart
    const addToCart = (item, restaurantName) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(i => i.id === item.id && i.restaurantName === restaurantName);

            if (existingItemIndex > -1) {
                // Increment quantity immutably
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + 1
                };
                return newItems;
            } else {
                // Add new item
                return [...prevItems, { ...item, restaurantName, quantity: 1 }];
            }
        });
    };

    // Remove item from cart
    const removeFromCart = (itemId, restaurantName) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(i => i.id === itemId && i.restaurantName === restaurantName);

            if (existingItemIndex > -1) {
                const currentItem = prevItems[existingItemIndex];
                if (currentItem.quantity > 1) {
                    // Decrement immutably
                    const newItems = [...prevItems];
                    newItems[existingItemIndex] = {
                        ...newItems[existingItemIndex],
                        quantity: newItems[existingItemIndex].quantity - 1
                    };
                    return newItems;
                } else {
                    // Remove
                    return prevItems.filter(i => !(i.id === itemId && i.restaurantName === restaurantName));
                }
            }
            return prevItems;
        });
    };

    // Get quantity of specific item
    const getItemQuantity = (itemId, restaurantName) => {
        const item = cartItems.find(i => i.id === itemId && i.restaurantName === restaurantName);
        return item ? item.quantity : 0;
    };

    // Get total items in cart (sum of quantities)
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Get total price
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Clear entire cart (called after successful checkout)
    const clearCart = async () => {
        setCartItems([]);
        await NotificationService.cancelAbandonedCartNotification();
        await NotificationService.clearCartTimestamp();
        await AsyncStorage.removeItem(STORAGE_KEY);
    };

    // Completely remove item regardless of quantity
    const deleteItem = (itemId, restaurantName) => {
        setCartItems(prevItems => prevItems.filter(i => !(i.id === itemId && i.restaurantName === restaurantName)));
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            deleteItem,
            getItemQuantity,
            getCartCount,
            getCartTotal,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
