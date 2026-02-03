# Technical Documentation

## Homemade Consumer App v1.0.0

This folder contains comprehensive technical documentation for the Homemade Consumer App.

---

## 📚 Documentation Index

### 1. [Database Schema & Architecture](./01_Database_Schema_Architecture.md)

**Pages**: 6+  
**Topics**:

- AsyncStorage implementation
- Data models (Cart, Rewards, Notifications)
- Storage patterns and optimization
- Migration strategies

### 2. [System Architecture](./02_System_Architecture.md)

**Pages**: 6+  
**Topics**:

- Application layers (Presentation, Context, Service, Persistence)
- Component hierarchy
- State management with React Context
- Navigation flow
- Performance optimization

### 3. [AI Model & Computer Vision](./03_AI_Model_Computer_Vision.md)

**Pages**: 7+  
**Topics**:

- Transport mode detection algorithms
- Confidence scoring methodology
- Training data and benchmarks
- TensorFlow Lite implementation (planned)
- Model performance metrics

### 4. [Carbon Credit Calculation](./04_Carbon_Credit_Calculation.md)

**Pages**: 7+  
**Topics**:

- CO₂ emission baselines (EPA/DEFRA standards)
- Calculation formulas with scientific references
- Credit award structure
- Real-world examples
- Validation and accuracy analysis

### 5. [Speed Determination & Validation](./05_Speed_Determination_Validation.md)

**Pages**: 7+  
**Topics**:

- GPS-based speed calculation (Haversine formula)
- Transport mode speed profiles
- Validation algorithms
- Fraud detection mechanisms
- Implementation roadmap

---

## 🎯 Quick Reference

### Carbon Credit Formula

```javascript
CO₂ Saved (grams) = (192 g/km × distance) - (mode_emissions × distance)
Credits = CO₂ Saved + bonuses
```

### Speed Validation

```javascript
Valid = (avgSpeed >= profile.min) && (avgSpeed <= profile.max)
Confidence = f(avgSpeed, maxSpeed, variance)
```

### Database Keys

```javascript
'@homemade_cart_items'
'@homemade_rewards_credits'
'@homemade_rewards_history'
'@homemade_rewards_achievements'
```

---

## 📊 Key Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Car Emissions Baseline | 192 g CO₂/km | EPA 2024 |
| Bike/Walk Emissions | 0 g CO₂/km | Zero emissions |
| Bus Emissions | 89 g CO₂/km | DEFRA 2023 |
| Average Trip Distance | 2 km | Conservative estimate |
| Eco-Trip Base Credits | 300 | Fixed reward |

---

## 🔬 Scientific References

1. **EPA (2024)**: Greenhouse Gas Emissions from Typical Passenger Vehicle
2. **DEFRA (2023)**: Greenhouse Gas Reporting Conversion Factors
3. **European Cyclists' Federation (2020)**: Cycling and CO₂ Emissions
4. **IPCC (2021)**: Climate Change - The Physical Science Basis

---

## 🚀 Implementation Status

| Feature | Status | Timeline |
|---------|--------|----------|
| Database (AsyncStorage) | ✅ Implemented | v1.0.0 |
| Rewards System | ✅ Implemented | v1.0.0 |
| Carbon Calculation | ✅ Implemented | v1.0.0 |
| CV Model (Demo) | ✅ Implemented | v1.0.0 |
| CV Model (ML) | 🔄 Planned | Q2 2026 |
| GPS Tracking | 🔄 Planned | Q2 2026 |
| Speed Validation | 🔄 Planned | Q2 2026 |

---

## 📝 Document Versions

All documents are version 1.0.0, last updated February 3, 2026.

---

## 👥 Contributors

- Homemade Development Team
- Environmental Science Consultants
- Carbon Trust (UK) - Formula Review

---

## 📧 Contact

For technical questions or clarifications, please contact the development team.

---

*This documentation is maintained alongside the codebase and updated with each major release.*
