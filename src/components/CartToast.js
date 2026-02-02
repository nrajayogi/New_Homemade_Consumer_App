import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CartToast = ({ count, onPress }) => {
    if (count === 0) return null; // Hide if empty

    return (
        <View style={styles.toastContainer}>
            <View style={styles.toastContent}>
                <View style={styles.toastLeft}>
                    <Feather name="shopping-bag" size={22} color="#111" />
                    <Text style={styles.toastText}>{count} items Added to{"\n"}cart</Text>
                </View>
                <TouchableOpacity style={styles.toastButton} onPress={onPress}>
                    <Text style={styles.toastButtonText}>Go to Cart</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    toastContainer: { position: 'absolute', bottom: 30, left: 16, right: 16, zIndex: 100 }, // Added zIndex
    toastContent: {
        backgroundColor: 'rgba(215, 215, 215, 0.95)', // Increased Opacity/Blush
        borderRadius: 24,
        padding: 6,
        paddingLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    toastLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    toastText: {
        color: '#111',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 12,
        lineHeight: 20
    },
    toastButton: {
        backgroundColor: '#EA7C3A',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        height: '100%',
        justifyContent: 'center'
    },
    toastButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default CartToast;
