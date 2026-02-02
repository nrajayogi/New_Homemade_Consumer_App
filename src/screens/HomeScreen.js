import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Platform, FlatList, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

import RestaurantCard from '../components/RestaurantCard';
import NotificationBanner from '../components/NotificationBanner';
import { useCart } from '../context/CartContext';
import CartToast from '../components/CartToast';
import SmartImage from '../components/SmartImage';
import CustomDrawer from '../components/CustomDrawer';
import SoundService from '../services/SoundService';
import { MOCK_CHEFS, CATEGORY_IMAGES } from '../data/mockData';

const { width } = Dimensions.get('window');

// --- HELPER COMPONENTS ---

const LocationHeader = ({ locationText, isLocating, onBellPress, onPressLocation }) => (
    <View style={styles.locationContainer}>
        <TouchableOpacity style={styles.locationRow} onPress={onPressLocation}>
            <Ionicons name="location-sharp" size={20} color="#FF7E47" />
            <View>
                <Text style={styles.locationText} numberOfLines={1}>
                    {isLocating ? 'Locating...' : locationText}
                </Text>
                {!isLocating && (
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
            </View>
            <Ionicons name="chevron-down" size={16} color="#666" style={{ marginLeft: 4, marginTop: 2 }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellButton} onPress={onBellPress}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View style={styles.badge} />
        </TouchableOpacity>
    </View>
);

const LocationPickerModal = ({ visible, onClose, onSelectLocation }) => {
    const [query, setQuery] = useState('');
    const SUGGESTIONS = [
        "123 Culinary Ave, Food City",
        "Berlin Alexanderplatz, Berlin",
        "Munich Central Station, Munich",
        "Paris Eiffel Tower, Paris",
        "London Bridge, London"
    ].filter(s => s.toLowerCase().includes(query.toLowerCase()));

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Change Location</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalInputContainer}>
                        <Ionicons name="search" size={20} color="#999" />
                        <TextInput style={styles.modalInput} placeholder="Search location" value={query} onChangeText={setQuery} autoFocus />
                    </View>
                    <FlatList data={SUGGESTIONS} renderItem={({ item }) => (
                        <TouchableOpacity style={styles.suggestionItem} onPress={() => { onSelectLocation(item); onClose(); }}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                    )} />
                </View>
            </View>
        </Modal>
    );
};

const VoiceAssistantOverlay = ({ visible, transcript, onClose }) => {
    if (!visible) return null;
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.voiceOverlay}>
                <View style={styles.voiceContent}>
                    <View style={styles.voicePulse}>
                        <MaterialCommunityIcons name="microphone" size={40} color="white" />
                    </View>
                    <Text style={styles.voiceTitle}>How can I help you?</Text>
                    <Text style={styles.voiceSubtitle}>Say "Find Burgers" or "My Orders"</Text>
                    <Text style={styles.voiceTranscript}>{transcript || "Listening..."}</Text>
                    <TouchableOpacity style={styles.voiceClose} onPress={onClose}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const Header = ({ onOpenDrawer, searchText, setSearchText, isListening, onMicPress, onProfilePress }) => (
    <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onOpenDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>

        <View style={[styles.searchBar, isListening && styles.searchBarActive]}>
            <TextInput
                style={styles.input}
                placeholder={isListening ? "Listening..." : "Search \"Burger\""}
                placeholderTextColor={isListening ? "#FF4444" : "#999"}
                value={searchText}
                onChangeText={setSearchText}
            />
            <View style={styles.searchRight}>
                <View style={styles.verticalDivider} />
                <TouchableOpacity onPress={onMicPress}>
                    <Feather name={isListening ? "mic" : "mic"} size={20} color={isListening ? "#FF4444" : "#FF7E47"} />
                </TouchableOpacity>
            </View>
        </View>

        <TouchableOpacity onPress={onProfilePress}>
            <SmartImage
                uri='https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200'
                style={styles.avatar}
                fallbackIcon="user"
                iconSize={20}
            />
        </TouchableOpacity>
    </View>
);

const FilterChips = ({ activeCategory, onSelectCategory }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {Object.keys(CATEGORY_IMAGES).map((chip, index) => (
            <TouchableOpacity
                key={index}
                style={[styles.chip, activeCategory === chip && styles.activeChip]}
                onPress={() => onSelectCategory(chip)}
            >
                <SmartImage uri={CATEGORY_IMAGES[chip]} style={styles.chipImage} fallbackIcon="image" iconSize={14} />
                <Text style={[styles.chipText, activeCategory === chip && styles.activeChipText]}>{chip}</Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
);

const DeliveryToggle = ({ orderType, setOrderType }) => (
    <View style={styles.toggleContainer}>
        <TouchableOpacity
            style={[styles.toggleButton, orderType === 'delivery' && styles.toggleActive]}
            onPress={() => setOrderType('delivery')}
        >
            <Text style={[styles.toggleText, orderType === 'delivery' && styles.toggleTextActive]}>Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.toggleButton, orderType === 'pickup' && styles.toggleActive]}
            onPress={() => setOrderType('pickup')}
        >
            <Text style={[styles.toggleText, orderType === 'pickup' && styles.toggleTextActive]}>Pickup</Text>
        </TouchableOpacity>
    </View>
);

// --- MAIN COMPONENT ---

export default function HomeScreen({ navigation }) {
    const { getCartCount } = useCart();
    const [searchText, setSearchText] = useState('');
    const [locationText, setLocationText] = useState('123 Culinary Ave, Food City');
    const [isLocating, setIsLocating] = useState(false);

    // Voice & Drawer
    const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);

    // Filter UI
    const [orderType, setOrderType] = useState('delivery');
    const [activeCategory, setActiveCategory] = useState('All');

    // Data
    const [chefs, setChefs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({ visible: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        // Init Sounds
        SoundService.loadSounds();

        fetchChefs();
        checkLocation();

        return () => {
            SoundService.unloadSounds();
        };
    }, []);

    const checkLocation = async () => {
        setIsLocating(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLocationText('Location denied');
            setIsLocating(false);
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        if (location) {
            setTimeout(() => {
                setLocationText('123 Culinary Ave, Food City');
                setIsLocating(false);
                triggerNotification('Welcome', 'Found active kitchens near you.', 'success');
            }, 1000);
        }
    };

    const fetchChefs = async () => {
        try {
            const API_URL = Platform.OS === 'android'
                ? 'http://10.0.2.2:3000/api/v1/chefs/feed'
                : 'http://localhost:3000/api/v1/chefs/feed';

            // For now, simulating fetch failure or success
            // const response = await fetch(API_URL);
            // const data = await response.json();
            // setChefs(data);

            // Using Mock Data directly for stability
            setTimeout(() => {
                setChefs(MOCK_CHEFS);
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            console.log("Fetch error, using mock:", error);
            setChefs(MOCK_CHEFS);
            setIsLoading(false);
        }
    };

    const triggerNotification = (title, message, type = 'info') => {
        setNotification({ visible: true, title, message, type });
    };

    const triggerVoiceAssistant = () => {
        setIsVoiceAssistantActive(true);
        setVoiceTranscript("Hi! How can I help?");
        setTimeout(() => setVoiceTranscript("Listening..."), 1000);
    };

    const filteredData = chefs.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())));
        const matchesCategory = activeCategory === 'All' ||
            (item.tags && item.tags.some(tag => tag.toLowerCase() === activeCategory.toLowerCase()));
        return matchesSearch && matchesCategory;
    });

    return (
        <RNSafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <CustomDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                navigation={navigation}
            />

            <NotificationBanner
                visible={notification.visible}
                title={notification.title}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
            />

            <VoiceAssistantOverlay
                visible={isVoiceAssistantActive}
                transcript={voiceTranscript}
                onClose={() => setIsVoiceAssistantActive(false)}
            />

            <LocationPickerModal
                visible={locationModalVisible}
                onClose={() => setLocationModalVisible(false)}
                onSelectLocation={(loc) => setLocationText(loc)}
            />

            {/* Header Area */}
            <LocationHeader
                locationText={locationText}
                isLocating={isLocating}
                onBellPress={() => navigation.navigate('Notifications')}
                onPressLocation={() => setLocationModalVisible(true)}
            />

            <View style={{ paddingHorizontal: 16, backgroundColor: 'white', paddingBottom: 10 }}>
                <Header
                    onOpenDrawer={() => setDrawerVisible(true)}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    isListening={isListening}
                    onMicPress={triggerVoiceAssistant}
                    onProfilePress={() => navigation.navigate('Profile')}
                />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Carousel */}
                <View style={styles.carouselSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselContent}
                        decelerationRate="fast"
                        snapToInterval={315}
                    >
                        {/* 1. Full Advert */}
                        <TouchableOpacity
                            activeOpacity={0.95}
                            onPress={() => navigation.navigate('Order', { restaurant: { name: "Enrico's Caribbean Cuisine" } })}
                        >
                            <View style={styles.cardAdvert}>
                                <SmartImage uri='https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000' style={styles.advertImage} fallbackIcon="image" />
                                <View style={styles.advertFooter}>
                                    <View style={styles.advertContent}>
                                        <Text style={styles.advertTitle}>Enrico's Caribbean Cuisine</Text>
                                        <Text style={styles.advertSubtitle}>Min 10.00 € • Delivery fee 2.50 €</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.bookBtn}
                                        onPress={() => navigation.navigate('Order', { restaurant: { name: "Enrico's Caribbean Cuisine" } })}
                                    >
                                        <Text style={styles.bookBtnText}>Book Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* 2. Simple Promo (Vegan) */}
                        <TouchableOpacity activeOpacity={0.95} style={{ marginLeft: 15 }}>
                            <View style={styles.cardSimple}>
                                <SmartImage uri='https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000' style={styles.simpleImage} fallbackIcon="leaf" />
                                <View style={styles.simpleOverlay}>
                                    <Text style={styles.simpleTitle}>Vegan Special</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* 3. Simple Promo (Dessert) */}
                        <TouchableOpacity activeOpacity={0.95} style={{ marginLeft: 15 }}>
                            <View style={styles.cardSimple}>
                                <SmartImage uri='https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1000' style={styles.simpleImage} fallbackIcon="gift" />
                                <View style={styles.simpleOverlay}>
                                    <Text style={styles.simpleTitle}>Sweet Tooth?</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Delivery Toggle */}
                <DeliveryToggle orderType={orderType} setOrderType={setOrderType} />

                {/* Restaurant List */}
                <View style={{ paddingHorizontal: 16 }}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Nearby Kitchens</Text>
                        <View style={styles.sectionLine} />
                        <View style={{ flexDirection: 'row' }}>
                            {/* TEST BUTTON (DEV ONLY) */}
                            <TouchableOpacity
                                style={[styles.clockButton, { marginRight: 8, backgroundColor: '#E8F5E9' }]}
                                onPress={() => triggerNotification('Cooking Started', 'Your order is now sizzling!', 'success')}
                            >
                                <MaterialCommunityIcons name="stove" size={14} color="#4CAF50" />
                                <Text style={[styles.clockText, { color: '#4CAF50' }]}>Test Sound</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.clockButton} onPress={() => Alert.alert("Schedule", "Future scheduling coming soon!")}>
                                <Feather name="clock" size={14} color="#FF7E47" />
                                <Text style={styles.clockText}>Schedule</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Chips */}
                    <View style={{ paddingBottom: 15 }}>
                        <FilterChips activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
                    </View>

                    {isLoading ? (
                        <View style={{ padding: 50 }}>
                            <ActivityIndicator size="large" color="#FF7E47" />
                            <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>Finding kitchens...</Text>
                        </View>
                    ) : (
                        <>
                            {filteredData.map((item) => (
                                <RestaurantCard
                                    key={item.id}
                                    name={item.name}
                                    rating={item.rating}
                                    minOrder={item.minOrder ? `min €${item.minOrder}` : 'No min'}
                                    deliveryFee={item.deliveryFee == 0 ? 'Free Delivery' : `€${item.deliveryFee}`}
                                    time={item.time}
                                    distance={item.distance}
                                    discount={item.discount}
                                    image={item.coverImage}
                                    logo={item.logoImage}
                                    closingTime={item.closingTime}
                                    onPress={() => navigation.navigate('Order', { restaurant: item })}
                                />
                            ))}

                            {filteredData.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Feather name="search" size={40} color="#ccc" />
                                    <Text style={styles.emptyText}>No kitchens found matching "{searchText}"</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            <CartToast count={getCartCount()} onPress={() => navigation.navigate('RoutePrepare', { chefName: "Enrico's Caribbean Cuisine", restaurantImage: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000' })} />

            {/* AI Assistant FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AIChat')}
            >
                <MaterialCommunityIcons name="robot" size={28} color="white" />
            </TouchableOpacity>
        </RNSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FCFCFC' },

    // Header & Search
    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
    menuButton: { padding: 4 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 12, height: 45 },
    searchBarActive: { borderColor: '#FF7E47', borderWidth: 1, backgroundColor: '#FFF0E8' },
    input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 0 },
    searchRight: { flexDirection: 'row', alignItems: 'center' },
    verticalDivider: { width: 1, height: 20, backgroundColor: '#ddd', marginRight: 8 },
    avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#eee' },

    // Location
    locationContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 5, paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 10 : 10 },
    locationRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    locationText: { fontSize: 14, fontWeight: 'bold', color: '#333', marginHorizontal: 8 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', marginLeft: 8, marginTop: 2 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'red', marginRight: 4 },
    liveText: { fontSize: 10, color: 'red', fontWeight: 'bold' },
    bellButton: { padding: 5, position: 'relative' },
    badge: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444', borderWidth: 1, borderColor: 'white' },

    // Carousel
    carouselSection: { marginTop: 10, marginBottom: 20, height: 240 },
    carouselContent: { paddingHorizontal: 16, paddingRight: 16 },
    cardAdvert: { width: width - 40, height: 240, backgroundColor: 'white', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    advertImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    advertFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F5F0E6', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    advertContent: { flex: 1, marginRight: 8 },
    advertTitle: { color: '#E86A33', fontSize: 16, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    advertSubtitle: { color: '#444', fontSize: 12, fontWeight: '600', marginTop: 2 },
    bookBtn: { backgroundColor: '#FF7E47', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    bookBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

    // Simple Cards
    cardSimple: { width: width * 0.45, height: 240, backgroundColor: 'white', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', position: 'relative' },
    simpleImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    simpleOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    simpleTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    // Toggle
    toggleContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', marginHorizontal: 16, marginBottom: 16, borderRadius: 25, padding: 4, height: 50 },
    toggleButton: { flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    toggleActive: { backgroundColor: '#FF7E47' },
    toggleText: { fontSize: 14, fontWeight: '600', color: '#666' },
    toggleTextActive: { color: 'white', fontWeight: 'bold' },

    // Section Headers
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
    sectionLine: { flex: 1, height: 1, backgroundColor: '#eee', marginHorizontal: 15 },
    clockButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0E8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    clockText: { fontSize: 12, fontWeight: '600', color: '#FF7E47', marginLeft: 6 },

    // Chips - Added paddingVertical: 10 to prevent shadow clipping
    chipScroll: { paddingHorizontal: 16, marginBottom: 10, paddingVertical: 10, flexGrow: 0 },
    chip: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 30, marginRight: 10, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, marginVertical: 2 },
    activeChip: { backgroundColor: '#333', borderColor: '#333' },
    chipImage: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
    chipText: { fontSize: 14, fontWeight: '600', color: '#333' },
    activeChipText: { color: 'white' },

    // Empty State
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40, opacity: 0.5 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#666' },

    // Voice Overlay (Inline styles for readability)
    voiceOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    voiceContent: { alignItems: 'center', width: '80%' },
    voicePulse: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF7E47', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: "#FF7E47", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
    voiceTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
    voiceSubtitle: { fontSize: 16, color: '#ccc', marginBottom: 20 },
    voiceTranscript: { fontSize: 18, color: 'white', fontStyle: 'italic', textAlign: 'center', marginBottom: 30 },
    voiceClose: { marginTop: 20, padding: 10 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    modalInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 15, borderRadius: 12, height: 50, marginBottom: 20 },
    modalInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    suggestionText: { marginLeft: 15, fontSize: 16, color: '#333' },

    // FAB
    fab: {
        position: 'absolute', bottom: 90, right: 20, width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#FF7E47', justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, shadowRadius: 3.84, zIndex: 100
    }
});
