import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Animated, Dimensions, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SmartImage from './SmartImage';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function CustomDrawer({ visible, onClose, navigation }) {
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -DRAWER_WIDTH,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleNavigation = (screen) => {
        onClose();
        // Small delay to allow drawer to close smoothy
        setTimeout(() => {
            navigation.navigate(screen);
        }, 300);
    };

    if (!visible && slideAnim._value === -DRAWER_WIDTH) return null; // Optimization? Actually better to keep mounted but hidden if animating, but Modal handles unmount.
    // We use Modal for z-index containment

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlayContainer}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
                </Animated.View>

                {/* Drawer Content */}
                <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
                    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                        <View style={styles.drawerHeader}>


                            <SmartImage
                                uri='https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200'
                                style={styles.profileImage}
                                fallbackIcon="user"
                                iconSize={30}
                            />
                            <Text style={styles.userName}>Sarah Anderson</Text>
                            <Text style={styles.userHandle}>@sarah_foodie</Text>
                        </View>

                        <ScrollView contentContainerStyle={styles.drawerItemsContainer}>
                            <TouchableOpacity style={styles.drawerItem} onPress={onClose}>
                                <Feather name="home" size={20} color="#FF7E47" />
                                <Text style={[styles.drawerLabel, { color: '#FF7E47' }]}>Home</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('Profile')}>
                                <Feather name="user" size={20} color="#333" />
                                <Text style={styles.drawerLabel}>Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.drawerItem} onPress={() => handleNavigation('Order')}>
                                <Feather name="shopping-bag" size={20} color="#333" />
                                <Text style={styles.drawerLabel}>Your Orders</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.drawerItem}>
                                <Feather name="heart" size={20} color="#333" />
                                <Text style={styles.drawerLabel}>Favorites</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.drawerItem}>
                                <Feather name="settings" size={20} color="#333" />
                                <Text style={styles.drawerLabel}>Settings</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Footer Section */}
                        <View style={styles.drawerFooter}>
                            <TouchableOpacity style={styles.signOutButton}>
                                <Feather name="log-out" size={20} color="#FF4444" />
                                <Text style={styles.signOutText}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawerContainer: {
        width: DRAWER_WIDTH,
        height: '100%',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    drawerHeader: {
        padding: 20,
        backgroundColor: '#F9F5F0',
        marginBottom: 10,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#FF7E47',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    userHandle: {
        fontSize: 14,
        color: '#666',
    },
    drawerItemsContainer: {
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 5,
    },
    drawerLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 15,
    },
    drawerFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signOutText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#FF4444',
        marginLeft: 15,
    }
});
