# Speed Determination & Trip Validation Documentation

## Homemade Consumer App v1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Speed Determination Methods](#speed-determination-methods)
3. [Transport Mode Speed Profiles](#transport-mode-speed-profiles)
4. [GPS-Based Speed Calculation](#gps-based-speed-calculation)
5. [Validation Algorithms](#validation-algorithms)
6. [Fraud Detection](#fraud-detection)
7. [Implementation Details](#implementation-details)
8. [Future Enhancements](#future-enhancements)

---

## 1. Overview

The Homemade Consumer App uses **speed determination** to validate eco-trip claims and detect fraudulent behavior. By analyzing GPS data and comparing speeds to expected ranges, the system ensures users are genuinely using claimed transport modes.

### System Goals

1. **Validate Claims**: Confirm user's transport mode matches GPS speed
2. **Detect Fraud**: Identify users claiming bike while driving
3. **Improve Accuracy**: Enhance CV model with speed data
4. **User Experience**: Seamless, non-intrusive validation

### Current Status

**Phase**: Planned (not yet implemented)  
**Dependencies**: GPS tracking, backend infrastructure  
**Timeline**: Q2 2026

---

## 2. Speed Determination Methods

### 2.1 GPS-Based Tracking

**Primary Method**: Continuous GPS sampling during trip

```
Trip Start
    ↓
GPS Sample (every 5 seconds)
    ├─ Latitude
    ├─ Longitude
    ├─ Altitude
    ├─ Accuracy
    └─ Timestamp
    ↓
Calculate instantaneous speed
    ↓
Calculate average speed
    ↓
Compare to mode profile
    ↓
Validate or flag
```

### 2.2 Accelerometer-Based Estimation

**Secondary Method**: Motion sensor analysis

```javascript
// Detect motion patterns
const MOTION_SIGNATURES = {
  'walk': {
    frequency: '1-2 Hz',      // Step cadence
    amplitude: 'low',
    pattern: 'periodic'
  },
  'bike': {
    frequency: '0.5-1.5 Hz',  // Pedal cadence
    amplitude: 'medium',
    pattern: 'periodic'
  },
  'car': {
    frequency: 'variable',
    amplitude: 'high',
    pattern: 'smooth'
  }
};
```

### 2.3 Hybrid Approach

**Best Method**: Combine GPS + Accelerometer + CV

```
┌─────────────┐
│  GPS Data   │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌──────────────┐
│Accelerometer│──┼───▶│Fusion Engine │
└─────────────┘  │    └──────┬───────┘
                 │           │
┌─────────────┐  │           ▼
│  CV Result  │──┘    ┌──────────────┐
└─────────────┘       │Final Decision│
                      └──────────────┘
```

---

## 3. Transport Mode Speed Profiles

### 3.1 Expected Speed Ranges

| Mode | Min Speed | Avg Speed | Max Speed | Typical Range |
|------|-----------|-----------|-----------|---------------|
| **Walking** | 0 km/h | 5 km/h | 8 km/h | 3-7 km/h |
| **Running** | 6 km/h | 10 km/h | 15 km/h | 8-12 km/h |
| **Cycling** | 5 km/h | 15 km/h | 30 km/h | 12-20 km/h |
| **E-bike** | 5 km/h | 20 km/h | 35 km/h | 15-25 km/h |
| **E-scooter** | 5 km/h | 18 km/h | 25 km/h | 15-22 km/h |
| **Bus** | 0 km/h | 25 km/h | 60 km/h | 15-40 km/h |
| **Car** | 0 km/h | 35 km/h | 120 km/h | 20-80 km/h |

### 3.2 Speed Distribution Curves

```
Walking:
Speed (km/h)
 8 │                    ╭─╮
 7 │                 ╭──╯ ╰──╮
 6 │              ╭──╯       ╰──╮
 5 │           ╭──╯             ╰──╮
 4 │        ╭──╯                   ╰──╮
 3 │     ╭──╯                         ╰──╮
 2 │  ╭──╯                               ╰──╮
 1 │──╯                                     ╰──
 0 └─────────────────────────────────────────
   0%  10%  20%  30%  40%  50%  60%  70%  80%
                 Time Percentile

Cycling:
Speed (km/h)
30 │                          ╭╮
25 │                       ╭──╯╰──╮
20 │                    ╭──╯      ╰──╮
15 │                 ╭──╯            ╰──╮
10 │              ╭──╯                  ╰──╮
 5 │           ╭──╯                        ╰──╮
 0 └───────────────────────────────────────────
   0%  10%  20%  30%  40%  50%  60%  70%  80%
                 Time Percentile
```

### 3.3 Statistical Parameters

```javascript
const SPEED_PROFILES = {
  'walk': {
    mean: 5.0,           // km/h
    stdDev: 1.0,         // km/h
    min: 0,
    max: 8,
    confidence95: [3, 7] // 95% of samples
  },
  'bike': {
    mean: 15.0,
    stdDev: 3.5,
    min: 5,
    max: 30,
    confidence95: [10, 22]
  },
  'bus': {
    mean: 25.0,
    stdDev: 8.0,
    min: 0,              // Stops
    max: 60,
    confidence95: [12, 40]
  },
  'car': {
    mean: 35.0,
    stdDev: 15.0,
    min: 0,
    max: 120,
    confidence95: [15, 70]
  }
};
```

---

## 4. GPS-Based Speed Calculation

### 4.1 Haversine Formula (Distance)

```javascript
/**
 * Calculate distance between two GPS coordinates
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  
  // Convert to radians
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  // Haversine formula
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  const distance = R * c; // meters
  
  return distance;
}
```

### 4.2 Instantaneous Speed Calculation

```javascript
/**
 * Calculate speed between two GPS points
 * @param {object} point1 - { lat, lon, timestamp }
 * @param {object} point2 - { lat, lon, timestamp }
 * @returns {number} Speed in km/h
 */
function calculateSpeed(point1, point2) {
  // Distance in meters
  const distance = haversineDistance(
    point1.lat, point1.lon,
    point2.lat, point2.lon
  );
  
  // Time difference in seconds
  const timeDiff = (point2.timestamp - point1.timestamp) / 1000;
  
  // Speed in m/s
  const speedMS = distance / timeDiff;
  
  // Convert to km/h
  const speedKMH = speedMS * 3.6;
  
  return speedKMH;
}
```

### 4.3 Average Speed Calculation

```javascript
/**
 * Calculate average speed over entire trip
 * @param {array} gpsPoints - Array of { lat, lon, timestamp }
 * @returns {number} Average speed in km/h
 */
function calculateAverageSpeed(gpsPoints) {
  if (gpsPoints.length < 2) return 0;
  
  // Total distance
  let totalDistance = 0;
  for (let i = 1; i < gpsPoints.length; i++) {
    totalDistance += haversineDistance(
      gpsPoints[i-1].lat, gpsPoints[i-1].lon,
      gpsPoints[i].lat, gpsPoints[i].lon
    );
  }
  
  // Total time (seconds)
  const totalTime = (
    gpsPoints[gpsPoints.length-1].timestamp - 
    gpsPoints[0].timestamp
  ) / 1000;
  
  // Average speed (km/h)
  const avgSpeed = (totalDistance / totalTime) * 3.6;
  
  return avgSpeed;
}
```

### 4.4 Moving Average (Smoothing)

```javascript
/**
 * Calculate smoothed speed using moving average
 * @param {array} speeds - Array of instantaneous speeds
 * @param {number} windowSize - Window size for averaging
 * @returns {array} Smoothed speeds
 */
function movingAverage(speeds, windowSize = 5) {
  const smoothed = [];
  
  for (let i = 0; i < speeds.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(speeds.length, i + Math.ceil(windowSize / 2));
    
    const window = speeds.slice(start, end);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    
    smoothed.push(avg);
  }
  
  return smoothed;
}
```

---

## 5. Validation Algorithms

### 5.1 Speed-Based Validation

```javascript
/**
 * Validate claimed mode against GPS speed data
 * @param {string} claimedMode - User's claimed transport mode
 * @param {array} gpsPoints - GPS tracking data
 * @returns {object} Validation result
 */
function validateTripSpeed(claimedMode, gpsPoints) {
  // Calculate speeds
  const speeds = [];
  for (let i = 1; i < gpsPoints.length; i++) {
    const speed = calculateSpeed(gpsPoints[i-1], gpsPoints[i]);
    speeds.push(speed);
  }
  
  // Remove outliers (GPS errors)
  const filteredSpeeds = removeOutliers(speeds);
  
  // Calculate statistics
  const avgSpeed = average(filteredSpeeds);
  const maxSpeed = Math.max(...filteredSpeeds);
  const speedVariance = variance(filteredSpeeds);
  
  // Get expected profile
  const profile = SPEED_PROFILES[claimedMode];
  
  // Validation checks
  const checks = {
    avgInRange: avgSpeed >= profile.confidence95[0] && 
                avgSpeed <= profile.confidence95[1],
    maxReasonable: maxSpeed <= profile.max * 1.2, // 20% tolerance
    varianceMatch: speedVariance < profile.stdDev * 2
  };
  
  // Calculate confidence
  const confidence = calculateValidationConfidence(checks, avgSpeed, profile);
  
  return {
    valid: confidence > 0.7,
    confidence: confidence,
    avgSpeed: avgSpeed,
    maxSpeed: maxSpeed,
    expectedRange: profile.confidence95,
    checks: checks
  };
}
```

### 5.2 Confidence Scoring

```javascript
/**
 * Calculate validation confidence score
 * @param {object} checks - Validation check results
 * @param {number} avgSpeed - Measured average speed
 * @param {object} profile - Expected speed profile
 * @returns {number} Confidence (0-1)
 */
function calculateValidationConfidence(checks, avgSpeed, profile) {
  let confidence = 0;
  
  // Check 1: Average speed in range (40% weight)
  if (checks.avgInRange) {
    // Calculate how close to mean
    const deviation = Math.abs(avgSpeed - profile.mean);
    const normalizedDev = deviation / profile.stdDev;
    const avgScore = Math.max(0, 1 - normalizedDev / 2);
    confidence += avgScore * 0.4;
  }
  
  // Check 2: Max speed reasonable (30% weight)
  if (checks.maxReasonable) {
    confidence += 0.3;
  }
  
  // Check 3: Variance matches (30% weight)
  if (checks.varianceMatch) {
    confidence += 0.3;
  }
  
  return Math.min(confidence, 1.0);
}
```

### 5.3 Outlier Removal

```javascript
/**
 * Remove GPS outliers using IQR method
 * @param {array} speeds - Array of speeds
 * @returns {array} Filtered speeds
 */
function removeOutliers(speeds) {
  // Sort speeds
  const sorted = [...speeds].sort((a, b) => a - b);
  
  // Calculate quartiles
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  // Define bounds
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  // Filter
  return speeds.filter(s => s >= lowerBound && s <= upperBound);
}
```

---

## 6. Fraud Detection

### 6.1 Fraud Patterns

| Pattern | Description | Detection |
|---------|-------------|-----------|
| **Speed Mismatch** | Claiming bike, driving car | avgSpeed > 30 km/h |
| **Impossible Acceleration** | Sudden speed jumps | Δspeed > 20 km/h in 5s |
| **GPS Spoofing** | Fake GPS data | Accuracy > 50m consistently |
| **Route Deviation** | Driving on highway | Speed + road type mismatch |

### 6.2 Fraud Detection Algorithm

```javascript
/**
 * Detect fraudulent eco-trip claims
 * @param {string} claimedMode - User's claim
 * @param {array} gpsPoints - GPS data
 * @returns {object} Fraud analysis
 */
function detectFraud(claimedMode, gpsPoints) {
  const flags = [];
  
  // Calculate speeds
  const speeds = gpsPoints.slice(1).map((p, i) => 
    calculateSpeed(gpsPoints[i], p)
  );
  
  // Flag 1: Excessive speed
  const maxSpeed = Math.max(...speeds);
  const profile = SPEED_PROFILES[claimedMode];
  if (maxSpeed > profile.max * 1.5) {
    flags.push({
      type: 'EXCESSIVE_SPEED',
      severity: 'HIGH',
      details: `Max speed ${maxSpeed.toFixed(1)} km/h exceeds ${claimedMode} limit`
    });
  }
  
  // Flag 2: Impossible acceleration
  for (let i = 1; i < speeds.length; i++) {
    const acceleration = Math.abs(speeds[i] - speeds[i-1]);
    if (acceleration > 20) { // 20 km/h change in 5 seconds
      flags.push({
        type: 'IMPOSSIBLE_ACCELERATION',
        severity: 'MEDIUM',
        details: `Speed changed by ${acceleration.toFixed(1)} km/h in 5s`
      });
    }
  }
  
  // Flag 3: GPS accuracy issues
  const lowAccuracyCount = gpsPoints.filter(p => p.accuracy > 50).length;
  if (lowAccuracyCount > gpsPoints.length * 0.5) {
    flags.push({
      type: 'GPS_SPOOFING_SUSPECTED',
      severity: 'HIGH',
      details: `${lowAccuracyCount}/${gpsPoints.length} points have low accuracy`
    });
  }
  
  // Calculate fraud risk score
  const riskScore = calculateFraudRisk(flags);
  
  return {
    fraudulent: riskScore > 0.7,
    riskScore: riskScore,
    flags: flags,
    recommendation: riskScore > 0.7 ? 'REJECT' : 
                    riskScore > 0.4 ? 'MANUAL_REVIEW' : 'APPROVE'
  };
}
```

### 6.3 Fraud Risk Scoring

```javascript
function calculateFraudRisk(flags) {
  const SEVERITY_WEIGHTS = {
    'HIGH': 0.4,
    'MEDIUM': 0.2,
    'LOW': 0.1
  };
  
  let risk = 0;
  flags.forEach(flag => {
    risk += SEVERITY_WEIGHTS[flag.severity] || 0;
  });
  
  return Math.min(risk, 1.0);
}
```

---

## 7. Implementation Details

### 7.1 GPS Tracking Service (Planned)

```javascript
class GPSTrackingService {
  static tracking = false;
  static gpsPoints = [];
  static watchId = null;
  
  /**
   * Start GPS tracking
   */
  static async startTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    
    this.tracking = true;
    this.gpsPoints = [];
    
    this.watchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,        // 5 seconds
        distanceInterval: 10       // 10 meters
      },
      (location) => {
        this.gpsPoints.push({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          speed: location.coords.speed,
          timestamp: location.timestamp
        });
      }
    );
  }
  
  /**
   * Stop GPS tracking
   */
  static async stopTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.tracking = false;
    
    return this.gpsPoints;
  }
  
  /**
   * Get current trip statistics
   */
  static getTripStats() {
    if (this.gpsPoints.length < 2) {
      return null;
    }
    
    const avgSpeed = calculateAverageSpeed(this.gpsPoints);
    const totalDistance = calculateTotalDistance(this.gpsPoints);
    const duration = (
      this.gpsPoints[this.gpsPoints.length-1].timestamp - 
      this.gpsPoints[0].timestamp
    ) / 1000 / 60; // minutes
    
    return {
      avgSpeed,
      totalDistance,
      duration,
      pointCount: this.gpsPoints.length
    };
  }
}
```

### 7.2 Integration with Eco-Trip Verification

```javascript
// In ActiveTripScreen.js
async function completeTrip() {
  // Stop GPS tracking
  const gpsData = await GPSTrackingService.stopTracking();
  
  // Validate speed
  const speedValidation = validateTripSpeed(claimedMode, gpsData);
  
  // Detect fraud
  const fraudAnalysis = detectFraud(claimedMode, gpsData);
  
  // Combined decision
  if (fraudAnalysis.fraudulent) {
    Alert.alert('Trip Rejected', 'Suspicious activity detected');
    return;
  }
  
  if (!speedValidation.valid) {
    Alert.alert(
      'Manual Review Required',
      `Your average speed (${speedValidation.avgSpeed.toFixed(1)} km/h) doesn't match ${claimedMode}. We'll review manually.`
    );
    return;
  }
  
  // Proceed with eco-proof camera
  navigation.navigate('EcoProofCamera', {
    claimedMode,
    gpsData,
    speedValidation
  });
}
```

---

## 8. Future Enhancements

### Phase 2: Basic GPS Validation (Q2 2026)

- Implement GPS tracking
- Basic speed validation
- Fraud detection

### Phase 3: Advanced Analytics (Q3 2026)

- Machine learning for fraud detection
- Route optimization suggestions
- Predictive speed profiling

### Phase 4: Multi-Modal Detection (Q4 2026)

- Automatic mode switching detection
- Combined trip analysis (bike + bus)
- Real-time feedback during trip

---

*Document Version: 1.0.0*  
*Last Updated: February 3, 2026*  
*Author: Homemade Development Team*
