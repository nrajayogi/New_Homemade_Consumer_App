import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SmartImage({ uri, style, fallbackIcon = "image", iconSize = 24 }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // If no URI is provided, go straight to fallback
    if (!uri) {
        return (
            <View style={[style, styles.fallbackContainer]}>
                <Feather name={fallbackIcon} size={iconSize} color="#ccc" />
            </View>
        );
    }

    return (
        <View style={[style, styles.container]}>
            <Image
                source={{ uri: uri }}
                style={[StyleSheet.absoluteFill, style]}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
            />

            {loading && (
                <View style={[StyleSheet.absoluteFill, styles.center]}>
                    <ActivityIndicator size="small" color="#FF7E47" />
                </View>
            )}

            {error && (
                <View style={[StyleSheet.absoluteFill, styles.fallbackContainer, style]}>
                    <MaterialCommunityIcons name="food-off" size={iconSize} color="#999" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#e1e1e1', // Always have base color
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    fallbackContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
    }
});
