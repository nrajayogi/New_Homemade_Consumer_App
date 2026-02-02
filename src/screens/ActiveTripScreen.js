import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import * as Location from 'expo-location';
import TripMap from '../components/TripMap'; // Logic split: uses .web.js on web, .js on native

const { width } = Dimensions.get('window');

// Web Fallback for MapView
const isWeb = Platform.OS === 'web';
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export default function ActiveTripScreen({ route, navigation }) {
    const { mode } = route.params; // Manual mode as fallback/initial

    // State
    const [liveMode, setLiveMode] = useState(mode ? mode.toLowerCase() : 'walk');
    const [accumulatedCarbon, setAccumulatedCarbon] = useState(0.0);
    const [distance, setDistance] = useState(0.0);
    const [duration, setDuration] = useState(0);

    // Internal refs for location smoothing
    const [location, setLocation] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [gpsTrace, setGpsTrace] = useState([]); // Full trace for backend verification

    // Constants
    const BASELINE_CAR = 192.0;
    const MODE_FACTORS = { 'walk': 50.0, 'bike': 21.0, 'run': 65.0 };

    // Mock Destination
    const DESTINATION = { latitude: 37.78825, longitude: -122.4324 };

    // Timer
    useEffect(() => {
        const interval = setInterval(() => setDuration(p => p + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // Distance Calc
    const haversine = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Location Tracking & Auto Detect Logic
    useEffect(() => {
        let subscription;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                if (Platform.OS !== 'web') Alert.alert('Permission denied');
                return;
            }

            subscription = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 5
            }, (newLoc) => {
                const { latitude, longitude, speed } = newLoc.coords; // Speed is in m/s

                // 1. Accuracy Filter
                if (newLoc.coords.accuracy > 30) return;

                setLocation(prevLoc => {
                    if (prevLoc) {
                        const dist = haversine(prevLoc.latitude, prevLoc.longitude, latitude, longitude);

                        // 2. Jitter Filter (>15m)
                        if (dist > 0.015) {
                            setDistance(p => p + dist);

                            // 3. Auto-Detect Mode based on Speed (if available, else fallback to manual)
                            // Speed: < 1.5 m/s (5.4 km/h) -> Walk
                            // Speed: 1.5 - 4.5 m/s (16 km/h) -> Run
                            // Speed: > 4.5 m/s -> Bike
                            let detectedMode = 'walk';
                            const currentSpeed = speed || 0;

                            if (currentSpeed > 4.5) detectedMode = 'bike';
                            else if (currentSpeed > 1.5) detectedMode = 'run';
                            else detectedMode = 'walk'; // Default low speed

                            // NOTE: User requested manual mode preference might conflict with auto-detect. 
                            // Reverting to strict auto-detect for now as per "original function".
                            setLiveMode(detectedMode);

                            // 4. Calculate Carbon for this segment
                            const factor = MODE_FACTORS[detectedMode] || 50.0;
                            // Savings = (Baseline - Mode) * Distance
                            const savings = Math.max(0, (BASELINE_CAR - factor) * dist);

                            setAccumulatedCarbon(p => p + savings);

                            return { latitude, longitude };
                        }
                        return prevLoc;
                    }
                    return { latitude, longitude };
                });

                setRouteCoordinates(prev => [...prev, { latitude, longitude }]);

                // Store full GPS point for verification service
                setGpsTrace(prev => [...prev, {
                    lat: latitude,
                    lng: longitude,
                    timestamp: new Date().toISOString(),
                    speed: speed || 0,
                    accuracy: newLoc.coords.accuracy
                }]);
            });
        })();

        // Cleanup function to prevent memory leaks and background battery drain
        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sc = s % 60;
        return `${m}:${sc < 10 ? '0' : ''}${sc}`;
    };

    const endTrip = async () => {
        try {
            const tripPayload = {
                trip_id: `trip_${Date.now()}`,
                user_id: "test_user",
                mode: liveMode,
                distance_km: distance,
                duration_sec: duration,
                gps_trace: gpsTrace,
                step_count: 0
            };

            const response = await fetch(`${API_URL}/api/v1/trips/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tripPayload)
            });

            const result = await response.json();

            let message = `You traveled ${distance.toFixed(2)} km.`;
            if (result.is_verified) {
                message += `\nVerified! Score: ${result.score}\nSaved: ${accumulatedCarbon.toFixed(1)}g CO2`;
            } else {
                message += `\nVerification Status: ${result.status}\nReason: ${result.reasons.join(', ')}`;
            }

            Alert.alert(
                result.is_verified ? "Trip Verified!" : "Trip Flagged",
                message,
                [{ text: "OK", onPress: () => navigation.navigate("Home") }]
            );

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not verify trip. Check network connection.");
            navigation.navigate("Home");
        }
    };

    return (
        <View style={styles.container}>
            {/* Map Layer - Platform Agnostic Component */}
            <TripMap
                destination={DESTINATION}
                routeCoordinates={routeCoordinates}
                currentLocation={location}
                currentMode={liveMode}
            />

            {/* HUD Layer */}
            <View style={styles.hud}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>TIME</Text>
                    <Text style={styles.statValue}>{formatTime(duration)}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>DIST (km)</Text>
                    <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Saved CO₂</Text>
                    <Text style={styles.statValue}>~{accumulatedCarbon.toFixed(0)}g</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Mode</Text>
                    <Text style={styles.statValue}>{liveMode.toUpperCase()}</Text>
                    <Text style={{ color: '#666', fontSize: 10 }}>(Auto)</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.stopBtn, { backgroundColor: '#2ecc71', marginBottom: 15 }]}
                    onPress={() => navigation.navigate('EcoProofCamera', { claimedMode: liveMode })}
                >
                    <Text style={styles.stopBtnText}>📷 VERIFY WITH PHOTO</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.stopBtn} onPress={endTrip}>
                    <Text style={styles.stopBtnText}>COMPLETE TRIP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    hud: {
        position: 'absolute', top: 50, left: 20, right: 20,
        backgroundColor: 'rgba(0,0,0,0.8)', flexDirection: 'row',
        justifyContent: 'space-between', padding: 20, borderRadius: 16
    },
    statBox: { alignItems: 'center' },
    statLabel: { color: "#aaa", fontSize: 12, fontWeight: "bold" },
    statValue: { color: "white", fontSize: 20, fontWeight: "bold", marginTop: 5 },
    controls: {
        position: 'absolute', bottom: 40, left: 20, right: 20, alignItems: 'center'
    },
    stopBtn: {
        backgroundColor: '#ef4444', width: '100%', padding: 20, borderRadius: 12, alignItems: 'center',
        shadowColor: "#ef4444", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10
    },
    stopBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }
});
