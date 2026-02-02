import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';

export default function ProfileScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Feather name="settings" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.profileCard}>
                    <SmartImage
                        uri='https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200'
                        style={styles.avatarLarge}
                        fallbackIcon="user"
                        iconSize={40}
                    />
                    <Text style={styles.name}>Sarah Anderson</Text>
                    <Text style={styles.handle}>@sarah_foodie</Text>
                    <TouchableOpacity style={styles.editBtn}>
                        <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>12</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>4</Text>
                        <Text style={styles.statLabel}>Favorites</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>2</Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                </View>

                {/* Menu Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Account</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}><Ionicons name="card-outline" size={20} color="#FF7E47" /></View>
                        <Text style={styles.menuText}>Payment Methods</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}><Ionicons name="location-outline" size={20} color="#FF7E47" /></View>
                        <Text style={styles.menuText}>Saved Addresses</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Preferences</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}><Ionicons name="notifications-outline" size={20} color="#FF7E47" /></View>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}><Ionicons name="moon-outline" size={20} color="#FF7E47" /></View>
                        <Text style={styles.menuText}>Dark Mode</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.signOutBtn}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scrollContent: { paddingBottom: 50 },

    profileCard: { alignItems: 'center', backgroundColor: 'white', padding: 30, marginBottom: 10 },
    avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    name: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    handle: { fontSize: 14, color: '#888', marginBottom: 20 },
    editBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    editBtnText: { color: '#333', fontWeight: '600' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', padding: 20, marginBottom: 15 },
    statItem: { alignItems: 'center' },
    statVal: { fontSize: 20, fontWeight: 'bold', color: '#111' },
    statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
    statDivider: { width: 1, height: '100%', backgroundColor: '#eee' },

    section: { backgroundColor: 'white', padding: 20, marginBottom: 15 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
    menuIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0E8', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    menuText: { flex: 1, fontSize: 16, color: '#444' },

    signOutBtn: { margin: 20, backgroundColor: '#FFEAEA', padding: 15, borderRadius: 12, alignItems: 'center' },
    signOutText: { color: '#FF4444', fontWeight: 'bold', fontSize: 16 }
});
