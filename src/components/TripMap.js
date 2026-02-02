import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const TripMap = ({ coordinates = [], currentLocation, currentMode = 'walk' }) => {
    // Web fallback (if ever needed, though we are focusing on Android)
    if (Platform.OS === 'web') {
        return <View style={{ height: 200, backgroundColor: '#ddd' }}><Text>Map not supported on Web</Text></View>;
    }

    const webViewRef = useRef(null);

    // Emoji mapping
    const getEmoji = (mode) => {
        switch (mode?.toLowerCase()) {
            case 'bike': return '🚴';
            case 'run': return '🏃';
            case 'car': return '🚗';
            default: return '🚶';
        }
    };

    // Initial constants
    const initialLat = currentLocation?.latitude || 37.78825;
    const initialLon = currentLocation?.longitude || -122.4324;

    // Update Map when props change
    useEffect(() => {
        if (currentLocation && webViewRef.current) {
            const { latitude, longitude } = currentLocation;
            const emoji = getEmoji(currentMode);
            const pathData = JSON.stringify(coordinates.map(c => [c.latitude, c.longitude]));

            // Script to run in WebView
            const script = `
                window.updateMap && window.updateMap(${latitude}, ${longitude}, "${emoji}", ${pathData});
            `;
            webViewRef.current.injectJavaScript(script);
        }
    }, [currentLocation, currentMode, coordinates]);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; background-color: #f0f0f0; }
            #map { width: 100%; height: 100vh; }
            .emoji-marker { 
                font-size: 30px; 
                text-align: center; 
                line-height: 40px; 
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Init variables
            var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${initialLat}, ${initialLon}], 17);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            // Icon
            var emojiIcon = L.divIcon({
                className: 'custom-div-icon',
                html: "<div id='marker-icon' class='emoji-marker'>🚶</div>",
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            var marker = L.marker([${initialLat}, ${initialLon}], { icon: emojiIcon }).addTo(map);
            var polyline = L.polyline([], {color: '#4A90E2', weight: 4}).addTo(map);

            // --- BRIDGE FUNCTION ---
            window.updateMap = function(lat, lng, emoji, path) {
                // Update Marker
                var newLatLng = new L.LatLng(lat, lng);
                marker.setLatLng(newLatLng);
                map.panTo(newLatLng);
                
                // Update Icon
                if (document.getElementById('marker-icon')) {
                    document.getElementById('marker-icon').innerText = emoji;
                }

                // Update Path
                if (path && path.length > 0) {
                    polyline.setLatLngs(path);
                }
            };
        </script>
    </body>
    </html>
    `;

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={styles.webview}
                scrollEnabled={false}
                javaScriptEnabled={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
        marginVertical: 10,
        elevation: 3,
        backgroundColor: '#e0e0e0',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    }
});

export default TripMap;
