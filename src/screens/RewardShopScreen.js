import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRewards } from '../context/RewardsContext';
import { REDEMPTION_OPTIONS } from '../data/rewardData';

export default function RewardShopScreen({ navigation }) {
    const { totalCredits, redeemCredits, getCurrentTier, getActiveRedemptions } = useRewards();
    const [selectedReward, setSelectedReward] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const currentTier = getCurrentTier();
    const activeRedemptions = getActiveRedemptions();

    const handleRedeem = (reward) => {
        if (totalCredits < reward.cost) {
            Alert.alert(
                'Insufficient Credits',
                `You need ${reward.cost - totalCredits} more credits to redeem this reward.`,
                [{ text: 'OK' }]
            );
            return;
        }

        // Check tier requirement
        const tierIndex = ['bronze', 'silver', 'gold', 'platinum'].indexOf(currentTier.id);
        const requiredTierIndex = ['bronze', 'silver', 'gold', 'platinum'].indexOf(reward.minTier);

        if (tierIndex < requiredTierIndex) {
            Alert.alert(
                'Tier Required',
                `This reward requires ${reward.minTier} tier or higher. Keep earning credits to unlock!`,
                [{ text: 'OK' }]
            );
            return;
        }

        setSelectedReward(reward);
    };

    const confirmRedeem = () => {
        if (!selectedReward) return;

        const result = redeemCredits(selectedReward);

        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowConfetti(true);

            // Hide confetti and modal after animation
            setTimeout(() => {
                setShowConfetti(false);
                setSelectedReward(null);
                Alert.alert(
                    'Success! 🎉',
                    `${selectedReward.name} has been added to your active rewards. Use it on your next order!`,
                    [{ text: 'Awesome!' }]
                );
            }, 2000);
        } else {
            Alert.alert('Error', result.message);
            setSelectedReward(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reward Shop</Text>
                <View style={styles.creditsBadge}>
                    <MaterialCommunityIcons name="leaf" size={16} color="#4CAF50" />
                    <Text style={styles.creditsBadgeText}>{totalCredits}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Active Rewards */}
                {activeRedemptions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Active Rewards ({activeRedemptions.length})</Text>
                        {activeRedemptions.map(redemption => (
                            <View key={redemption.id} style={styles.activeRewardCard}>
                                <View style={styles.activeRewardIcon}>
                                    <MaterialCommunityIcons name="gift" size={24} color="#4CAF50" />
                                </View>
                                <View style={styles.activeRewardContent}>
                                    <Text style={styles.activeRewardName}>{redemption.name}</Text>
                                    <Text style={styles.activeRewardDate}>
                                        Redeemed {new Date(redemption.timestamp).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.activeRewardBadge}>
                                    <Text style={styles.activeRewardBadgeText}>Ready</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Available Rewards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Rewards</Text>
                    {REDEMPTION_OPTIONS.map(reward => {
                        const canAfford = totalCredits >= reward.cost;
                        const tierIndex = ['bronze', 'silver', 'gold', 'platinum'].indexOf(currentTier.id);
                        const requiredTierIndex = ['bronze', 'silver', 'gold', 'platinum'].indexOf(reward.minTier);
                        const tierUnlocked = tierIndex >= requiredTierIndex;

                        return (
                            <TouchableOpacity
                                key={reward.id}
                                style={[
                                    styles.rewardCard,
                                    !canAfford && styles.rewardCardDisabled,
                                    !tierUnlocked && styles.rewardCardLocked
                                ]}
                                onPress={() => handleRedeem(reward)}
                                disabled={!canAfford || !tierUnlocked}
                            >
                                <View style={[
                                    styles.rewardIconContainer,
                                    { backgroundColor: canAfford && tierUnlocked ? '#E8F5E9' : '#F5F5F5' }
                                ]}>
                                    {tierUnlocked ? (
                                        <Ionicons
                                            name={reward.icon}
                                            size={32}
                                            color={canAfford ? '#4CAF50' : '#999'}
                                        />
                                    ) : (
                                        <MaterialCommunityIcons name="lock" size={32} color="#999" />
                                    )}
                                </View>

                                <View style={styles.rewardInfo}>
                                    <Text style={[
                                        styles.rewardName,
                                        (!canAfford || !tierUnlocked) && { color: '#999' }
                                    ]}>
                                        {reward.name}
                                    </Text>
                                    <Text style={styles.rewardDesc}>{reward.description}</Text>

                                    {!tierUnlocked && (
                                        <View style={styles.tierRequirement}>
                                            <MaterialCommunityIcons name="shield-crown" size={14} color="#FF9800" />
                                            <Text style={styles.tierRequirementText}>
                                                Requires {reward.minTier} tier
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={[
                                    styles.rewardCost,
                                    !canAfford && styles.rewardCostInsufficient
                                ]}>
                                    <MaterialCommunityIcons
                                        name="leaf"
                                        size={16}
                                        color={canAfford && tierUnlocked ? '#4CAF50' : '#999'}
                                    />
                                    <Text style={[
                                        styles.rewardCostText,
                                        (!canAfford || !tierUnlocked) && { color: '#999' }
                                    ]}>
                                        {reward.cost}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Info Section */}
                <View style={styles.infoCard}>
                    <MaterialCommunityIcons name="information" size={24} color="#2196F3" />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>How to Earn More Credits</Text>
                        <Text style={styles.infoText}>
                            • Choose bike/walk delivery (+15-20 credits){'\n'}
                            • Order plant-based meals (+8 credits each){'\n'}
                            • Use reusable packaging (+5 credits){'\n'}
                            • Verify eco-trips (+25 credits){'\n'}
                            • Unlock achievements (bonus credits!)
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                visible={selectedReward !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedReward(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {showConfetti && (
                            <View style={styles.confetti}>
                                <Text style={styles.confettiText}>🎉</Text>
                            </View>
                        )}

                        {!showConfetti && selectedReward && (
                            <>
                                <View style={styles.modalIcon}>
                                    <Ionicons name={selectedReward.icon} size={48} color="#4CAF50" />
                                </View>
                                <Text style={styles.modalTitle}>Redeem Reward?</Text>
                                <Text style={styles.modalRewardName}>{selectedReward.name}</Text>
                                <Text style={styles.modalDesc}>{selectedReward.description}</Text>

                                <View style={styles.modalCost}>
                                    <MaterialCommunityIcons name="leaf" size={20} color="#4CAF50" />
                                    <Text style={styles.modalCostText}>{selectedReward.cost} Credits</Text>
                                </View>

                                <Text style={styles.modalBalance}>
                                    Your balance after: {totalCredits - selectedReward.cost} credits
                                </Text>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonCancel]}
                                        onPress={() => setSelectedReward(null)}
                                    >
                                        <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonConfirm]}
                                        onPress={confirmRedeem}
                                    >
                                        <Text style={styles.modalButtonText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white'
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    creditsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4
    },
    creditsBadgeText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 14 },
    scrollContent: { paddingBottom: 50 },

    // Section
    section: { marginHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },

    // Active Rewards
    activeRewardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#4CAF50'
    },
    activeRewardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    activeRewardContent: { flex: 1 },
    activeRewardName: { fontSize: 16, fontWeight: '600', color: '#333' },
    activeRewardDate: { fontSize: 12, color: '#666', marginTop: 2 },
    activeRewardBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12
    },
    activeRewardBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    // Reward Cards
    rewardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 }
    },
    rewardCardDisabled: { opacity: 0.6 },
    rewardCardLocked: { opacity: 0.5 },
    rewardIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    rewardInfo: { flex: 1 },
    rewardName: { fontSize: 16, fontWeight: '600', color: '#333' },
    rewardDesc: { fontSize: 13, color: '#888', marginTop: 2 },
    tierRequirement: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4
    },
    tierRequirementText: { fontSize: 12, color: '#FF9800', fontWeight: '600' },
    rewardCost: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4
    },
    rewardCostInsufficient: { backgroundColor: '#F5F5F5' },
    rewardCostText: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        margin: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: 'flex-start'
    },
    infoContent: { flex: 1, marginLeft: 12 },
    infoTitle: { fontSize: 14, fontWeight: 'bold', color: '#1976D2', marginBottom: 8 },
    infoText: { fontSize: 13, color: '#1565C0', lineHeight: 20 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: '85%',
        alignItems: 'center'
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    modalRewardName: { fontSize: 18, fontWeight: '600', color: '#4CAF50', marginBottom: 10 },
    modalDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
    modalCost: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 10,
        gap: 6
    },
    modalCostText: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
    modalBalance: { fontSize: 13, color: '#888', marginBottom: 25 },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%'
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    modalButtonCancel: {
        backgroundColor: '#F5F5F5'
    },
    modalButtonConfirm: {
        backgroundColor: '#4CAF50'
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    modalButtonTextCancel: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16
    },

    // Confetti Animation
    confetti: {
        padding: 40
    },
    confettiText: {
        fontSize: 80,
        textAlign: 'center'
    }
});
