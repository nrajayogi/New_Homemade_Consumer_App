import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import SmartImage from './SmartImage';

const { width } = Dimensions.get('window');

const RestaurantCard = ({
    name,
    rating,
    minOrder,
    deliveryFee,
    time,
    distance,
    discount,
    image,
    logo,
    onPress,
    closingTime
}) => {
    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.95}>
            <View style={styles.coverWrapper}>
                <SmartImage
                    uri={image}
                    style={styles.coverImage}
                    fallbackIcon="image"
                    iconSize={40}
                />

                {/* Overlay: Rating (Top Left) */}
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{rating}</Text>
                    <Ionicons name="star" size={12} color="#fff" style={{ marginLeft: 2 }} />
                </View>

                {/* Overlay: Bookmark (Top Right) */}
                <TouchableOpacity style={styles.bookmarkBadge}>
                    <Feather name="bookmark" size={20} color="white" />
                </TouchableOpacity>

                {/* Overlay: Discount */}
                {discount && (
                    <View style={styles.discountBadge}>
                        <MaterialCommunityIcons name="tag-outline" size={14} color="#FF7E47" />
                        <Text style={styles.discountText}>{discount}</Text>
                    </View>
                )}

                {/* Logo Overlap */}
                <View style={styles.logoContainer}>
                    <SmartImage
                        uri={logo}
                        style={styles.logo}
                        fallbackIcon="flag"
                        iconSize={24}
                    />
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.mainRow}>
                    <View style={styles.textContainer}>
                        <Text style={styles.restaurantName} numberOfLines={2}>{name}</Text>
                        <Text style={styles.subDetails}>
                            {minOrder} • {deliveryFee}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
                        <Text style={styles.actionButtonText}>Schedule Order</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.separator} />

                <View style={styles.footerRow}>
                    <View style={styles.metaBadge}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#2E7D32" />
                        <Text style={styles.metaText}>{time} • {distance}</Text>
                    </View>
                    {closingTime && <Text style={styles.closingText}>Closes @ {closingTime}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginVertical: 10,
        alignSelf: 'center',
        width: width - 32,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
    },
    coverWrapper: {
        height: 180,
        width: '100%',
        backgroundColor: '#e1e1e1',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        left: 12, // Moved to left
        backgroundColor: '#FF7E47',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 10,
    },
    bookmarkBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
    },
    ratingText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14, // Slightly larger
    },
    discountBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 10,
    },
    discountText: {
        color: '#FF7E47',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 4,
    },
    logoContainer: {
        position: 'absolute',
        bottom: -20,
        left: 16,
        width: 60,
        height: 60,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#eee',
        zIndex: 20,
        elevation: 4,
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    content: {
        paddingTop: 30, // Space for logo overlap
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    mainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    subDetails: {
        fontSize: 13,
        color: '#666',
    },
    actionButton: {
        backgroundColor: '#FF7E47',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#FF7E47', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 10,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: 6,
        color: '#2E7D32',
        fontWeight: 'bold',
        fontSize: 13,
    },
    closingText: {
        color: '#999',
        fontSize: 12,
        fontStyle: 'italic',
    }
});

export default RestaurantCard;
