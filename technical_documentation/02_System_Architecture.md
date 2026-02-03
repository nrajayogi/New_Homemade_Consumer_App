# System Architecture Documentation

## Homemade Consumer App v1.0.0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Application Layers](#application-layers)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Navigation Flow](#navigation-flow)
6. [Service Layer](#service-layer)
7. [Integration Points](#integration-points)
8. [Performance Architecture](#performance-architecture)

---

## 1. Architecture Overview

The Homemade Consumer App follows a **layered, component-based architecture** built on React Native and Expo. The system is designed for offline-first operation with eventual server synchronization.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Home    │  │  Order   │  │ Rewards  │  │ Profile  │   │
│  │  Screen  │  │  Screen  │  │  Screen  │  │  Screen  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   CONTEXT LAYER (State)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ CartContext  │  │RewardsContext│  │ErrorBoundary │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Notification  │  │  CVService   │  │SoundService  │     │
│  │  Service     │  │   (AI/CV)    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  PERSISTENCE LAYER                          │
│              AsyncStorage (Key-Value Store)                 │
└─────────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   NATIVE PLATFORM                           │
│         iOS (SQLite) / Android (RocksDB)                    │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
2. **Unidirectional Data Flow**: Data flows down, events flow up
3. **Component Reusability**: Shared components across screens
4. **Offline-First**: All features work without network
5. **Progressive Enhancement**: Network features enhance core functionality

---

## 2. Application Layers

### 2.1 Presentation Layer

**Responsibility**: User interface and user interaction

**Technologies**:

- React Native (UI framework)
- React Navigation (routing)
- Expo components (camera, haptics, notifications)

**Key Components**:

```
src/screens/
├── HomeScreen.js          # Main landing page
├── OrderScreen.js         # Restaurant menu & ordering
├── RoutePrepareScreen.js  # Delivery route planning
├── ActiveTripScreen.js    # Live trip tracking
├── PaymentScreen.js       # Payment processing
├── RewardsScreen.js       # Rewards dashboard
├── RewardShopScreen.js    # Rewards redemption
├── EcoProofCameraScreen.js # Eco-trip verification
├── ProfileScreen.js       # User profile
├── NotificationScreen.js  # Notification center
└── AIChatScreen.js        # AI assistant
```

**Design Patterns**:

- **Container/Presentational**: Smart containers manage state, dumb components render
- **Composition**: Complex UIs built from simple components
- **Hooks**: Functional components with React Hooks

### 2.2 Context Layer (State Management)

**Responsibility**: Global state management and business logic

**Implementation**: React Context API + Hooks

#### CartContext

```javascript
// State Structure
{
  items: CartItem[],
  totalItems: number,
  totalPrice: number,
  addToCart: (item) => void,
  removeFromCart: (itemId) => void,
  updateQuantity: (itemId, quantity) => void,
  clearCart: () => void
}
```

**Features**:

- Persistent cart (survives app restart)
- Automatic price calculation
- Abandoned cart detection (15-minute timer)
- Notification scheduling on cart abandonment

#### RewardsContext

```javascript
// State Structure
{
  credits: number,
  totalEarned: number,
  totalSpent: number,
  tier: string,
  co2Saved: number,
  history: Transaction[],
  achievements: Achievement[],
  stats: UserStats,
  
  // Actions
  awardCredits: (amount, reason, metadata) => void,
  spendCredits: (amount, reason) => void,
  addCO2Savings: (grams) => void,
  updateStats: (updates) => void,
  unlockAchievement: (achievementId) => void
}
```

**Features**:

- Real-time credit tracking
- Achievement progress monitoring
- CO2 savings calculation
- Transaction history
- Tier progression

### 2.3 Service Layer

**Responsibility**: Business logic, external integrations, utilities

#### NotificationService

```javascript
class NotificationService {
  // Initialize Expo Notifications
  static async initialize()
  
  // Request permissions
  static async requestPermissions()
  
  // Schedule notifications
  static async scheduleNotification(title, body, trigger, data)
  
  // Cancel notifications
  static async cancelNotification(id)
  
  // Setup listeners
  static setupListeners(onReceived, onTapped)
  
  // Remove listeners
  static removeListeners()
}
```

**Features**:

- Push notification support
- Local notification scheduling
- Custom sounds and vibration patterns
- Deep linking on notification tap

#### CVService (Computer Vision)

```javascript
class CVService {
  // Initialize ML models
  static async initialize()
  
  // Verify eco-trip proof
  static async verifyEcoProof(imageUri, claimedMode)
  
  // Detect transport mode
  static async detectTransportMode(imageUri)
  
  // Calculate confidence score
  static calculateConfidence(detections)
}
```

**Features**:

- Image-based transport mode detection
- Confidence scoring
- Fallback to manual review
- Demo mode for testing

#### SoundService

```javascript
class SoundService {
  // Load sound assets
  static async loadSounds()
  
  // Play notification sound
  static async playNotificationSound()
  
  // Play success sound
  static async playSuccessSound()
  
  // Trigger haptic feedback
  static async triggerHaptic(type)
}
```

### 2.4 Persistence Layer

**Technology**: AsyncStorage
**Pattern**: Repository Pattern

```javascript
// Generic Repository
class AsyncStorageRepository {
  async get(key, defaultValue) {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }
  
  async set(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }
  
  async remove(key) {
    await AsyncStorage.removeItem(key);
  }
  
  async clear() {
    await AsyncStorage.clear();
  }
}
```

---

## 3. Component Architecture

### Component Hierarchy

```
App (Root)
├── SafeAreaProvider
│   └── ErrorBoundary
│       └── CartProvider
│           └── RewardsProvider
│               └── AppNavigator (NavigationContainer)
│                   └── Stack.Navigator
│                       ├── HomeScreen
│                       │   ├── RestaurantCard (reusable)
│                       │   ├── CartToast (reusable)
│                       │   └── NotificationBanner (reusable)
│                       ├── OrderScreen
│                       │   ├── SmartImage (reusable)
│                       │   └── CartToast
│                       ├── RewardsScreen
│                       │   └── Achievement Cards
│                       └── ... (other screens)
```

### Reusable Components

#### RestaurantCard

```javascript
<RestaurantCard
  restaurant={restaurant}
  onPress={() => navigate('Order', { restaurant })}
/>
```

**Props**:

- `restaurant`: Restaurant data object
- `onPress`: Click handler
- `style`: Custom styling

#### CartToast

```javascript
<CartToast
  visible={showToast}
  message="Added to cart!"
  onClose={() => setShowToast(false)}
/>
```

**Features**:

- Auto-dismiss after 3 seconds
- Slide-in animation
- Customizable message

#### SmartImage

```javascript
<SmartImage
  source={{ uri: imageUrl }}
  fallback={require('./fallback.png')}
  style={styles.image}
/>
```

**Features**:

- Automatic fallback on error
- Loading indicator
- Caching

---

## 4. State Management

### Data Flow Diagram

```
┌──────────────┐
│  User Action │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Component   │ ──────┐
└──────┬───────┘       │
       │               │ Dispatch
       │               │
       ▼               ▼
┌──────────────┐  ┌────────────┐
│   Context    │  │  Service   │
│   Provider   │  │   Layer    │
└──────┬───────┘  └─────┬──────┘
       │                │
       │                │
       ▼                ▼
┌──────────────────────────┐
│     AsyncStorage         │
└──────────────────────────┘
       │
       │ State Update
       ▼
┌──────────────┐
│  Re-render   │
│  Components  │
└──────────────┘
```

### State Update Example (Add to Cart)

```javascript
// 1. User taps "Add to Cart" button
<TouchableOpacity onPress={() => addToCart(item)}>

// 2. Component calls context method
const { addToCart } = useCart();

// 3. Context updates state and persists
const addToCart = async (item) => {
  const newItems = [...items, item];
  setItems(newItems);
  await AsyncStorage.setItem('@cart', JSON.stringify(newItems));
  
  // 4. Schedule abandoned cart notification
  NotificationService.scheduleAbandonedCartNotification();
};

// 5. All subscribed components re-render
// CartToast shows, cart icon updates, etc.
```

---

## 5. Navigation Flow

### Navigation Structure

```
Stack Navigator (Main)
├── Home (Initial)
│   ├── → Order (Restaurant selected)
│   ├── → Rewards (Rewards button)
│   ├── → Profile (Profile button)
│   └── → Notifications (Notification tap)
│
├── Order
│   └── → RoutePrepare (Checkout)
│
├── RoutePrepare
│   ├── → Payment (Confirm route)
│   └── → EcoProofCamera (Eco mode selected)
│
├── Payment
│   └── → ActiveTrip (Payment confirmed)
│
├── ActiveTrip
│   ├── → EcoProofCamera (Verify eco-trip)
│   └── → Home (Trip completed)
│
├── EcoProofCamera
│   └── → Rewards (Verification success)
│
├── Rewards
│   └── → RewardShop (Redeem button)
│
└── RewardShop
    └── → Rewards (Item redeemed)
```

### Deep Linking

```javascript
// Notification tap → Navigate to specific screen
const linking = {
  prefixes: ['homemade://'],
  config: {
    screens: {
      Home: 'home',
      Order: 'order/:restaurantId',
      Rewards: 'rewards',
      Notifications: 'notifications',
      RoutePrepare: 'cart'
    }
  }
};

// Example: homemade://order/123 → OrderScreen with restaurantId=123
```

---

## 6. Service Layer

### Service Responsibilities

| Service | Responsibility | Dependencies |
|---------|---------------|--------------|
| NotificationService | Push/local notifications | expo-notifications |
| CVService | Image recognition | TensorFlow Lite (future) |
| SoundService | Audio & haptics | expo-av, expo-haptics |
| LocationService | GPS tracking (future) | expo-location |
| APIService | Backend API (future) | axios |

### Service Initialization

```javascript
// App.js
useEffect(() => {
  async function initializeServices() {
    await NotificationService.initialize();
    await CVService.initialize();
    await SoundService.loadSounds();
  }
  
  initializeServices();
}, []);
```

---

## 7. Integration Points

### External Services (Current)

1. **Expo Notifications**
   - Local notifications
   - Push notifications (configured, not active)

2. **Expo Camera**
   - Photo capture for eco-proof verification

3. **Expo Haptics**
   - Tactile feedback on actions

4. **Expo AV**
   - Custom notification sounds

### Future Integrations

1. **Backend API**
   - User authentication
   - Order processing
   - Real-time tracking

2. **Payment Gateway**
   - Stripe/PayPal integration

3. **Maps API**
   - Google Maps for route display

4. **ML Model Server**
   - Cloud-based image recognition

---

## 8. Performance Architecture

### Optimization Strategies

#### 1. Lazy Loading

```javascript
// Screens loaded on-demand
const OrderScreen = lazy(() => import('./screens/OrderScreen'));
```

#### 2. Memoization

```javascript
// Prevent unnecessary re-renders
const MemoizedRestaurantCard = React.memo(RestaurantCard);
```

#### 3. Virtualized Lists

```javascript
// Efficient rendering of long lists
<FlatList
  data={restaurants}
  renderItem={({ item }) => <RestaurantCard restaurant={item} />}
  keyExtractor={item => item.id}
  windowSize={10}
  maxToRenderPerBatch={10}
/>
```

#### 4. Image Optimization

```javascript
// Lazy image loading with caching
<Image
  source={{ uri: imageUrl }}
  resizeMode="cover"
  cache="force-cache"
/>
```

### Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| App Launch | < 2s | ~1.5s |
| Screen Transition | < 300ms | ~200ms |
| Cart Update | < 100ms | ~50ms |
| Image Load | < 1s | ~800ms |
| Notification Trigger | < 500ms | ~300ms |

---

## Security Architecture

### Current Security Measures

1. **Data Isolation**: Each user's data stored locally
2. **No PII Storage**: No personally identifiable information
3. **Input Validation**: All user inputs sanitized
4. **Error Boundaries**: Graceful error handling

### Future Security Enhancements

1. **Authentication**: JWT-based auth
2. **Encryption**: Encrypt sensitive data at rest
3. **HTTPS**: All API calls over HTTPS
4. **Rate Limiting**: Prevent abuse

---

## Scalability Considerations

### Current Limitations

- **Single Device**: No cross-device sync
- **Local Storage**: Limited to ~10MB
- **No Backend**: All data client-side

### Scaling Strategy

```
Phase 1 (Current): Local-only app
Phase 2: Add backend API for sync
Phase 3: Real-time features (WebSocket)
Phase 4: Multi-region deployment
```

---

*Document Version: 1.0.0*  
*Last Updated: February 3, 2026*  
*Author: Homemade Development Team*
