import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Platform, ImageBackground, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../context/CartContext';
import CustomDrawer from '../components/CustomDrawer';
import SmartImage from '../components/SmartImage';

export default function RoutePrepareScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const { cartItems, getCartTotal, addToCart, removeFromCart, deleteItem, clearCart } = useCart();

    // Drawer State
    const [drawerVisible, setDrawerVisible] = useState(false);

    const { chefName, restaurantImage } = route.params || {
        chefName: "Enrico's Caribbean Cuisine",
        restaurantImage: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000'
    };

    // UI State
    const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'pickup'
    const [travelMode, setTravelMode] = useState(null); // 'walk' | 'bike' | 'run'

    // Feature State
    const [note, setNote] = useState('');
    const [isNoteVisible, setIsNoteVisible] = useState(false);
    const [tempNote, setTempNote] = useState('');

    const [couponCode, setCouponCode] = useState('');
    const [isCouponVisible, setIsCouponVisible] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { code: 'SAVE10', type: 'percent', value: 10 }

    // Filter items for this restaurant only
    const restaurantItems = cartItems.filter(item => item.restaurantName === chefName);
    const subtotal = restaurantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxes = subtotal * 0.05; // 5% tax instead of fixed 12.50
    let deliveryPrice = orderType === 'delivery' ? 2.50 : 0.00; // 2.50 delivery fee instead of 12.50

    // Discount Calculation
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = (subtotal * appliedCoupon.value) / 100;
        } else if (appliedCoupon.type === 'fixed') {
            discountAmount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'free_delivery') {
            discountAmount = deliveryPrice;
            deliveryPrice = 0; // Visually show 0
        }
    }

    const finalTotal = Math.max(0, subtotal + taxes + deliveryPrice - discountAmount);

    // --- Components ---
    const QuantityControl = ({ item }) => (
        <View style={styles.qtyContainer}>
            <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => removeFromCart(item.id, chefName)}
            >
                <Feather name="minus" size={16} color="white" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => addToCart(item, chefName)}
            >
                <Feather name="plus" size={16} color="white" />
            </TouchableOpacity>
        </View>
    );

    const TravelModeSelector = () => (
        <View style={styles.travelModeContainer}>
            <Text style={styles.travelTitle}>Choose Travel Mode</Text>
            <View style={styles.travelRow}>
                {[
                    { id: 'walk', icon: 'walk', label: 'Walk', co2: '45g' },
                    { id: 'bike', icon: 'bicycle', label: 'Bike', co2: '30g' },
                    { id: 'run', icon: 'run', label: 'Run', co2: '60g' },
                ].map((mode) => (
                    <TouchableOpacity
                        key={mode.id}
                        style={[styles.modeBtn, travelMode === mode.id && styles.modeBtnActive]}
                        onPress={() => setTravelMode(mode.id)}
                    >
                        <MaterialCommunityIcons
                            name={mode.icon}
                            size={24}
                            color={travelMode === mode.id ? 'white' : '#555'}
                        />
                        <Text style={[styles.modeLabel, travelMode === mode.id && styles.modeLabelActive]}>
                            {mode.label}
                        </Text>
                        <Text style={[styles.co2Text, travelMode === mode.id && styles.co2TextActive]}>
                            -{mode.co2}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // Navigate home if cart is empty AND screen is focused
    React.useEffect(() => {
        if (isFocused && cartItems.length === 0) {
            navigation.popToTop(); // Go back to Home
        }
    }, [cartItems, isFocused]);

    const handleApplyCoupon = (code) => {
        const cleanCode = code.toUpperCase().trim();
        let coupon = null;

        if (cleanCode === 'SAVE10') {
            coupon = { code: 'SAVE10', type: 'percent', value: 10, label: '10% Off' };
        } else if (cleanCode === 'FREEDEL') {
            coupon = { code: 'FREEDEL', type: 'free_delivery', value: 0, label: 'Free Delivery' };
        } else if (cleanCode === 'MINUS5') {
            coupon = { code: 'MINUS5', type: 'fixed', value: 5, label: '€5.00 Off' };
        }

        if (coupon) {
            setAppliedCoupon(coupon);
            // UX Improvement: No Alert, just close with visual feedback (handled by UI state)
            setCouponCode('');
            setIsCouponVisible(false);
        } else {
            Alert.alert("Invalid Coupon", "Try SAVE10, FREEDEL, or MINUS5");
        }
    };

    // --- RENDER ---
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* --- MODALS --- */}
            {/* --- MODALS --- */}
            <Modal visible={isNoteVisible} transparent animationType="slide" onRequestClose={() => setIsNoteVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Feather name="edit-3" size={32} color="white" />
                            <Text style={styles.modalTitle}>Add Note</Text>
                        </View>

                        <View style={{ padding: 24, width: '100%' }}>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="e.g. No onions, Ring doorbell..."
                                value={tempNote}
                                onChangeText={setTempNote}
                                multiline
                            />
                            <TouchableOpacity style={styles.modalBtn} onPress={() => { setNote(tempNote); setIsNoteVisible(false); }}>
                                <Text style={styles.modalBtnText}>Save Note</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 15 }} onPress={() => setIsNoteVisible(false)}>
                                <Text style={{ color: '#999', fontSize: 14 }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={isCouponVisible} transparent animationType="slide" onRequestClose={() => setIsCouponVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Feather name="gift" size={32} color="white" />
                            <Text style={styles.modalTitle}>Apply Coupon</Text>
                        </View>

                        <View style={{ padding: 24, width: '100%', alignItems: 'center' }}>
                            <TextInput
                                style={styles.couponInput}
                                placeholder="Enter Code"
                                value={couponCode}
                                onChangeText={setCouponCode}
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity style={styles.modalBtn} onPress={() => handleApplyCoupon(couponCode)}>
                                <Text style={styles.modalBtnText}>Apply Code</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 15 }} onPress={() => setIsCouponVisible(false)}>
                                <Text style={{ color: '#999', fontSize: 14 }}>Close</Text>
                            </TouchableOpacity>

                            <View style={styles.couponSuggestions}>
                                <Text style={styles.suggestionTitle}>Tap to apply:</Text>
                                <View style={styles.suggestionRow}>
                                    <TouchableOpacity onPress={() => handleApplyCoupon('SAVE10')} style={styles.codePill}><Text style={styles.codeText}>SAVE10</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleApplyCoupon('FREEDEL')} style={styles.codePill}><Text style={styles.codeText}>FREEDEL</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleApplyCoupon('MINUS5')} style={styles.codePill}><Text style={styles.codeText}>MINUS5</Text></TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Custom Drawer */}
            <CustomDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header Row (Hamburger) */}
                <View style={styles.headerRowOverlay}>
                    <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuBtn}>
                        <Ionicons name="menu" size={28} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: '#FFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 }]}>Your Order</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Hero Image Fade Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroImage}>
                        <SmartImage
                            uri={restaurantImage}
                            style={StyleSheet.absoluteFill}
                            fallbackIcon="restaurant"
                        />
                        {/* Top Gradient for Header Visibility */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0.7)', 'transparent']}
                            style={styles.heroTopGradient}
                        />
                        {/* Bottom Gradient for Content Blend */}
                        <LinearGradient
                            colors={['rgba(255,255,255,0)', 'rgba(252,252,252,1)']}
                            style={styles.heroGradient}
                        />
                    </View>
                    <View style={styles.heroContent}>
                        <Text style={styles.restaurantTitle}>{chefName}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>Min 10.00 € • Delivery fee 2.50 €</Text>
                            <Ionicons name="time-outline" size={16} color="#666" style={{ marginLeft: 'auto' }} />
                        </View>
                    </View>
                </View>

                {/* Cart Items */}
                <View style={styles.cartList}>
                    {restaurantItems.map((item) => (
                        <View key={item.id} style={styles.cartItem}>
                            <SmartImage uri={item.image} style={styles.itemImage} fallbackIcon="image" />
                            <View style={styles.itemContent}>
                                <View style={styles.itemTopRow}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <TouchableOpacity onPress={() => deleteItem(item.id, chefName)}>
                                        <Feather name="trash-2" size={18} color="#FF4444" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.itemSub}>{item.description || "Default preparation"}</Text>
                                <View style={styles.itemBottomRow}>
                                    <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
                                    <QuantityControl item={item} />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Add Note Button */}
                <TouchableOpacity style={styles.addNoteBtn} onPress={() => { setTempNote(note); setIsNoteVisible(true); }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.addNoteText}>{note ? "Note Added:" : "Add Note"}</Text>
                        {note ? <Text style={styles.notePreview} numberOfLines={1}>{note}</Text> : null}
                    </View>
                    <Feather name={note ? "edit-2" : "plus"} size={20} color="#FF7E47" />
                </TouchableOpacity>

                {/* Delivery / Pickup Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, orderType === 'delivery' && styles.toggleActive]}
                        onPress={() => setOrderType('delivery')}
                    >
                        <Text style={[styles.toggleText, orderType === 'delivery' && styles.toggleTextActive]}>Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, orderType === 'pickup' && styles.toggleActive]}
                        onPress={() => setOrderType('pickup')}
                    >
                        <Text style={[styles.toggleText, orderType === 'pickup' && styles.toggleTextActive]}>Pickup</Text>
                    </TouchableOpacity>
                </View>

                {/* CONDITIONAL: Travel Mode Selector */}
                {orderType === 'pickup' && <TravelModeSelector />}

                {/* Offers */}
                <Text style={styles.sectionHeader}>Offers and Benefits</Text>
                <TouchableOpacity style={styles.couponRow} onPress={() => setIsCouponVisible(true)}>
                    <View>
                        <Text style={styles.couponText}>{appliedCoupon ? `Applied: ${appliedCoupon.label}` : "Apply Coupon"}</Text>
                        {appliedCoupon && <Text style={{ fontSize: 10, color: 'green' }}>{appliedCoupon.code}</Text>}
                    </View>
                    <Feather name={appliedCoupon ? "check-circle" : "chevron-right"} size={20} color={appliedCoupon ? "green" : "#FF7E47"} />
                </TouchableOpacity>

                {/* Bill Details */}
                <Text style={styles.sectionHeader}>Bill Details</Text>
                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Item total</Text>
                    <Text style={styles.billValue}>{subtotal.toFixed(2)} €</Text>
                </View>
                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Delivery Price</Text>
                    <Text style={styles.billValue}>
                        {deliveryPrice === 0 && orderType === 'delivery' ? <Text style={{ color: 'green', textDecorationLine: 'line-through' }}>2.50 €</Text> : null}
                        {orderType === 'delivery' && deliveryPrice > 0 ? "2.50 €" : "0.00 €"}
                    </Text>
                </View>
                {/* Discount Row */}
                {discountAmount > 0 && (
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: 'green' }]}>Discount</Text>
                        <Text style={[styles.billValue, { color: 'green' }]}>- {discountAmount.toFixed(2)} €</Text>
                    </View>
                )}
                <View style={[styles.billRow, { marginTop: 10 }]}>
                    <Text style={[styles.billLabel, { fontSize: 18, color: '#000' }]}>Total</Text>
                    <Text style={[styles.billValue, { fontSize: 18, color: '#FF7E47' }]}>{finalTotal.toFixed(2)} €</Text>
                </View>

            </ScrollView>

            {/* Add Note Button */}
            <TouchableOpacity style={styles.addNoteBtn} onPress={() => { setTempNote(note); setIsNoteVisible(true); }}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.addNoteText}>{note ? "Note Added:" : "Add Note"}</Text>
                    {note ? <Text style={styles.notePreview} numberOfLines={1}>{note}</Text> : null}
                </View>
                <Feather name={note ? "edit-2" : "plus"} size={20} color="#FF7E47" />
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.scheduleBtnOutline}>
                    <Text style={styles.scheduleBtnText}>Schedule Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.buyBtn}
                    onPress={() => {
                        if (orderType === 'pickup' && !travelMode) {
                            Alert.alert("Choose Mode", "Please select how you will pick up your order.");
                            return;
                        }
                        // Navigate logic ...
                        const navParams = {
                            chefName,
                            total: finalTotal,
                            orderType,
                            note, // Pass note
                            discount: discountAmount // Pass discount info
                        };

                        if (orderType === 'pickup') {
                            navParams.travelMode = travelMode;
                            navigation.navigate('Payment', navParams);
                        } else {
                            // Delivery flow: Navigate to Payment
                            navigation.navigate('Payment', navParams);
                        }
                    }}
                >
                    <Text style={styles.buyBtnText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FCFCFC' },
    scrollContent: { paddingBottom: 100 }, // Remove top padding to allow image bleed

    // Header Overlay
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerRowOverlay: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },

    // Empty State
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' },
    goHomeBtn: { marginTop: 30, backgroundColor: '#FF7E47', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    goHomeText: { color: 'white', fontWeight: 'bold' },

    // Hero Section with Fade
    heroSection: { marginBottom: 10 },
    heroImage: { width: '100%', height: 200, justifyContent: 'flex-end', backgroundColor: '#e1e1e1' },
    heroGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 },
    heroTopGradient: { position: 'absolute', left: 0, right: 0, top: 0, height: 120 },
    heroContent: { paddingHorizontal: 16, marginTop: -30 }, // Pull up over fade

    // Title Block
    restaurantTitle: { fontSize: 22, fontWeight: 'bold', color: '#FF7E47', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    metaText: { fontSize: 12, fontWeight: 'bold', color: '#111' },

    // Cart Items
    cartList: { paddingHorizontal: 16, marginBottom: 10 },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
    },
    itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee', marginRight: 12 },
    itemContent: { flex: 1, justifyContent: 'space-between' },
    itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    itemName: { fontSize: 16, fontWeight: 'bold', color: '#111', flex: 1, marginRight: 8 },
    itemSub: { fontSize: 11, color: '#999', marginTop: 2 },
    itemBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#111' },

    // Qty
    qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF7E47', borderRadius: 8, padding: 4 },
    qtyBtn: { padding: 2 },
    qtyText: { color: 'white', fontWeight: 'bold', marginHorizontal: 8 },

    // Add Note
    addNoteBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 20,
        marginHorizontal: 16,
        borderWidth: 1, borderColor: '#eee'
    },
    addNoteText: { fontWeight: 'bold', color: '#111' },

    // Sections
    sectionHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 10, marginLeft: 16 },

    // Toggle
    toggleContainer: {
        flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 25,
        padding: 4, marginBottom: 20, height: 50, marginHorizontal: 16
    },
    toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
    toggleActive: { backgroundColor: '#FF7E47' },
    toggleText: { fontWeight: '600', color: '#666' },
    toggleTextActive: { color: 'white', fontWeight: 'bold' },

    // Travel Mode
    travelModeContainer: { marginBottom: 20, padding: 10, backgroundColor: '#FFF0E8', borderRadius: 12, marginHorizontal: 16 },
    travelTitle: { fontWeight: 'bold', marginBottom: 10, color: '#FF7E47' },
    travelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    modeBtn: {
        alignItems: 'center', padding: 10, backgroundColor: 'white',
        borderRadius: 10, width: '30%', elevation: 1
    },
    modeBtnActive: { backgroundColor: '#FF7E47' },
    modeLabel: { fontSize: 12, fontWeight: '600', marginTop: 4, color: '#333' },
    modeLabelActive: { color: 'white' },
    co2Text: { fontSize: 10, color: 'green', marginTop: 2, fontWeight: 'bold' },
    co2TextActive: { color: 'white' },

    // Offers
    couponRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFF9F5', // Very light orange tint
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 16,
        borderWidth: 2,
        borderColor: '#FF7E47', // Brand color
        borderStyle: 'dashed', // Ticket look
    },
    couponText: { fontWeight: 'bold', color: '#FF7E47', fontSize: 16 },

    // Bill
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginHorizontal: 16 },
    billLabel: { fontSize: 14, fontWeight: '600', color: '#111' },
    billValue: { fontSize: 14, fontWeight: 'bold', color: '#111' },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white', padding: 16, flexDirection: 'row',
        borderTopWidth: 1, borderTopColor: '#eee', justifyContent: 'space-between'
    },
    scheduleBtnOutline: {
        flex: 1, marginRight: 10, borderWidth: 1, borderColor: '#FF7E47',
        borderRadius: 25, alignItems: 'center', justifyContent: 'center', paddingVertical: 14
    },
    scheduleBtnText: { color: '#FF7E47', fontWeight: 'bold', fontSize: 16 },
    buyBtn: {
        flex: 1, marginLeft: 10, backgroundColor: '#FF7E47',
        borderRadius: 25, alignItems: 'center', justifyContent: 'center', paddingVertical: 14
    },
    buyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: {
        backgroundColor: 'white',
        width: '85%',
        borderRadius: 24,
        alignItems: 'center',
        elevation: 15,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
        overflow: 'hidden'
    },
    modalHeader: {
        backgroundColor: '#FF7E47', // Brand Orange
        width: '100%',
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0
    },
    modalTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginTop: 8 },

    // Inputs
    noteInput: {
        width: '100%', height: 120, backgroundColor: '#F9F9F9', borderRadius: 12, padding: 16,
        textAlignVertical: 'top', marginBottom: 20,
        borderWidth: 1, borderColor: '#F0F0F0',
        fontSize: 15, color: '#333'
    },
    couponInput: {
        width: '100%', height: 50, backgroundColor: '#F9F9F9', borderRadius: 12, padding: 12, marginBottom: 20,
        borderWidth: 1, borderColor: '#F0F0F0',
        textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#333'
    },

    // Buttons
    modalBtn: {
        backgroundColor: '#FF7E47',
        paddingVertical: 14,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#FF7E47', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
    },
    modalBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Suggestions
    couponSuggestions: { marginTop: 24, width: '100%', alignItems: 'center' },
    suggestionTitle: { fontSize: 14, color: '#999', marginBottom: 10 },
    suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    codePill: { backgroundColor: '#FFF0E8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, margin: 4, borderWidth: 1, borderColor: '#FFDEC8' },
    codeText: { color: '#FF7E47', fontWeight: 'bold', fontSize: 12 },
});
