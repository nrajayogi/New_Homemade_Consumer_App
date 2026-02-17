# Database Schema & Architecture Documentation

## Homemade Consumer App v1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Storage Technology](#storage-technology)
3. [Data Models](#data-models)
4. [Schema Definitions](#schema-definitions)
5. [Data Relationships](#data-relationships)
6. [Storage Patterns](#storage-patterns)
7. [Migration Strategy](#migration-strategy)

---

## 1. Overview

The Homemade Consumer App utilizes a **client-side NoSQL storage architecture** built on React Native's AsyncStorage. This approach provides:

- **Offline-first capability**: All user data persists locally
- **Fast read/write operations**: No network latency
- **Simple key-value structure**: Easy to maintain and debug
- **Privacy-focused**: User data stays on device

### Architecture Philosophy

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (React Components & Contexts)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Context Layer (State Management)   │
│  - CartContext                          │
│  - RewardsContext                       │
│  - NotificationContext                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      AsyncStorage (Persistence Layer)   │
│  Key-Value Store (JSON Serialization)   │
└─────────────────────────────────────────┘
```

---

## 2. Storage Technology

### AsyncStorage Implementation

**Technology**: `@react-native-async-storage/async-storage`
**Type**: Asynchronous, persistent, key-value storage
**Platform**: Cross-platform (iOS: SQLite, Android: RocksDB)

#### Key Characteristics

- **Asynchronous**: All operations return Promises
- **String-based**: All values stored as strings (JSON serialization required)
- **Unencrypted**: Data stored in plain text (suitable for non-sensitive data)
- **Size limit**: ~6MB on Android, ~10MB on iOS (practical limits)

#### Storage Keys Convention

```javascript
const STORAGE_KEYS = {
  // Cart Management
  CART_ITEMS: '@homemade_cart_items',
  CART_TIMESTAMP: '@homemade_cart_timestamp',
  
  // Notifications
  NOTIFICATION_ID: '@homemade_notification_id',
  
  // Rewards System
  REWARDS_CREDITS: '@homemade_rewards_credits',
  REWARDS_HISTORY: '@homemade_rewards_history',
  REWARDS_ACHIEVEMENTS: '@homemade_rewards_achievements',
  REWARDS_STATS: '@homemade_rewards_stats',
  REWARDS_CO2_SAVINGS: '@homemade_rewards_co2_savings',
  REWARDS_REDEEMED: '@homemade_rewards_redeemed',
};
```

---

## 3. Data Models

### 3.1 Cart Data Model

```typescript
interface CartItem {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // Product name
  price: number;                 // Price in currency units
  quantity: number;              // Quantity ordered
  image?: string;                // Image URL/path
  restaurant: {
    id: string;
    name: string;
    location: string;
  };
  addedAt: string;               // ISO 8601 timestamp
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastModified: string;          // ISO 8601 timestamp
}
```

**Storage Key**: `@homemade_cart_items`
**Format**: JSON string
**Example**:

```json
{
  "items": [
    {
      "id": "item_123",
      "name": "Margherita Pizza",
      "price": 12.99,
      "quantity": 2,
      "restaurant": {
        "id": "rest_456",
        "name": "Bella Italia",
        "location": "Downtown"
      },
      "addedAt": "2026-02-03T06:30:00.000Z"
    }
  ],
  "totalItems": 2,
  "totalPrice": 25.98,
  "lastModified": "2026-02-03T06:30:00.000Z"
}
```

### 3.2 Rewards Data Model

```typescript
interface RewardsData {
  credits: number;               // Current credit balance
  totalEarned: number;           // Lifetime credits earned
  totalSpent: number;            // Lifetime credits spent
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  co2Saved: number;              // Total CO2 saved in grams
}

interface CreditTransaction {
  id: string;                    // Transaction ID
  amount: number;                // Credits (positive = earned, negative = spent)
  reason: string;                // Human-readable description
  timestamp: string;             // ISO 8601 timestamp
  metadata?: {
    type: string;                // 'eco_trip' | 'order' | 'redemption'
    mode?: string;               // 'bike' | 'walk' | 'public_transport'
    orderId?: string;
    rewardId?: string;
    isFirst?: boolean;
  };
}

interface Achievement {
  id: string;                    // Achievement identifier
  name: string;                  // Display name
  description: string;           // Description
  icon: string;                  // Icon name
  unlockedAt: string;            // ISO 8601 timestamp
  progress: number;              // 0-100 percentage
  target: number;                // Target value
  current: number;               // Current value
}

interface UserStats {
  totalOrders: number;
  ecoTrips: number;
  bikeDeliveries: number;
  walkDeliveries: number;
  ecoDeliveries: number;
  streakDays: number;
  lastOrderDate?: string;
}
```

**Storage Keys**:

- `@homemade_rewards_credits`: Stores `RewardsData`
- `@homemade_rewards_history`: Array of `CreditTransaction[]`
- `@homemade_rewards_achievements`: Array of `Achievement[]`
- `@homemade_rewards_stats`: `UserStats` object
- `@homemade_rewards_co2_savings`: `number` (total grams)

### 3.3 Notification Data Model

```typescript
interface NotificationData {
  id: string;                    // Notification ID from Expo
  scheduledFor: string;          // ISO 8601 timestamp
  type: 'abandoned_cart' | 'order_update' | 'eco_reminder';
  payload: {
    title: string;
    body: string;
    data?: Record<string, any>;
  };
}
```

---

## 4. Schema Definitions

### 4.1 Rewards Schema (Detailed)

```javascript
// Initial State
const INITIAL_REWARDS_STATE = {
  credits: 0,
  totalEarned: 0,
  totalSpent: 0,
  tier: 'bronze',
  co2Saved: 0,
  history: [],
  achievements: [
    {
      id: 'first_order',
      name: 'First Steps',
      description: 'Place your first order',
      icon: 'rocket',
      unlocked: false,
      progress: 0,
      target: 1,
      current: 0
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      description: 'Complete 10 eco-friendly deliveries',
      icon: 'leaf',
      unlocked: false,
      progress: 0,
      target: 10,
      current: 0
    },
    {
      id: 'carbon_saver',
      name: 'Carbon Saver',
      description: 'Save 10kg of CO₂',
      icon: 'cloud',
      unlocked: false,
      progress: 0,
      target: 10000, // in grams
      current: 0
    }
  ],
  stats: {
    totalOrders: 0,
    ecoTrips: 0,
    bikeDeliveries: 0,
    walkDeliveries: 0,
    ecoDeliveries: 0,
    streakDays: 0
  }
};
```

### 4.2 Cart Schema (Detailed)

```javascript
// Cart Item Structure
const CART_ITEM_SCHEMA = {
  id: 'string (required)',        // Generated UUID
  name: 'string (required)',
  price: 'number (required)',     // Must be > 0
  quantity: 'number (required)',  // Must be >= 1
  image: 'string (optional)',
  restaurant: {
    id: 'string (required)',
    name: 'string (required)',
    location: 'string (required)'
  },
  addedAt: 'ISO8601 string (required)'
};

// Validation Rules
const CART_VALIDATION = {
  maxItems: 50,                   // Maximum items in cart
  maxQuantityPerItem: 99,         // Maximum quantity per item
  minPrice: 0.01,                 // Minimum price
  maxPrice: 9999.99               // Maximum price
};
```

---

## 5. Data Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│   (Implicit)    │
└────────┬────────┘
         │
         │ owns
         │
    ┌────▼─────┬──────────┬──────────────┐
    │          │          │              │
┌───▼───┐  ┌──▼───┐  ┌───▼────┐  ┌──────▼──────┐
│ Cart  │  │Rewards│  │Notifs  │  │Achievements │
└───┬───┘  └──┬───┘  └────────┘  └─────────────┘
    │         │
    │         │ references
    │         │
┌───▼────┐ ┌──▼──────────┐
│CartItem│ │CreditHistory│
└────────┘ └─────────────┘
```

### Relationship Details

1. **Cart → CartItems**: One-to-Many
   - A cart contains multiple items
   - Items are embedded in cart object (denormalized)

2. **Rewards → CreditHistory**: One-to-Many
   - Rewards system tracks all credit transactions
   - History stored as separate array

3. **Rewards → Achievements**: One-to-Many
   - User can unlock multiple achievements
   - Progress tracked independently

4. **Rewards → Stats**: One-to-One
   - Single stats object per user
   - Updated atomically with credit awards

---

## 6. Storage Patterns

### 6.1 Read Pattern

```javascript
// Optimistic Read with Fallback
async function readData(key, defaultValue) {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
}
```

### 6.2 Write Pattern

```javascript
// Atomic Write with Error Handling
async function writeData(key, value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
}
```

### 6.3 Update Pattern (Rewards Example)

```javascript
// Read-Modify-Write Pattern
async function awardCredits(amount, reason, metadata) {
  // 1. Read current state
  const currentData = await readData(STORAGE_KEYS.REWARDS_CREDITS, INITIAL_STATE);
  
  // 2. Modify
  const newData = {
    ...currentData,
    credits: currentData.credits + amount,
    totalEarned: currentData.totalEarned + amount
  };
  
  // 3. Write back
  await writeData(STORAGE_KEYS.REWARDS_CREDITS, newData);
  
  // 4. Append to history
  const history = await readData(STORAGE_KEYS.REWARDS_HISTORY, []);
  history.push({
    id: generateId(),
    amount,
    reason,
    timestamp: new Date().toISOString(),
    metadata
  });
  await writeData(STORAGE_KEYS.REWARDS_HISTORY, history);
}
```

### 6.4 Batch Operations

```javascript
// Multi-key Update (Atomic)
async function updateRewardsAndStats(creditData, statsData) {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.REWARDS_CREDITS, JSON.stringify(creditData)],
      [STORAGE_KEYS.REWARDS_STATS, JSON.stringify(statsData)]
    ]);
    return true;
  } catch (error) {
    console.error('Batch update failed:', error);
    return false;
  }
}
```

---

## 7. Migration Strategy

### Version Management

```javascript
const SCHEMA_VERSION = '1.0.0';
const VERSION_KEY = '@homemade_schema_version';

async function checkAndMigrate() {
  const currentVersion = await AsyncStorage.getItem(VERSION_KEY);
  
  if (currentVersion !== SCHEMA_VERSION) {
    await performMigration(currentVersion, SCHEMA_VERSION);
    await AsyncStorage.setItem(VERSION_KEY, SCHEMA_VERSION);
  }
}
```

### Migration Functions

```javascript
async function performMigration(from, to) {
  console.log(`Migrating from ${from} to ${to}`);
  
  // Example: v0.9.0 → v1.0.0
  if (from === '0.9.0' && to === '1.0.0') {
    // Add new fields to rewards
    const rewards = await readData(STORAGE_KEYS.REWARDS_CREDITS, {});
    rewards.tier = rewards.tier || 'bronze';
    rewards.co2Saved = rewards.co2Saved || 0;
    await writeData(STORAGE_KEYS.REWARDS_CREDITS, rewards);
  }
}
```

### Data Backup Strategy

```javascript
async function backupAllData() {
  const allKeys = await AsyncStorage.getAllKeys();
  const homemadeKeys = allKeys.filter(key => key.startsWith('@homemade_'));
  const backup = await AsyncStorage.multiGet(homemadeKeys);
  
  return backup.reduce((acc, [key, value]) => {
    acc[key] = JSON.parse(value);
    return acc;
  }, {});
}

async function restoreFromBackup(backup) {
  const pairs = Object.entries(backup).map(([key, value]) => [
    key,
    JSON.stringify(value)
  ]);
  await AsyncStorage.multiSet(pairs);
}
```

---

## Performance Considerations

### Read Optimization

- **Caching**: Context layer caches frequently accessed data
- **Lazy Loading**: Load data only when needed
- **Batch Reads**: Use `multiGet` for related data

### Write Optimization

- **Debouncing**: Cart updates debounced by 500ms
- **Batch Writes**: Use `multiSet` for related updates
- **Background Writes**: Non-critical writes queued

### Storage Limits

- **Cart**: ~100 items max (estimated 50KB)
- **Rewards History**: ~1000 transactions (estimated 200KB)
- **Total**: ~1MB typical usage

---

## Security Considerations

### Data Sensitivity

- **Non-sensitive**: Cart items, rewards points
- **Sensitive**: None (no PII stored locally)
- **Authentication**: Handled server-side (future)

### Encryption

- Current: No encryption (AsyncStorage plain text)
- Future: Consider `react-native-encrypted-storage` for sensitive data

---

---

*Document Version: 1.0.0*  
*Last Updated: February 3, 2026*  
*Author: Homemade Development Team*
