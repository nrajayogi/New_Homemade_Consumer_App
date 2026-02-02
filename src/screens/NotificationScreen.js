import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const NOTIFICATIONS = [
    {
        id: '1',
        title: 'Order Delivered',
        message: 'Your order from Enrico\'s Caribbean Cuisine has been delivered. Enjoy your meal!',
        time: '2 mins ago',
        type: 'order',
        read: false,
    },
    {
        id: '2',
        title: '50% OFF Promo',
        message: 'Flash Deal! Get 50% OFF on all Sushi orders today until 10 PM.',
        time: '2 hours ago',
        type: 'promo',
        read: true,
    },
    {
        id: '3',
        title: 'New Kitchen Nearby',
        message: 'Mama Maria\'s Italian Kitchen is now serving in your area. Check it out!',
        time: 'Yesterday',
        type: 'info',
        read: true,
    },
];

export default function NotificationScreen({ navigation }) {
    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.itemContainer, !item.read && styles.unreadItem]}>
            <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) }]}>
                <MaterialCommunityIcons name={getIconName(item.type)} size={24} color="white" />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    const getIconColor = (type) => {
        switch (type) {
            case 'order': return '#4CAF50';
            case 'promo': return '#FF7E47';
            default: return '#2196F3';
        }
    };

    const getIconName = (type) => {
        switch (type) {
            case 'order': return 'check-circle-outline';
            case 'promo': return 'tag-outline';
            default: return 'bell-outline';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={NOTIFICATIONS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    unreadItem: {
        backgroundColor: '#FFF8F5',
        borderLeftWidth: 3,
        borderLeftColor: '#FF7E47',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF7E47',
        marginLeft: 8,
    },
});
