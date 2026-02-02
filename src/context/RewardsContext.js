import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CARBON_CREDIT_VALUES, getUserTier, getTierProgress, ACHIEVEMENTS } from '../data/rewardData';

const RewardsContext = createContext();

const STORAGE_KEY = '@homemade_rewards';

export function useRewards() {
    const context = useContext(RewardsContext);
    if (!context) {
        throw new Error('useRewards must be used within RewardsProvider');
    }
    return context;
}

export function RewardsProvider({ children }) {
    const [rewardsData, setRewardsData] = useState({
        totalCredits: 0,
        lifetimeCredits: 0,
        co2SavedGrams: 0,
        achievements: [],
        redemptions: [],
        earningHistory: [],
        stats: {
            ecoTrips: 0,
            bikeDeliveries: 0,
            walkDeliveries: 0,
            ecoDeliveries: 0,
            plantBasedMeals: 0,
            reusablePackaging: 0,
            uniqueLocalChefs: [],
            dailyStreak: 0,
            lastEcoOrderDate: null
        }
    });

    const [isLoading, setIsLoading] = useState(true);

    // Load rewards data from storage
    useEffect(() => {
        loadRewardsData();
    }, []);

    // Save rewards data to storage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            saveRewardsData();
        }
    }, [rewardsData, isLoading]);

    const loadRewardsData = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);

                // Validate parsed data structure
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    console.warn('[RewardsContext] Invalid data format, resetting');
                    throw new Error('Invalid data format');
                }

                // Ensure essential fields exist
                if (typeof parsed.totalCredits !== 'number') parsed.totalCredits = 0;
                if (typeof parsed.lifetimeCredits !== 'number') parsed.lifetimeCredits = 0;
                if (!Array.isArray(parsed.achievements)) parsed.achievements = [];
                if (!Array.isArray(parsed.redemptions)) parsed.redemptions = [];
                if (!Array.isArray(parsed.earningHistory)) parsed.earningHistory = [];

                // Ensure stats exist and are correct
                if (!parsed.stats || typeof parsed.stats !== 'object') {
                    parsed.stats = {
                        ecoTrips: 0,
                        bikeDeliveries: 0,
                        walkDeliveries: 0,
                        ecoDeliveries: 0,
                        plantBasedMeals: 0,
                        reusablePackaging: 0,
                        uniqueLocalChefs: [],
                        dailyStreak: 0,
                        lastEcoOrderDate: null
                    };
                }

                // Fix uniqueLocalChefs if it's not an array
                if (!Array.isArray(parsed.stats.uniqueLocalChefs)) {
                    parsed.stats.uniqueLocalChefs = [];
                }

                setRewardsData(parsed);
            }
        } catch (error) {
            console.error('Error loading rewards data:', error);
            // Reset to default state on error
            setRewardsData({
                totalCredits: 0,
                lifetimeCredits: 0,
                co2SavedGrams: 0,
                achievements: [],
                redemptions: [],
                earningHistory: [],
                stats: {
                    ecoTrips: 0,
                    bikeDeliveries: 0,
                    walkDeliveries: 0,
                    ecoDeliveries: 0,
                    plantBasedMeals: 0,
                    reusablePackaging: 0,
                    uniqueLocalChefs: [],
                    dailyStreak: 0,
                    lastEcoOrderDate: null
                }
            });

            // Optionally clear storage to prevents recurring crash loops
            try {
                await AsyncStorage.removeItem(STORAGE_KEY);
            } catch (e) { /* ignore */ }
        } finally {
            setIsLoading(false);
        }
    };

    const saveRewardsData = async () => {
        try {
            // Data is already in the correct format (arrays only)
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rewardsData));
        } catch (error) {
            console.error('Error saving rewards data:', error);
        }
    };

    // Award carbon credits
    const awardCredits = (amount, reason, metadata = {}) => {
        // Ensure metadata only contains serializable primitive values
        const safeMetadata = {};
        if (metadata && typeof metadata === 'object') {
            Object.keys(metadata).forEach(key => {
                const value = metadata[key];
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    safeMetadata[key] = value;
                }
            });
        }

        const earning = {
            id: Date.now().toString(),
            amount: Number(amount) || 0,
            reason: String(reason),
            timestamp: new Date().toISOString(),
            metadata: safeMetadata
        };

        setRewardsData(prev => ({
            ...prev,
            totalCredits: prev.totalCredits + earning.amount,
            lifetimeCredits: prev.lifetimeCredits + earning.amount,
            earningHistory: [earning, ...prev.earningHistory].slice(0, 100) // Keep last 100
        }));

        // Check for achievement unlocks
        setTimeout(() => checkAchievements(), 0);

        return earning;
    };

    // Award CO2 savings
    const addCO2Savings = (grams) => {
        setRewardsData(prev => ({
            ...prev,
            co2SavedGrams: prev.co2SavedGrams + grams
        }));
    };

    // Update stats
    const updateStats = (statUpdates) => {
        setRewardsData(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                ...statUpdates,
                uniqueLocalChefs: statUpdates.uniqueLocalChefs
                    ? [...new Set([...prev.stats.uniqueLocalChefs, ...statUpdates.uniqueLocalChefs])]
                    : prev.stats.uniqueLocalChefs
            }
        }));
        setTimeout(() => checkAchievements(), 0);
    };

    // Check and unlock achievements
    const checkAchievements = () => {
        const currentTier = getUserTier(rewardsData.totalCredits);

        ACHIEVEMENTS.forEach(achievement => {
            // Skip if already unlocked
            if (rewardsData.achievements.includes(achievement.id)) {
                return;
            }

            let unlocked = false;
            const criteria = achievement.unlockCriteria;

            // Check each unlock criteria
            if (criteria.totalCredits && rewardsData.lifetimeCredits >= criteria.totalCredits) {
                unlocked = true;
            }
            if (criteria.ecoTrips && rewardsData.stats.ecoTrips >= criteria.ecoTrips) {
                unlocked = true;
            }
            if (criteria.bikeDeliveries && rewardsData.stats.bikeDeliveries >= criteria.bikeDeliveries) {
                unlocked = true;
            }
            if (criteria.ecoDeliveries && rewardsData.stats.ecoDeliveries >= criteria.ecoDeliveries) {
                unlocked = true;
            }
            if (criteria.plantBasedMeals && rewardsData.stats.plantBasedMeals >= criteria.plantBasedMeals) {
                unlocked = true;
            }
            if (criteria.reusablePackaging && rewardsData.stats.reusablePackaging >= criteria.reusablePackaging) {
                unlocked = true;
            }
            if (criteria.uniqueLocalChefs && rewardsData.stats.uniqueLocalChefs.length >= criteria.uniqueLocalChefs) {
                unlocked = true;
            }
            if (criteria.dailyStreak && rewardsData.stats.dailyStreak >= criteria.dailyStreak) {
                unlocked = true;
            }
            if (criteria.co2Saved && rewardsData.co2SavedGrams >= criteria.co2Saved) {
                unlocked = true;
            }
            if (criteria.tier && currentTier.id === criteria.tier) {
                unlocked = true;
            }

            if (unlocked) {
                unlockAchievement(achievement.id, achievement.credits);
            }
        });
    };

    // Unlock achievement
    const unlockAchievement = (achievementId, bonusCredits = 0) => {
        setRewardsData(prev => {
            if (prev.achievements.includes(achievementId)) {
                return prev; // Already unlocked
            }

            return {
                ...prev,
                achievements: [...prev.achievements, achievementId],
                totalCredits: prev.totalCredits + bonusCredits,
                lifetimeCredits: prev.lifetimeCredits + bonusCredits,
                earningHistory: [{
                    id: Date.now().toString(),
                    amount: bonusCredits,
                    reason: `Achievement Unlocked: ${ACHIEVEMENTS.find(a => a.id === achievementId)?.name}`,
                    timestamp: new Date().toISOString(),
                    metadata: { type: 'achievement', achievementId }
                }, ...prev.earningHistory].slice(0, 100)
            };
        });
    };

    // Redeem credits
    const redeemCredits = (redemptionOption) => {
        if (rewardsData.totalCredits < redemptionOption.cost) {
            return { success: false, message: 'Insufficient credits' };
        }

        const redemption = {
            id: Date.now().toString(),
            optionId: redemptionOption.id,
            name: redemptionOption.name,
            cost: redemptionOption.cost,
            timestamp: new Date().toISOString(),
            used: false
        };

        setRewardsData(prev => ({
            ...prev,
            totalCredits: prev.totalCredits - redemptionOption.cost,
            redemptions: [redemption, ...prev.redemptions]
        }));

        return { success: true, redemption };
    };

    // Mark redemption as used
    const useRedemption = (redemptionId) => {
        setRewardsData(prev => ({
            ...prev,
            redemptions: prev.redemptions.map(r =>
                r.id === redemptionId ? { ...r, used: true } : r
            )
        }));
    };

    // Get current tier
    const getCurrentTier = () => getUserTier(rewardsData.totalCredits);

    // Get tier progress
    const getTierProgressInfo = () => getTierProgress(rewardsData.totalCredits);

    // Get active (unused) redemptions
    const getActiveRedemptions = () => {
        return rewardsData.redemptions.filter(r => !r.used);
    };

    // Get unlocked achievements
    const getUnlockedAchievements = () => {
        return ACHIEVEMENTS.filter(a => rewardsData.achievements.includes(a.id));
    };

    // Get locked achievements
    const getLockedAchievements = () => {
        return ACHIEVEMENTS.filter(a => !rewardsData.achievements.includes(a.id));
    };

    // Calculate potential credits for cart
    const calculateCartPotential = (cartOptions = {}) => {
        let credits = 0;
        const breakdown = [];

        if (cartOptions.deliveryMethod === 'bike') {
            credits += CARBON_CREDIT_VALUES.BIKE_DELIVERY;
            breakdown.push({ label: 'Bike Delivery', credits: CARBON_CREDIT_VALUES.BIKE_DELIVERY });
        } else if (cartOptions.deliveryMethod === 'walk') {
            credits += CARBON_CREDIT_VALUES.WALK_DELIVERY;
            breakdown.push({ label: 'Walk Delivery', credits: CARBON_CREDIT_VALUES.WALK_DELIVERY });
        }

        if (cartOptions.reusablePackaging) {
            credits += CARBON_CREDIT_VALUES.REUSABLE_PACKAGING;
            breakdown.push({ label: 'Reusable Packaging', credits: CARBON_CREDIT_VALUES.REUSABLE_PACKAGING });
        }

        if (cartOptions.plantBasedCount > 0) {
            const plantCredits = cartOptions.plantBasedCount * CARBON_CREDIT_VALUES.PLANT_BASED_MEAL;
            credits += plantCredits;
            breakdown.push({ label: `${cartOptions.plantBasedCount} Plant-Based Items`, credits: plantCredits });
        }

        if (cartOptions.isLocalChef) {
            credits += CARBON_CREDIT_VALUES.LOCAL_CHEF_BONUS;
            breakdown.push({ label: 'Local Chef', credits: CARBON_CREDIT_VALUES.LOCAL_CHEF_BONUS });
        }

        return { total: credits, breakdown };
    };

    const value = {
        ...rewardsData,
        isLoading,
        awardCredits,
        addCO2Savings,
        updateStats,
        redeemCredits,
        useRedemption,
        getCurrentTier,
        getTierProgressInfo,
        getActiveRedemptions,
        getUnlockedAchievements,
        getLockedAchievements,
        calculateCartPotential
    };

    return (
        <RewardsContext.Provider value={value}>
            {children}
        </RewardsContext.Provider>
    );
}
