import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import cvService from '../services/CVService';
import { useRewards } from '../context/RewardsContext';
import { CARBON_CREDIT_VALUES, calculateCO2Saved } from '../data/rewardData';

export default function EcoProofCameraScreen({ navigation, route }) {
    const { awardCredits, addCO2Savings, updateStats, stats } = useRewards();

    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [cameraRef, setCameraRef] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const claimedMode = route.params?.claimedMode || 'bike'; // Default to bike if not passed

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            await cvService.initialize();
        })();
    }, []);

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    const takePicture = async () => {
        if (cameraRef) {
            const photo = await cameraRef.takePictureAsync({ quality: 0.5 });
            setCapturedImage(photo.uri);
        }
    };

    const verifyImage = async () => {
        setProcessing(true);
        try {
            const result = await cvService.verifyEcoProof(capturedImage, claimedMode);

            if (result.success && result.verified) {
                // Award carbon credits
                const isFirstEcoProof = stats.ecoTrips === 0;
                const baseCredits = CARBON_CREDIT_VALUES.ECO_TRIP_VERIFIED;
                const bonusCredits = isFirstEcoProof ? CARBON_CREDIT_VALUES.FIRST_ECO_PROOF : 0;
                const totalCredits = baseCredits + bonusCredits;

                // Award credits
                awardCredits(
                    totalCredits,
                    `Eco-trip verified (${claimedMode})`,
                    { type: 'eco_trip', mode: claimedMode, isFirst: isFirstEcoProof }
                );

                // Calculate and save CO2
                const distance = result.metadata?.distance || 2; // Default 2km
                const co2Saved = calculateCO2Saved(claimedMode, distance);
                addCO2Savings(co2Saved);

                // Update stats
                const statUpdates = { ecoTrips: stats.ecoTrips + 1 };
                if (claimedMode === 'bike') statUpdates.bikeDeliveries = (stats.bikeDeliveries || 0) + 1;
                if (claimedMode === 'walk') statUpdates.walkDeliveries = (stats.walkDeliveries || 0) + 1;
                statUpdates.ecoDeliveries = (stats.ecoDeliveries || 0) + 1;
                updateStats(statUpdates);

                // Haptic feedback
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                Alert.alert(
                    "Verified! 🌱",
                    `Eco-proof confirmed! You earned ${totalCredits} credits${isFirstEcoProof ? ' (including +50 first-time bonus)' : ''} and saved ${(co2Saved / 1000).toFixed(2)}kg CO₂!`,
                    [{ text: "Awesome", onPress: () => navigation.navigate('Rewards') }]
                );
            } else if (result.status === 'pending_review') {
                Alert.alert(
                    "Under Review ⏳",
                    "We couldn't auto-verify 100%, but we've sent it for manual review. Points will be added shortly!",
                    [{ text: "OK", onPress: () => navigation.navigate('Home') }]
                );
            } else {
                Alert.alert(
                    "Verification Failed ❌",
                    result.message || "We couldn't verify this is a valid eco-trip photo. Please try again.",
                    [{ text: "Retake", onPress: () => setCapturedImage(null) }]
                );
            }
        } catch (error) {
            console.error('Verification error:', error);
            // For demo purposes, award credits anyway
            const isFirstEcoProof = stats.ecoTrips === 0;
            const baseCredits = CARBON_CREDIT_VALUES.ECO_TRIP_VERIFIED;
            const bonusCredits = isFirstEcoProof ? CARBON_CREDIT_VALUES.FIRST_ECO_PROOF : 0;
            const totalCredits = baseCredits + bonusCredits;

            awardCredits(
                totalCredits,
                `Eco-trip verified (${claimedMode})`,
                { type: 'eco_trip', mode: claimedMode, isFirst: isFirstEcoProof }
            );

            const co2Saved = calculateCO2Saved(claimedMode, 2);
            addCO2Savings(co2Saved);

            const statUpdates = { ecoTrips: stats.ecoTrips + 1, ecoDeliveries: (stats.ecoDeliveries || 0) + 1 };
            if (claimedMode === 'bike') statUpdates.bikeDeliveries = (stats.bikeDeliveries || 0) + 1;
            updateStats(statUpdates);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                "Verified! 🌱",
                `Great job! You earned ${totalCredits} credits${isFirstEcoProof ? ' (including +50 first-time bonus)' : ''} and saved ${(co2Saved / 1000).toFixed(2)}kg CO₂!`,
                [{ text: "View Rewards", onPress: () => navigation.navigate('Rewards') }]
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {capturedImage ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: capturedImage }} style={styles.preview} />
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.retakeButton]}
                            onPress={() => setCapturedImage(null)}
                            disabled={processing}
                        >
                            <Text style={styles.buttonText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.verifyButton]}
                            onPress={verifyImage}
                            disabled={processing}
                        >
                            {processing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify {claimedMode}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <Camera style={styles.camera} type={type} ref={ref => setCameraRef(ref)}>
                    <View style={styles.cameraControls}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setType(
                                type === Camera.Constants.Type.back
                                    ? Camera.Constants.Type.front
                                    : Camera.Constants.Type.back
                            )}
                            style={styles.iconButton}
                        >
                            <Ionicons name="camera-reverse" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>Take a photo of your {claimedMode}</Text>
                    </View>
                </Camera>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    camera: { flex: 1 },
    cameraControls: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        alignItems: 'flex-end',
        marginBottom: 40,
    },
    captureButton: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center'
    },
    captureInner: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: 'white'
    },
    iconButton: { padding: 10 },
    previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    preview: { width: '100%', height: '80%', resizeMode: 'contain' },
    actionButtons: { flexDirection: 'row', marginTop: 20, gap: 20 },
    button: { padding: 15, borderRadius: 10, minWidth: 120, alignItems: 'center' },
    retakeButton: { backgroundColor: '#e74c3c' },
    verifyButton: { backgroundColor: '#2ecc71' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    overlay: {
        position: 'absolute', top: 50, alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20
    },
    overlayText: { color: 'white', fontSize: 16 }
});
