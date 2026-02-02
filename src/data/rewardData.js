// Carbon Credit Values and Reward System Configuration

export const CARBON_CREDIT_VALUES = {
    // Delivery methods
    BIKE_DELIVERY: 15,
    WALK_DELIVERY: 20,
    SCOOTER_DELIVERY: 10,
    CAR_DELIVERY: 0,

    // Packaging choices
    REUSABLE_PACKAGING: 5,
    ECO_PACKAGING: 3,
    STANDARD_PACKAGING: 0,

    // Food choices
    PLANT_BASED_MEAL: 8,
    VEGETARIAN_MEAL: 5,
    LOCAL_INGREDIENT: 3,

    // Order behavior
    LOCAL_CHEF_BONUS: 5, // Within 2km
    NEARBY_CHEF_BONUS: 2, // Within 5km
    BULK_ORDER_BONUS: 10, // Order for 4+ people

    // Eco-proof verification
    ECO_TRIP_VERIFIED: 25,
    FIRST_ECO_PROOF: 50, // Bonus for first verification

    // Streaks
    WEEKLY_STREAK_BONUS: 20,
    MONTHLY_STREAK_BONUS: 100,
};

export const REWARD_TIERS = [
    {
        id: 'bronze',
        name: 'Bronze Eco-Friend',
        minCredits: 0,
        maxCredits: 99,
        color: '#CD7F32',
        icon: 'leaf-outline',
        benefits: ['Track carbon savings', '5% off on rewards'],
        nextTier: 'silver'
    },
    {
        id: 'silver',
        name: 'Silver Guardian',
        minCredits: 100,
        maxCredits: 499,
        color: '#C0C0C0',
        icon: 'leaf',
        benefits: ['All Bronze benefits', 'Free delivery bonus', '10% off rewards'],
        nextTier: 'gold'
    },
    {
        id: 'gold',
        name: 'Gold Champion',
        minCredits: 500,
        maxCredits: 1499,
        color: '#FFD700',
        icon: 'trophy',
        benefits: ['All Silver benefits', 'Priority support', '15% off rewards', 'Exclusive eco-deals'],
        nextTier: 'platinum'
    },
    {
        id: 'platinum',
        name: 'Platinum Hero',
        minCredits: 1500,
        maxCredits: Infinity,
        color: '#E5E4E2',
        icon: 'ribbon',
        benefits: ['All Gold benefits', 'VIP status', '20% off rewards', 'Climate partner badge'],
        nextTier: null
    }
];

export const ACHIEVEMENTS = [
    {
        id: 'first_eco_trip',
        name: 'Eco Beginner',
        description: 'Complete your first verified eco-trip',
        icon: 'bicycle',
        credits: 50,
        unlockCriteria: { ecoTrips: 1 },
        category: 'trips'
    },
    {
        id: 'eco_warrior',
        name: 'Eco Warrior',
        description: 'Earn 100 carbon credits',
        icon: 'shield',
        credits: 20,
        unlockCriteria: { totalCredits: 100 },
        category: 'milestone'
    },
    {
        id: 'bike_lover',
        name: 'Bike Lover',
        description: 'Choose bike delivery 10 times',
        icon: 'bicycle',
        credits: 30,
        unlockCriteria: { bikeDeliveries: 10 },
        category: 'delivery'
    },
    {
        id: 'car_free_champion',
        name: 'Car-Free Champion',
        description: 'Complete 25 eco-friendly deliveries',
        icon: 'car-off',
        credits: 75,
        unlockCriteria: { ecoDeliveries: 25 },
        category: 'delivery'
    },
    {
        id: 'plant_power',
        name: 'Plant Power',
        description: 'Order 15 plant-based meals',
        icon: 'leaf',
        credits: 40,
        unlockCriteria: { plantBasedMeals: 15 },
        category: 'food'
    },
    {
        id: 'local_supporter',
        name: 'Local Hero',
        description: 'Order from 10 different local chefs',
        icon: 'home',
        credits: 35,
        unlockCriteria: { uniqueLocalChefs: 10 },
        category: 'community'
    },
    {
        id: 'reuse_king',
        name: 'Reuse King',
        description: 'Choose reusable packaging 20 times',
        icon: 'repeat',
        credits: 30,
        unlockCriteria: { reusablePackaging: 20 },
        category: 'packaging'
    },
    {
        id: 'week_streak',
        name: 'Consistent Eco',
        description: 'Make eco-friendly orders 7 days in a row',
        icon: 'flame',
        credits: 50,
        unlockCriteria: { dailyStreak: 7 },
        category: 'streak'
    },
    {
        id: 'climate_saver',
        name: 'Climate Saver',
        description: 'Save 10kg CO2 through your choices',
        icon: 'cloud-off',
        credits: 100,
        unlockCriteria: { co2Saved: 10000 }, // in grams
        category: 'impact'
    },
    {
        id: 'eco_master',
        name: 'Eco Master',
        description: 'Reach Platinum tier',
        icon: 'star',
        credits: 150,
        unlockCriteria: { tier: 'platinum' },
        category: 'milestone'
    }
];

export const REDEMPTION_OPTIONS = [
    {
        id: 'discount_1',
        name: '€1 Off Next Order',
        description: 'Instant discount on your next order',
        cost: 100,
        type: 'discount',
        value: 1,
        icon: 'pricetag',
        minTier: 'bronze'
    },
    {
        id: 'discount_5',
        name: '€5 Off Next Order',
        description: 'Significant savings on your next order',
        cost: 450,
        type: 'discount',
        value: 5,
        icon: 'pricetag',
        minTier: 'silver'
    },
    {
        id: 'free_delivery',
        name: 'Free Delivery',
        description: 'One free delivery on any order',
        cost: 150,
        type: 'delivery',
        value: 0,
        icon: 'bicycle',
        minTier: 'bronze'
    },
    {
        id: 'discount_10',
        name: '€10 Off Next Order',
        description: 'Big discount for your commitment',
        cost: 850,
        type: 'discount',
        value: 10,
        icon: 'gift',
        minTier: 'gold'
    },
    {
        id: 'plant_a_tree',
        name: 'Plant a Tree',
        description: 'We plant a real tree in your name',
        cost: 500,
        type: 'impact',
        value: 0,
        icon: 'leaf',
        minTier: 'silver'
    },
    {
        id: 'exclusive_deal',
        name: 'Exclusive Chef Deal',
        description: 'Access to limited eco-chef specials',
        cost: 300,
        type: 'special',
        value: 0,
        icon: 'restaurant',
        minTier: 'gold'
    }
];

// CO2 conversion factors (grams per km)
export const CO2_FACTORS = {
    CAR_BASELINE: 192, // Average petrol car
    BIKE: 21,
    WALK: 50,
    SCOOTER: 50,
    RUN: 65
};

// Calculate CO2 saved
export function calculateCO2Saved(deliveryMethod, distanceKm) {
    const baseline = CO2_FACTORS.CAR_BASELINE;
    const methodEmission = CO2_FACTORS[deliveryMethod.toUpperCase()] || 0;
    const savedGrams = (baseline - methodEmission) * distanceKm;
    return Math.max(0, savedGrams);
}

// Get user's current tier
export function getUserTier(totalCredits) {
    for (let i = REWARD_TIERS.length - 1; i >= 0; i--) {
        const tier = REWARD_TIERS[i];
        if (totalCredits >= tier.minCredits) {
            return tier;
        }
    }
    return REWARD_TIERS[0];
}

// Calculate progress to next tier
export function getTierProgress(totalCredits) {
    const currentTier = getUserTier(totalCredits);
    if (!currentTier.nextTier) {
        return { progress: 100, creditsToNext: 0, nextTier: null };
    }

    const nextTier = REWARD_TIERS.find(t => t.id === currentTier.nextTier);
    const progress = ((totalCredits - currentTier.minCredits) / (nextTier.minCredits - currentTier.minCredits)) * 100;
    const creditsToNext = nextTier.minCredits - totalCredits;

    return { progress: Math.min(100, progress), creditsToNext, nextTier };
}
