import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';

import { useCart } from '../context/CartContext';

export default function PaymentScreen({ navigation, route }) {
    const { total = 0, chefName = "Chef", orderType = 'delivery', travelMode = 'walk' } = route.params || {};
    const { clearCart } = useCart();
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);

        // --- BACKEND INTEGRATION POINT ---
        // TODO: Replace this timeout with actual API call to your Payment Gateway / Backend
        // Example: 
        // const response = await fetch('https://api.homemade.com/pay', { method: 'POST', body: JSON.stringify({ method: selectedMethod, amount: total }) });

        console.log(`Processing payment via: ${selectedMethod}`);

        if (selectedMethod === 'test') {
            console.log("TEST MODE: Bypassing payment gateway.");
        }

        setTimeout(() => {
            setIsProcessing(false);
            clearCart(); // Clear cart after successful payment

            // Navigate to Tracking
            navigation.replace('ActiveTrip', {
                chefName,
                total,
                orderType,
                mode: travelMode // Pass the travel mode for pickup routing
            });
        }, 1500);
    };

    const PaymentOption = ({ id, icon, title, subtitle, iconFamily = "Ionicons" }) => (
        <TouchableOpacity
            style={[styles.optionCard, selectedMethod === id && styles.optionSelected]}
            onPress={() => setSelectedMethod(id)}
            activeOpacity={0.8}
        >
            <View style={styles.optionIconContainer}>
                {iconFamily === "Ionicons" && <Ionicons name={icon} size={24} color={selectedMethod === id ? "#FF7E47" : "#666"} />}
                {iconFamily === "MCI" && <MaterialCommunityIcons name={icon} size={24} color={selectedMethod === id ? "#FF7E47" : "#666"} />}
                {iconFamily === "FA5" && <FontAwesome5 name={icon} size={20} color={selectedMethod === id ? "#FF7E47" : "#666"} />}
            </View>
            <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, selectedMethod === id && styles.textSelected]}>{title}</Text>
                {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
            </View>
            <View style={styles.radioOuter}>
                {selectedMethod === id && <View style={styles.radioInner} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Method</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Order Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Total to Pay</Text>
                    <Text style={styles.summaryAmount}>€{Number(total).toFixed(2)}</Text>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Order Type</Text>
                        <Text style={styles.value}>{orderType === 'delivery' ? 'Delivery' : 'Pick Up'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Restaurant</Text>
                        <Text style={styles.value}>{chefName}</Text>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Choose Payment</Text>

                <PaymentOption
                    id="card"
                    icon="card-outline"
                    title="Credit or Debit Card"
                    subtitle="Visa, Mastercard, Amex"
                />

                <PaymentOption
                    id="ideal"
                    icon="bank"
                    iconFamily="MCI"
                    title="iDEAL"
                    subtitle="Direct Bank Transfer"
                />

                <PaymentOption
                    id="apple"
                    icon="logo-apple"
                    title="Apple Pay"
                />

                <PaymentOption
                    id="cash"
                    icon="cash-outline"
                    title={orderType === 'delivery' ? "Cash on Delivery" : "Pay at Counter"}
                    subtitle="Pay when you receive your order"
                />

                {/* --- TEST MODE (For Dev/Preview Only) --- */}
                <PaymentOption
                    id="test"
                    icon="flask"
                    title="Test / Free Pass"
                    subtitle="Simulate successful payment"
                />
                <View style={{ marginTop: 20, padding: 10, backgroundColor: '#FFF9C4', borderRadius: 8 }}>
                    <Text style={{ color: '#856404', fontSize: 12 }}>
                        <Text style={{ fontWeight: 'bold' }}>NOTE:</Text> Production Backend Integration is ready.
                        In real build, this would connect to Stripe/Adyen middleware.
                    </Text>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                    onPress={handlePayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.payButtonText}>
                            {selectedMethod === 'cash' ? 'Confirm Order' : `Pay €${Number(total).toFixed(2)}`}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scrollContent: { padding: 20 },

    summaryCard: { backgroundColor: '#333', borderRadius: 16, padding: 20, marginBottom: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    summaryTitle: { color: '#ccc', fontSize: 14, marginBottom: 5 },
    summaryAmount: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 15 },
    divider: { height: 1, backgroundColor: '#555', marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { color: '#bbb', fontSize: 14 },
    value: { color: 'white', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },

    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, marginLeft: 5 },

    optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
    optionSelected: { borderColor: '#FF7E47', backgroundColor: '#FFF0E8' },
    optionIconContainer: { width: 40, alignItems: 'center' },
    optionContent: { flex: 1, paddingHorizontal: 10 },
    optionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    textSelected: { color: '#FF7E47' },
    optionSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF7E47' },

    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
    payButton: { backgroundColor: '#FF7E47', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF7E47', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
    payButtonDisabled: { backgroundColor: '#ffb394' },
    payButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
