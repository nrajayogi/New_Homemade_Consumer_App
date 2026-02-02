import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Platform, ImageBackground, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure this is installed/imported if used, though strict SmartImage usage replaced some gradients? NO, hero uses separate overlays. Actually I used View + SmartImage in RoutePrepare, here I used ... wait.
// In OrderScreen previous code:
// line 140: View style={styles.heroImage} -> SmartImage absolute fill.
// line 2: ImageBackground import exists.

import { useCart } from '../context/CartContext';
import CartToast from '../components/CartToast';
import SmartImage from '../components/SmartImage';

const { width } = Dimensions.get('window');

// --- MOCK DATA ---
const FEATURED_ITEMS = [ // Compact Carousel
    { id: 'f1', type: 'food', name: 'Jerk Drums', price: 10.00, dietary: 'non-veg', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000' },
    { id: 'f2', type: 'food', name: 'Veggie Bowl', price: 8.50, dietary: 'veg', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000' },
    { id: 'f3', type: 'food', name: 'Spicy Wrap', price: 9.00, dietary: 'non-veg', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000' }
];

const MAIN_MENU_ITEMS = [ // Vertical/Horizontal List
    { id: '1', name: 'Jerk Chicken with Rice', description: 'Choice of: Garlic sauce, Homemade sauce. Spicy and tender.', price: 10.00, dietary: 'non-veg', meta: '23 mins • 5 km', cardStyle: 'horizontal', image: 'https://images.unsplash.com/photo-1594221708779-91b404d7c07c?q=80&w=1000' },
    { id: '2', name: 'Smoked BBQ Ribs', description: 'Slow cooked pork ribs with a sticky honey glaze.', price: 14.50, dietary: 'non-veg', meta: '35 mins • 5 km', cardStyle: 'vertical', image: 'https://images.unsplash.com/photo-1544025162-d76690b67f11?q=80&w=1000' },
    { id: '3', name: 'Caribbean Curry Goat', description: 'Traditional goat curry with potatoes and spices.', price: 12.00, dietary: 'non-veg', meta: '30 mins • 5 km', cardStyle: 'horizontal', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000' },
    { id: '4', name: 'Vegan Rasta Pasta', description: 'Creamy coconut pasta with colorful bell peppers.', price: 9.50, dietary: 'vegan', meta: '15 mins • 5 km', cardStyle: 'horizontal', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000' }
];

// --- COMPONENTS ---

const QuantityControl = ({ quantity, onIncrement, onDecrement, styleType = 'standard' }) => (
    <View style={[styles.quantityControl, styleType === 'horizontal' && styles.qtyHorizontal, styleType === 'compact' && styles.qtyCompact]}>
        <TouchableOpacity onPress={onDecrement} style={[styles.qtyBtn, styleType === 'compact' && styles.qtyBtnCompact]}>
            <Feather name="minus" size={styleType === 'compact' ? 14 : 18} color="white" />
        </TouchableOpacity>
        <Text style={[styles.qtyText, styleType === 'compact' && styles.qtyTextCompact]}>{quantity}</Text>
        <TouchableOpacity onPress={onIncrement} style={[styles.qtyBtn, styleType === 'compact' && styles.qtyBtnCompact]}>
            <Feather name="plus" size={styleType === 'compact' ? 14 : 18} color="white" />
        </TouchableOpacity>
    </View>
);

const DietaryBadge = ({ type }) => {
    if (!type) return null;
    const isVeg = type === 'veg' || type === 'vegan';
    return (
        <View style={styles.dietaryBadge}>
            {isVeg ? (<View style={styles.vegIcon}><MaterialCommunityIcons name="leaf" size={12} color="white" /></View>) : (<View style={styles.nonVegIcon} />)}
        </View>
    );
};

const MenuCardCompact = ({ item, restaurantName }) => {
    const { getItemQuantity, addToCart, removeFromCart } = useCart();
    const quantity = getItemQuantity(item.id, restaurantName);

    return (
        <View style={styles.cardCompact}>
            <View style={styles.imageContainerCompact}>
                <SmartImage uri={item.image} style={styles.cardImage} fallbackIcon="image" />
                <DietaryBadge type={item.dietary} />
            </View>
            <View style={styles.contentCompact}>
                <Text style={styles.itemTitleCompact} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemDescCompact}>Choice of: Sauce...</Text>
                <View style={styles.footerCompact}>
                    <Text style={styles.priceCompact}>{item.price.toFixed(2)}€</Text>
                    <QuantityControl
                        quantity={quantity}
                        onIncrement={() => addToCart(item, restaurantName)}
                        onDecrement={() => removeFromCart(item.id, restaurantName)}
                        styleType="compact"
                    />
                </View>
            </View>
        </View>
    );
};

const MenuCardVertical = ({ item, restaurantName }) => {
    const { getItemQuantity, addToCart, removeFromCart } = useCart();
    const quantity = getItemQuantity(item.id, restaurantName);

    return (
        <View style={styles.cardVertical}>
            <View style={styles.imageContainerVertical}>
                <SmartImage uri={item.image} style={styles.cardImage} fallbackIcon="image" />
                <DietaryBadge type={item.dietary} />
            </View>
            <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
                </View>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <View style={styles.cardFooter}>
                    <View style={{ flex: 1 }} />
                    <QuantityControl
                        quantity={quantity}
                        onIncrement={() => addToCart(item, restaurantName)}
                        onDecrement={() => removeFromCart(item.id, restaurantName)}
                    />
                </View>
            </View>
        </View>
    );
};

const MenuCardHorizontal = ({ item, restaurantName }) => {
    const { getItemQuantity, addToCart, removeFromCart } = useCart();
    const quantity = getItemQuantity(item.id, restaurantName);

    return (
        <View style={styles.cardHorizontal}>
            <View style={styles.imageContainerHorizontal}>
                <SmartImage uri={item.image} style={styles.cardImage} fallbackIcon="image" />
                <DietaryBadge type={item.dietary} />
            </View>
            <View style={styles.contentHorizontal}>
                <Text style={styles.itemTitleSerif}>{item.name}</Text>
                <Text style={styles.itemDescSm} numberOfLines={2}>{item.description}</Text>
                <View style={styles.metaRow}><Feather name="clock" size={12} color="#2E7D32" /><Text style={styles.metaText}>{item.meta}</Text></View>
                <View style={styles.actionRowHorizontal}>
                    <Text style={styles.priceBig}>{item.price.toFixed(2)}€</Text>
                    <QuantityControl
                        quantity={quantity}
                        onIncrement={() => addToCart(item, restaurantName)}
                        onDecrement={() => removeFromCart(item.id, restaurantName)}
                        styleType="horizontal"
                    />
                </View>
            </View>
        </View>
    );
};

// --- HELPER COMPONENTS FOR ORDER SCREEN ---

const Tabs = ({ activeTab, setActiveTab }) => (
    <View style={styles.tabContainer}>
        {['Menu', 'About', 'Reviews'].map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {activeTab === tab && <View style={styles.activeLine} />}
            </TouchableOpacity>
        ))}
    </View>
);

const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

const Header = ({ onBack, title }) => (
    <View style={styles.headerContainer}>
        <View style={styles.navRow}>
            <TouchableOpacity onPress={onBack} style={styles.navBtn}>
                <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="search-outline" size={24} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#111" />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);


// --- MAIN SCREEN ---

export default function OrderScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getCartCount } = useCart();
    const [activeTab, setActiveTab] = useState('Menu');

    // Get restaurant data with fallback
    const restaurant = route.params?.restaurant || {
        name: "Enrico's Caribbean Cuisine",
        minOrder: 10,
        deliveryFee: 2.50,
        coverImage: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000'
    };

    const MenuItemWrapper = ({ item, restaurantName }) => {
        if (item.cardStyle === 'vertical') return <MenuCardVertical item={item} restaurantName={restaurantName} />;
        return <MenuCardHorizontal item={item} restaurantName={restaurantName} />;
    };

    const renderHeader = () => (
        <View>
            {/* Menu Controls Row - Moved Above Hero */}
            <View style={styles.controlsRow}>
                <View style={styles.deliveryPill}>
                    <Text style={styles.pillTextActive}>Delivery</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="options-outline" size={24} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Feather name="clock" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.heroContainer}>
                {/* Custom Hero Implementation */}
                <View style={styles.heroImage}>
                    <SmartImage
                        uri={restaurant.coverImage || 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000'}
                        style={StyleSheet.absoluteFill}
                        fallbackIcon="restaurant"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(252,252,252,0.6)', '#FCFCFC']}
                        locations={[0.5, 0.8, 1]}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Overlays */}
                    <View style={styles.timeBadge}>
                        <Feather name="clock" size={14} color="#2E7D32" />
                        <Text style={styles.timeBadgeText}>23 mins • 5 km</Text>
                    </View>
                    <View style={styles.logoCard}>
                        <SmartImage
                            uri='https://thumbs.dreamstime.com/b/mom-s-kitchen-logo-design-vector-illustration-cooking-element-190623351.jpg'
                            style={styles.logoImage}
                            fallbackIcon="flag"
                        />
                    </View>
                    <View style={styles.heroTextOverlay}>
                        <Text style={styles.heroTitle}>{restaurant.name}</Text>
                        <Text style={styles.heroSubtitle}>
                            Min {restaurant.minOrder?.toFixed(2)} € • Delivery fee {restaurant.deliveryFee?.toFixed(2)} €
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.descContainer}>
                <Text style={styles.descriptionText}>
                    Savour the bold and flavourful taste of the Caribbean with our Jerk Chicken with Rice dish with choice between different sauces and toppings. Try the authentic.
                </Text>
            </View>

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <SectionHeader title="Chef's Specials" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
                {FEATURED_ITEMS.map(item => <MenuCardCompact key={item.id} item={item} restaurantName={restaurant.name} />)}
            </ScrollView>

            <SectionHeader title="Most Popular" />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            <Header onBack={() => navigation.goBack()} title={restaurant.name} />

            <FlatList
                data={MAIN_MENU_ITEMS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <MenuItemWrapper item={item} restaurantName={restaurant.name} />}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            />

            <CartToast
                count={getCartCount()}
                onPress={() => navigation.navigate('RoutePrepare', {
                    chefName: restaurant.name,
                    restaurantImage: restaurant.coverImage || 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000'
                })}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FCFCFC' },
    scrollContent: { paddingBottom: 100 },
    headerContainer: { backgroundColor: '#FCFCFC', paddingBottom: 10 },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', maxWidth: '70%' },
    navBtn: { padding: 4 },
    controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 4, marginBottom: 15 },
    deliveryPill: { backgroundColor: '#FF7E47', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, minWidth: 120, alignItems: 'center', elevation: 2 },
    pillTextActive: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    headerIcons: { flexDirection: 'row' },
    iconBtn: { marginLeft: 20 },
    heroContainer: { height: 280, width: '100%', marginBottom: 10 },
    heroImage: { width: '100%', height: '100%', justifyContent: 'flex-end', backgroundColor: '#e1e1e1' },
    timeBadge: { position: 'absolute', top: 20, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', paddingHorizontal: 8, paddingVertical: 4 },
    timeBadgeText: { fontSize: 14, fontWeight: 'bold', marginLeft: 4, color: '#2E7D32' },
    logoCard: { position: 'absolute', bottom: 30, left: 20, width: 90, height: 90, backgroundColor: 'white', borderRadius: 12, padding: 5, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    logoImage: { width: '90%', height: '90%', resizeMode: 'contain' },
    heroTextOverlay: { position: 'absolute', bottom: 35, left: 125, right: 20 },
    heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#111', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 4 },
    heroSubtitle: { fontSize: 14, color: '#111', fontWeight: '600' },
    descContainer: { paddingHorizontal: 20, paddingVertical: 10 },
    descriptionText: { fontSize: 14, color: '#666', lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: 10, marginHorizontal: 10 },
    tabItem: { paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center' },
    tabText: { fontSize: 16, fontWeight: 'bold', color: '#999' },
    tabTextActive: { color: '#FF7E47' },
    activeLine: { position: 'absolute', bottom: 0, width: 40, height: 3, backgroundColor: '#FF7E47', borderRadius: 2 },
    sectionHeader: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, marginLeft: 16, color: '#111', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    carouselContent: { paddingLeft: 16, paddingBottom: 10 },

    // Cards
    cardCompact: { width: 180, height: 240, backgroundColor: 'white', borderRadius: 12, marginRight: 15, overflow: 'hidden', elevation: 3, paddingBottom: 10, flexDirection: 'column' },
    imageContainerCompact: { flex: 3, width: '100%' },
    contentCompact: { flex: 2, padding: 10, justifyContent: 'space-between' },
    itemTitleCompact: { fontSize: 16, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    itemDescCompact: { fontSize: 11, color: '#999' },
    footerCompact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceCompact: { fontSize: 16, fontWeight: 'bold' },
    qtyCompact: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 12 },
    qtyBtnCompact: { width: 22, height: 22 },
    qtyTextCompact: { fontSize: 12, marginHorizontal: 4 },
    // Shared
    cardImage: { width: '100%', height: '100%', resizeMode: 'cover', backgroundColor: '#e1e1e1' },
    dietaryBadge: { position: 'absolute', top: 10, left: 10, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    vegIcon: { width: 20, height: 20, backgroundColor: '#2E7D32', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
    nonVegIcon: { width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 20, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#C62828' },
    quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF7E47', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4 },
    qtyHorizontal: { minWidth: 90, justifyContent: 'space-between', height: 32 },
    qtyBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    qtyText: { color: 'white', fontWeight: 'bold', marginHorizontal: 8, fontSize: 15 },
    // Vertical
    cardVertical: { backgroundColor: 'white', borderRadius: 12, marginBottom: 20, marginHorizontal: 16, overflow: 'hidden', elevation: 2 },
    imageContainerVertical: { height: 220, width: '100%' },
    cardContent: { padding: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    itemTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, marginRight: 10 },
    itemPrice: { fontSize: 18, fontWeight: 'bold' },
    itemDesc: { fontSize: 14, color: '#888', marginVertical: 8 },
    cardFooter: { flexDirection: 'row', marginTop: 10 },
    // Horizontal
    cardHorizontal: { backgroundColor: 'white', borderRadius: 15, marginBottom: 20, marginHorizontal: 16, flexDirection: 'row', height: 140, overflow: 'hidden', elevation: 1 },
    imageContainerHorizontal: { width: 140, height: '100%', position: 'relative' },
    contentHorizontal: { flex: 1, padding: 12, justifyContent: 'space-between' },
    itemTitleSerif: { fontSize: 18, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: '#111' },
    itemDescSm: { fontSize: 12, color: '#999', marginTop: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    metaText: { fontSize: 12, fontWeight: 'bold', color: '#2E7D32', marginLeft: 6 },
    actionRowHorizontal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    priceBig: { fontSize: 20, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

});
