import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SoundService from '../services/SoundService';

const { width } = Dimensions.get('window');

const NotificationBanner = ({ visible, title, message, type = 'info', onClose, image }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            // Trigger Haptics
            Haptics.notificationAsync(
                type === 'success' ? Haptics.NotificationFeedbackType.Success :
                    type === 'error' ? Haptics.NotificationFeedbackType.Error :
                        Haptics.NotificationFeedbackType.Warning
            );

            // Play Sound
            if (type === 'success' || type === 'promo') {
                SoundService.playSound('sizzle');
            } else {
                SoundService.playSound('ding');
            }

            Animated.spring(slideAnim, {
                toValue: Platform.OS === 'ios' ? 60 : 40, // Top offset
                useNativeDriver: true,
                speed: 12,
                bounciness: 8,
            }).start();

            // Auto hide after 5 seconds
            const timer = setTimeout(() => {
                hide();
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        Animated.timing(slideAnim, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true,
            // Slide up completely
        }).start(() => {
            if (onClose) onClose();
        });
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            case 'promo': return '#FF7E47'; // Brand color
            default: return '#323232';
        }
    };

    return (
        <Animated.View style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
        ]}>
            <TouchableOpacity style={styles.content} activeOpacity={0.9} onPress={hide}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.promoImage} />
                ) : (
                    <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor() }]}>
                        <MaterialCommunityIcons name="bell-ring" size={20} color="white" />
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{message}</Text>
                </View>

                <TouchableOpacity onPress={hide} style={styles.closeButton}>
                    <MaterialCommunityIcons name="close" size={18} color="#999" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 10,
        right: 10,
        zIndex: 9999,
        elevation: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    promoImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    message: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    closeButton: {
        padding: 5,
        marginLeft: 8,
    }
});

export default NotificationBanner;
