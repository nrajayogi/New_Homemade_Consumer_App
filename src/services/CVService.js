/**
 * Mobile CV Service for Eco-Proof Verification
 *
 * This service integrates with the React Native app to provide
 * on-device or server-side image classification.
 *
 * Author: Homemade AI Team
 * Date: 2026-01-09
 */

import { Platform } from 'react-native';

class CVService {
    constructor() {
        this.serverUrl = 'http://localhost:8003'; // Update for production
        this.initialized = false;
    }

    /**
     * Initialize CV service
     */
    async initialize() {
        try {
            // Check if server is available
            const response = await fetch(`${this.serverUrl}/health`);
            const data = await response.json();

            if (data.status === 'healthy') {
                this.initialized = true;
                console.log('[CVService] Initialized successfully');
            }
        } catch (error) {
            console.log('[CVService] Server not available, using fallback');
            this.initialized = false;
        }
    }

    /**
     * Verify eco-proof image
     * 
     * @param {string} imageUri - Local URI of captured image
     * @param {string} claimedMode - User's claimed transport mode ('bike' or 'walk')
     * @returns {Promise<Object>} Verification result
     */
    async verifyEcoProof(imageUri, claimedMode) {
        try {
            // Create form data
            const formData = new FormData();

            // Add image file
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            formData.append('claimed_mode', claimedMode);

            // Send to server
            const response = await fetch(`${this.serverUrl}/verify-eco-proof`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            console.log('[CVService] Verification result:', result);

            return {
                success: true,
                ...result,
            };

        } catch (error) {
            console.error('[CVService] Error verifying eco-proof:', error);

            // Fallback: Auto-approve with low confidence
            return {
                success: false,
                status: 'pending_review',
                message: 'Verification service unavailable. Submitted for manual review.',
                confidence: 0.5,
                error: error.message,
            };
        }
    }

    /**
     * Classify image without verification
     * 
     * @param {string} imageUri - Local URI of image
     * @returns {Promise<Object>} Classification result
     */
    async classifyImage(imageUri) {
        try {
            const formData = new FormData();

            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            const response = await fetch(`${this.serverUrl}/classify-image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = await response.json();

            return {
                success: true,
                ...result,
            };

        } catch (error) {
            console.error('[CVService] Error classifying image:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get confidence threshold recommendations
     */
    getConfidenceThresholds() {
        return {
            high: 0.85,    // Auto-approve
            medium: 0.60,  // Manual review
            low: 0.60,     // Reject
        };
    }
}

// Singleton instance
const cvService = new CVService();

export default cvService;
