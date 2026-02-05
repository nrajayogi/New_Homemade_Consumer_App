# Technical Documentation: Sources and References

The following documentation lists the official sources and standard patterns used during the code cleanup and hallucination-fix process. As an AI, I do not copy-paste code from protected sources; instead, I implement standard logic based on official library documentation.

## 1. Expo Location API

Used for dynamic location fetching and reverse geocoding in `HomeScreen.js`.

- **Pattern**: Request permissions -> Fetch coordinates -> Reverse Geocode for human-readable address.
- **Source**: [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- **Methods Reference**:
  - `Location.requestForegroundPermissionsAsync()`
  - `Location.getCurrentPositionAsync()`
  - `Location.reverseGeocodeAsync()`

## 2. React Navigation

Used for fixing the `CartToast` navigation logic in `HomeScreen.js`.

- **Pattern**: Conditional navigation based on component state/props.
- **Source**: [React Navigation - Navigating between screens](https://reactnavigation.org/docs/navigating/)
- **Methods Reference**:
  - `navigation.navigate(routeName, params)`

## 3. Discount & Tax Logic

Used for replacing hardcoded constants in `RoutePrepareScreen.js`.

- **Logic**: Mathematical percentage calculation based on numeric subtotals.
- **Pattern**: `subtotal * multiplier`
- **Source**: Standard algorithmic practice for e-commerce applications.

## 4. UI Patterns (React Native)

Used for centralized mock data and section headers in `OrderScreen.js`.

- **Pattern**: "Data-Driven Component Rendering" (FlatList, ScrollView maps).
- **Source**: [React Native Documentation](https://reactnative.dev/docs/flatlist)
