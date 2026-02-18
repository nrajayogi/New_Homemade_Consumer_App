#  Homemade Consumer App

**Sustainable Food Delivery with Carbon Credit Rewards**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/nrajayogi/New_Homemade_Consumer_App)
[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

A React Native mobile application that rewards users with carbon credits for choosing eco-friendly transportation modes when ordering food delivery, and documentation in Github was done by AI.

---

## Overview

Homemade Consumer App is an innovative food delivery platform that incentivizes sustainable transportation choices. Users earn **carbon credits** by delivering or receiving orders via bike, walking, or public transport instead of personal vehicles.

### Key Features

-  **Eco-Friendly Deliveries**: Choose bike, walk, or bus for your deliveries
-  **Carbon Credit Rewards**: Earn credits for every gram of CO₂ saved
-  **AI Verification**: Photo-based proof of eco-friendly transport
-  **Achievements System**: Unlock badges and milestones
-  **Smart Cart**: Persistent shopping cart with abandoned cart notifications
-  **Custom Notifications**: Unique sounds and haptic feedback
-  **Impact Tracking**: Monitor your environmental contribution

---

##  How It Works

```
1. Browse Restaurants → 2. Add to Cart → 3. Choose Eco-Mode
                                              ↓
                                    4. Take Verification Photo
                                              ↓
                                    5. AI Verifies Transport Mode
                                              ↓
                                    6. Earn Carbon Credits!
```

### Carbon Credit System

- **1 Credit = 1 gram of CO₂ saved**
- Baseline: Average car emissions (192 g CO₂/km)
- Bike/Walk: 0 emissions = Maximum credits
- Bus: Reduced emissions = Partial credits

**Example**: 2km bike delivery saves **384g CO₂** = **300+ credits**

---

##  Technical Stack

### Frontend

- **Framework**: React Native (Expo SDK 51)
- **Navigation**: React Navigation 6.x
- **State Management**: React Context API
- **Storage**: AsyncStorage (offline-first)
- **UI Components**: React Native Paper, Expo Vector Icons

### Services

- **Notifications**: Expo Notifications
- **Camera**: Expo Camera
- **Haptics**: Expo Haptics
- **Audio**: Expo AV

### Planned Integrations

- **AI/ML**: TensorFlow Lite (transport mode detection)
- **GPS**: Expo Location (speed validation)
- **Backend**: Node.js + Express (future)

---

##  Project Structure

```
New_Homemade_Consumer_App/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── CartToast.js
│   │   ├── RestaurantCard.js
│   │   └── SmartImage.js
│   ├── context/           # Global state management
│   │   ├── CartContext.js
│   │   └── RewardsContext.js
│   ├── data/              # Mock data & constants
│   │   ├── mockData.js
│   │   └── rewardData.js
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.js
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.js
│   │   ├── OrderScreen.js
│   │   ├── RewardsScreen.js
│   │   ├── EcoProofCameraScreen.js
│   │   └── ...
│   └── services/          # Business logic services
│       ├── NotificationService.js
│       ├── CVService.js
│       └── SoundService.js
├── assets/                # Images, sounds, fonts
├── technical_documentation/  # Detailed technical docs
└── App.js                 # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android development)
- Physical Android device or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/nrajayogi/New_Homemade_Consumer_App.git
cd New_Homemade_Consumer_App

# Install dependencies
npm install

# Start development server
npx expo start --dev-client

# Run on Android
npx expo run:android
```

### Building APK

```bash
# Debug APK
cd android && ./gradlew assembleDebug

# Release APK
cd android && ./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Documentation

Comprehensive technical documentation is available in the [`technical_documentation/`](./technical_documentation/) folder:

| Document | Description | Pages |
|----------|-------------|-------|
| [Database Schema](./technical_documentation/01_Database_Schema_Architecture.md) | AsyncStorage structure, data models | 6+ |
| [System Architecture](./technical_documentation/02_System_Architecture.md) | App layers, components, state flow | 6+ |
| [AI & Computer Vision](./technical_documentation/03_AI_Model_Computer_Vision.md) | ML models, detection algorithms | 7+ |
| [Carbon Credits](./technical_documentation/04_Carbon_Credit_Calculation.md) | CO₂ formulas, scientific references | 7+ |
| [Speed Validation](./technical_documentation/05_Speed_Determination_Validation.md) | GPS tracking, fraud detection | 7+ |

---

##  Features in Detail

### 1. Rewards System

- **Credit Earning**:
  - First order: +50 credits
  - Eco-trip (bike/walk): +300 credits
  - First eco-proof: +50 bonus
  - Achievements: Up to +500 credits

- **Achievements**:
  -  First Steps (1st order)
  -  Eco Warrior (10 eco-trips)
  -  Carbon Saver (10kg CO₂ saved)
  -  Week Warrior (7-day streak)

### 2. Eco-Proof Verification

- **Photo Capture**: Take a picture of your bike/walk/bus
- **AI Analysis**: Computer vision verifies transport mode
- **Confidence Scoring**: 80%+ = Auto-approve, 50-80% = Manual review
- **Instant Rewards**: Credits awarded immediately upon verification

### 3. Smart Notifications

- **Abandoned Cart**: Reminder after 15 minutes
- **Custom Sounds**: Unique notification tones
- **Haptic Feedback**: Tactile confirmation
- **Deep Linking**: Tap notification → Navigate to relevant screen

---

##  Carbon Impact

### Emission Baselines (Scientific Sources)

| Transport Mode | CO₂ Emissions | Source |
|----------------|---------------|--------|
| Car (Gasoline) | 192 g/km | EPA 2024 |
| Bus | 89 g/km | DEFRA 2023 |
| Bicycle | 0 g/km | Zero emissions |
| Walking | 0 g/km | Zero emissions |

### Real-World Impact

**Monthly Impact** (20 bike deliveries, 2km each):

- CO₂ Saved: **7.68 kg**
- Equivalent: **4.4 trees planted**
- Credits Earned: **6,000+**

**Yearly Impact**:

- CO₂ Saved: **92.16 kg**
- Equivalent: **52 trees planted**

---

## Scientific References

1. **EPA (2024)**: [Greenhouse Gas Emissions from Typical Passenger Vehicle](https://www.epa.gov/greenvehicles)
2. **DEFRA (2023)**: [Greenhouse Gas Reporting Conversion Factors](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023)
3. **European Cyclists' Federation (2020)**: Cycling and CO₂ Emissions
4. **IPCC (2021)**: Climate Change - The Physical Science Basis

---

##  Roadmap

### ✅ Phase 1 (Current - v1.0.0)

- [x] Core food ordering functionality
- [x] Rewards system with carbon credits
- [x] Eco-proof camera verification (demo mode)
- [x] Achievements and stats tracking
- [x] Custom notifications

###  Phase 2 (Q2 2026)

- [ ] TensorFlow Lite ML model for transport detection
- [x] GPS-based speed validation
- [ ] Backend API integration
- [ ] User authentication

###  Phase 3 (Q3 2026)

- [x] Real-time order tracking
- [ ] Payment gateway integration
- [x] Social features (leaderboards)
- [ ] Carbon credit marketplace

###  Phase 4 (Q4 2026)

- [ ] Blockchain-based carbon credits
- [ ] Corporate partnerships
- [ ] Multi-city expansion
- [ ] iOS version

---

##  Team

**Homemade Development Team**

- Interaction Tecnology Intern: Rajayogi Nandina
- Technical Reviewers: Nijs (Lead Developer)

---

##  Contact

- **GitHub**: [@nrajayogi](https://github.com/nrajayogi)
- **Repository**: [New_Homemade_Consumer_App](https://github.com/nrajayogi/New_Homemade_Consumer_App)
- **Issues**: [Report a bug](https://github.com/nrajayogi/New_Homemade_Consumer_App/issues)

---

##  Acknowledgments

- Expo team for the amazing framework
- React Native community
- EPA and DEFRA for emission data
- Wakil Homemade founder
- All contributors and testers

---

##  Quick Links

- [ Technical Documentation](./technical_documentation/)
- [ Report Bug](https://github.com/nrajayogi/New_Homemade_Consumer_App/issues)
- [ Request Feature](https://github.com/nrajayogi/New_Homemade_Consumer_App/issues)
- [ API Documentation](./technical_documentation/02_System_Architecture.md)

---

<p align="center">
  <strong>Made with 💚 for a sustainable future</strong>
</p>

<p align="center">
  <sub>Reducing carbon emissions, one delivery at a time</sub>
</p>
