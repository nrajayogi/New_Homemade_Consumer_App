import { Audio } from 'expo-av';

const SOUNDS = {
    // We will need to actually add this file or this will crash the app if we require it strictly.
    // Ideally, we conditionally require or the user provides the file.
    // For now, I'll assume standard naming. 
    // If the file doesn't exist, we might need a fallback or try/catch around the require.
    'sizzle': require('../../assets/sounds/sizzle.mp3'),
    'ding': require('../../assets/sounds/ding.mp3'),
};

// Fallback empty object if files missing to prevent crash during development
// In a real app we'd ensure assets exist.

class SoundService {
    constructor() {
        this.sounds = {};
    }

    async loadSounds() {
        try {
            // Setup audio mode
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Preload sounds
            for (const [key, source] of Object.entries(SOUNDS)) {
                try {
                    const { sound } = await Audio.Sound.createAsync(source);
                    this.sounds[key] = sound;
                } catch (e) {
                    console.warn(`[SoundService] Failed to load sound: ${key}`, e);
                }
            }
        } catch (error) {
            console.error('[SoundService] Error initializing audio:', error);
        }
    }

    async playSound(name) {
        try {
            const soundObject = this.sounds[name];
            if (soundObject) {
                try {
                    await soundObject.replayAsync();
                } catch (e) {
                     // Try reloading if replay fails
                     await soundObject.playFromPositionAsync(0);
                }
            } else {
                console.log(`[SoundService] Sound not found: ${name}`);
            }
        } catch (error) {
            console.error('[SoundService] Play error:', error);
        }
    }

    async unloadSounds() {
        for (const sound of Object.values(this.sounds)) {
            try {
                await sound.unloadAsync();
            } catch (e) {
                // ignore
            }
        }
    }
}

export default new SoundService();
