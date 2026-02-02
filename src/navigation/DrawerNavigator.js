import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrderScreen from '../screens/OrderScreen';
// import SettingsScreen from '../screens/SettingsScreen'; // Placeholder

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: '#fff', paddingTop: 0 }}>
                {/* Header Section */}
                <View style={styles.drawerHeader}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.userName}>Sarah Anderson</Text>
                    <Text style={styles.userHandle}>@sarah_foodie</Text>
                </View>

                {/* Drawer Items */}
                <View style={styles.drawerItemsContainer}>
                    <DrawerItem
                        label="Home"
                        icon={({ color, size }) => <Feather name="home" color={color} size={size} />}
                        onPress={() => props.navigation.navigate('HomeTabs')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor="#FF7E47"
                        inactiveTintColor="#333"
                    />
                    <DrawerItem
                        label="Profile"
                        icon={({ color, size }) => <Feather name="user" color={color} size={size} />}
                        onPress={() => props.navigation.navigate('Profile')}
                        labelStyle={styles.drawerLabel}
                        activeTintColor="#FF7E47"
                        inactiveTintColor="#333"
                    />
                    <DrawerItem
                        label="Your Orders"
                        icon={({ color, size }) => <Feather name="shopping-bag" color={color} size={size} />}
                        onPress={() => { }}
                        labelStyle={styles.drawerLabel}
                        inactiveTintColor="#333"
                    />
                    <DrawerItem
                        label="Favorites"
                        icon={({ color, size }) => <Feather name="heart" color={color} size={size} />}
                        onPress={() => { }}
                        labelStyle={styles.drawerLabel}
                        inactiveTintColor="#333"
                    />
                    <DrawerItem
                        label="Wallet"
                        icon={({ color, size }) => <Feather name="credit-card" color={color} size={size} />}
                        onPress={() => { }}
                        labelStyle={styles.drawerLabel}
                        inactiveTintColor="#333"
                    />
                    <DrawerItem
                        label="Settings"
                        icon={({ color, size }) => <Feather name="settings" color={color} size={size} />}
                        onPress={() => { }}
                        labelStyle={styles.drawerLabel}
                        inactiveTintColor="#333"
                    />
                </View>
            </DrawerContentScrollView>

            {/* Footer Section */}
            <View style={styles.drawerFooter}>
                <TouchableOpacity onPress={() => { }} style={styles.signOutButton}>
                    <Feather name="log-out" size={20} color="#FF4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={props => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'slide',
                drawerActiveBackgroundColor: '#FFF0E8',
                drawerActiveTintColor: '#FF7E47',
                drawerInactiveTintColor: '#333',
                drawerLabelStyle: { marginLeft: -20, fontWeight: '500', fontSize: 15 },
                overlayColor: 'rgba(0,0,0,0.5)',
            }}
        >
            <Drawer.Screen name="HomeTabs" component={HomeScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            {/* Order Screen is typically a stack screen, not a drawer screen, but accessible via flow */}
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 20,
        backgroundColor: '#F9F5F0',
        marginBottom: 10,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
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
        flex: 1,
        paddingTop: 10,
    },
    drawerLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    drawerFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
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
