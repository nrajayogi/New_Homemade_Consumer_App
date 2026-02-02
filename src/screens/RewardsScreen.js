import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRewards } from '../context/RewardsContext';
import { ACHIEVEMENTS, REWARD_TIERS } from '../data/rewardData';

const { width } = Dimensions.get('window');

export default function RewardsScreen({ navigation }) {
    const {
        totalCredits,
        lifetimeCredits,
        co2SavedGrams,
        earningHistory,
        isLoading,
        getCurrentTier,
        getTierProgressInfo,
        getUnlockedAchievements,
        getLockedAchievements
    } = useRewards();

    const [activeTab, setActiveTab] = useState('overview'); // overview, achievements, history

    const currentTier = getCurrentTier();
    const tierProgress = getTierProgressInfo();
    const unlockedAchievements = getUnlockedAchievements();
    const lockedAchievements = getLockedAchievements();

    // Convert CO2 to kg
    const co2SavedKg = (co2SavedGrams / 1000).toFixed(2);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading your rewards...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Rewards</Text>
                <TouchableOpacity onPress={() => navigation.navigate('RewardShop')}>
                    <Feather name="shopping-bag" size={24} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Credit Balance Card */}
                <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceContent}>
                        <View style={styles.balanceLeft}>
                            <Text style={styles.balanceLabel}>Carbon Credits</Text>
                            <Text style={styles.balanceAmount}>{totalCredits}</Text>
                            <Text style={styles.balanceSubtext}>Lifetime: {lifetimeCredits}</Text>
                        </View>
                        <MaterialCommunityIcons name="leaf" size={80} color="rgba(255,255,255,0.3)" />
                    </View>

                    {/* Tier Badge */}
                    <View style={styles.tierBadgeContainer}>
                        <View style={[styles.tierBadge, { backgroundColor: currentTier.color }]}>
                            <Ionicons name={currentTier.icon} size={16} color="white" />
                            <Text style={styles.tierBadgeText}>{currentTier.name}</Text>
                        </View>
                        {tierProgress.nextTier && (
                            <Text style={styles.tierProgressText}>
                                {tierProgress.creditsToNext} to {tierProgress.nextTier.name}
                            </Text>
                        )}
                    </View>

                    {/* Progress to Next Tier */}
                    {tierProgress.nextTier && (
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${tierProgress.progress}%` }]} />
                            </View>
                        </View>
                    )}
                </LinearGradient>

                {/* Impact Stats */}
                <View style={styles.impactCard}>
                    <Text style={styles.impactTitle}>Your Environmental Impact 🌍</Text>
                    <View style={styles.impactStats}>
                        <View style={styles.impactStat}>
                            <MaterialCommunityIcons name="cloud-off-outline" size={32} color="#4CAF50" />
                            <Text style={styles.impactValue}>{co2SavedKg} kg</Text>
                            <Text style={styles.impactLabel}>CO₂ Saved</Text>
                        </View>
                        <View style={styles.impactDivider} />
                        <View style={styles.impactStat}>
                            <MaterialCommunityIcons name="trophy-outline" size={32} color="#FFB300" />
                            <Text style={styles.impactValue}>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</Text>
                            <Text style={styles.impactLabel}>Achievements</Text>
                        </View>
                        <View style={styles.impactDivider} />
                        <View style={styles.impactStat}>
                            <MaterialCommunityIcons name="star-outline" size={32} color="#E91E63" />
                            <Text style={styles.impactValue}>{currentTier.id}</Text>
                            <Text style={styles.impactLabel}>Tier</Text>
                        </View>
                    </View>
                    <Text style={styles.impactEquivalent}>
                        That's like planting {Math.floor(co2SavedGrams / 20000)} trees! 🌳
                    </Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
                        onPress={() => setActiveTab('achievements')}
                    >
                        <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>Achievements</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                        onPress={() => setActiveTab('history')}
                    >
                        <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <View>
                        {/* Quick Actions */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('RewardShop')}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                                    <Feather name="shopping-bag" size={24} color="#4CAF50" />
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Redeem Credits</Text>
                                    <Text style={styles.actionDesc}>Browse rewards and discounts</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('EcoProofCamera', { claimedMode: 'bike' })}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                                    <MaterialCommunityIcons name="camera" size={24} color="#FF9800" />
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Verify Eco-Trip</Text>
                                    <Text style={styles.actionDesc}>Earn +25 credits</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </TouchableOpacity>
                        </View>

                        {/* Recent Achievements */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Achievements</Text>
                            {unlockedAchievements.slice(0, 3).map(achievement => (
                                <View key={achievement.id} style={styles.achievementMini}>
                                    <View style={styles.achievementIconContainer}>
                                        <MaterialCommunityIcons name={achievement.icon} size={24} color="#4CAF50" />
                                    </View>
                                    <View style={styles.achievementContent}>
                                        <Text style={styles.achievementName}>{achievement.name}</Text>
                                        <Text style={styles.achievementDesc}>{achievement.description}</Text>
                                    </View>
                                    <Text style={styles.achievementCredits}>+{achievement.credits}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {activeTab === 'achievements' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Unlocked ({unlockedAchievements.length})</Text>
                        {unlockedAchievements.map(achievement => (
                            <View key={achievement.id} style={styles.achievementCard}>
                                <View style={[styles.achievementIcon, styles.achievementUnlocked]}>
                                    <MaterialCommunityIcons name={achievement.icon} size={28} color="#4CAF50" />
                                </View>
                                <View style={styles.achievementInfo}>
                                    <Text style={styles.achievementName}>{achievement.name}</Text>
                                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                                </View>
                                <View style={styles.achievementBadge}>
                                    <Text style={styles.achievementBadgeText}>+{achievement.credits}</Text>
                                </View>
                            </View>
                        ))}

                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Locked ({lockedAchievements.length})</Text>
                        {lockedAchievements.map(achievement => (
                            <View key={achievement.id} style={[styles.achievementCard, styles.achievementLocked]}>
                                <View style={[styles.achievementIcon, styles.achievementIconLocked]}>
                                    <MaterialCommunityIcons name="lock" size={28} color="#999" />
                                </View>
                                <View style={styles.achievementInfo}>
                                    <Text style={[styles.achievementName, { color: '#999' }]}>{achievement.name}</Text>
                                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'history' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Earning History</Text>
                        {earningHistory.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="history" size={48} color="#ccc" />
                                <Text style={styles.emptyText}>No earning history yet</Text>
                                <Text style={styles.emptySubtext}>Start ordering eco-friendly to earn credits!</Text>
                            </View>
                        ) : (
                            earningHistory.map(earning => (
                                <View key={earning.id} style={styles.historyItem}>
                                    <View style={styles.historyIcon}>
                                        <MaterialCommunityIcons name="leaf" size={20} color="#4CAF50" />
                                    </View>
                                    <View style={styles.historyContent}>
                                        <Text style={styles.historyReason}>{earning.reason}</Text>
                                        <Text style={styles.historyDate}>
                                            {new Date(earning.timestamp).toLocaleDateString()} at {new Date(earning.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <Text style={styles.historyAmount}>+{earning.amount}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
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
    scrollContent: { paddingBottom: 50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666' },

    // Balance Card
    balanceCard: {
        margin: 20,
        padding: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    balanceContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    balanceLeft: { flex: 1 },
    balanceLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
    balanceAmount: { color: 'white', fontSize: 48, fontWeight: 'bold', marginVertical: 5 },
    balanceSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    tierBadgeContainer: { marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6
    },
    tierBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    tierProgressText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
    progressBarContainer: { marginTop: 10 },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        overflow: 'hidden'
    },
    progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 4 },

    // Impact Card
    impactCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 }
    },
    impactTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
    impactStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    impactStat: { alignItems: 'center', flex: 1 },
    impactValue: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 5 },
    impactLabel: { fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' },
    impactDivider: { width: 1, backgroundColor: '#eee' },
    impactEquivalent: {
        textAlign: 'center',
        color: '#666',
        fontSize: 13,
        fontStyle: 'italic',
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 }
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10
    },
    activeTab: { backgroundColor: '#4CAF50' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
    activeTabText: { color: 'white' },

    // Section
    section: { marginHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },

    // Action Cards
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 }
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionContent: { flex: 1, marginLeft: 15 },
    actionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    actionDesc: { fontSize: 13, color: '#888', marginTop: 2 },

    // Achievements
    achievementMini: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8
    },
    achievementIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    achievementContent: { flex: 1 },
    achievementName: { fontSize: 14, fontWeight: '600', color: '#333' },
    achievementDesc: { fontSize: 12, color: '#888', marginTop: 2 },
    achievementCredits: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50' },

    achievementCard: {
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
    achievementLocked: { opacity: 0.6 },
    achievementIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    achievementUnlocked: { backgroundColor: '#E8F5E9' },
    achievementIconLocked: { backgroundColor: '#F5F5F5' },
    achievementInfo: { flex: 1 },
    achievementBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12
    },
    achievementBadgeText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 12 },

    // History
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 }
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    historyContent: { flex: 1 },
    historyReason: { fontSize: 14, fontWeight: '600', color: '#333' },
    historyDate: { fontSize: 12, color: '#888', marginTop: 2 },
    historyAmount: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: 'white',
        borderRadius: 12
    },
    emptyText: { fontSize: 16, color: '#666', marginTop: 15, fontWeight: '600' },
    emptySubtext: { fontSize: 13, color: '#999', marginTop: 5 }
});
