// Gesture Recognition Engine
// Detects hand gestures based on finger positions and orientations

class GestureRecognizer {
    constructor() {
        this.currentGesture = null;
        this.gestureConfidence = 0;
        this.gestureHistory = [];
        this.historySize = 5;
    }

    // Calculate distance between two landmarks
    distance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = (point1.z || 0) - (point2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // Check if finger is extended
    isFingerExtended(landmarks, fingerTip, fingerPip, fingerMcp) {
        const tipToPip = this.distance(landmarks[fingerTip], landmarks[fingerPip]);
        const pipToMcp = this.distance(landmarks[fingerPip], landmarks[fingerMcp]);
        const tipToMcp = this.distance(landmarks[fingerTip], landmarks[fingerMcp]);
        
        // Finger is extended if tip-to-mcp distance is greater than sum of segments
        return tipToMcp > (tipToPip + pipToMcp) * 0.85;
    }

    // Check if finger is curled
    isFingerCurled(landmarks, fingerTip, fingerPip, fingerMcp, wrist) {
        const tipToWrist = this.distance(landmarks[fingerTip], landmarks[wrist]);
        const mcpToWrist = this.distance(landmarks[fingerMcp], landmarks[wrist]);
        
        // Finger is curled if tip is closer to wrist than mcp
        return tipToWrist < mcpToWrist * 1.2;
    }

    // Detect Peace Sign (✌️)
    detectPeace(landmarks) {
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringCurled = this.isFingerCurled(landmarks, 16, 14, 13, 0);
        const pinkyCurled = this.isFingerCurled(landmarks, 20, 18, 17, 0);
        
        if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
            return { name: 'Peace', emoji: '✌️', confidence: 0.9 };
        }
        return null;
    }

    // Detect Thumbs Up (👍)
    detectThumbsUp(landmarks) {
        const thumbExtended = landmarks[4].y < landmarks[3].y;
        const indexCurled = this.isFingerCurled(landmarks, 8, 6, 5, 0);
        const middleCurled = this.isFingerCurled(landmarks, 12, 10, 9, 0);
        const ringCurled = this.isFingerCurled(landmarks, 16, 14, 13, 0);
        const pinkyCurled = this.isFingerCurled(landmarks, 20, 18, 17, 0);
        
        if (thumbExtended && indexCurled && middleCurled && ringCurled && pinkyCurled) {
            return { name: 'Thumbs Up', emoji: '👍', confidence: 0.85 };
        }
        return null;
    }

    // Detect Pointing (👉)
    detectPointing(landmarks) {
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleCurled = this.isFingerCurled(landmarks, 12, 10, 9, 0);
        const ringCurled = this.isFingerCurled(landmarks, 16, 14, 13, 0);
        const pinkyCurled = this.isFingerCurled(landmarks, 20, 18, 17, 0);
        
        if (indexExtended && middleCurled && ringCurled && pinkyCurled) {
            return { name: 'Pointing', emoji: '👉', confidence: 0.88 };
        }
        return null;
    }

    // Detect Fist (✊)
    detectFist(landmarks) {
        const indexCurled = this.isFingerCurled(landmarks, 8, 6, 5, 0);
        const middleCurled = this.isFingerCurled(landmarks, 12, 10, 9, 0);
        const ringCurled = this.isFingerCurled(landmarks, 16, 14, 13, 0);
        const pinkyCurled = this.isFingerCurled(landmarks, 20, 18, 17, 0);
        
        if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
            return { name: 'Fist', emoji: '✊', confidence: 0.92 };
        }
        return null;
    }

    // Detect Open Palm (🖐️)
    detectOpenPalm(landmarks) {
        const thumbExtended = this.isFingerExtended(landmarks, 4, 3, 2);
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
            return { name: 'Open Palm', emoji: '🖐️', confidence: 0.95 };
        }
        return null;
    }

    // Detect Shaka (🤙)
    detectShaka(landmarks) {
        const thumbExtended = landmarks[4].y < landmarks[3].y;
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        const indexCurled = this.isFingerCurled(landmarks, 8, 6, 5, 0);
        const middleCurled = this.isFingerCurled(landmarks, 12, 10, 9, 0);
        const ringCurled = this.isFingerCurled(landmarks, 16, 14, 13, 0);
        
        if (thumbExtended && pinkyExtended && indexCurled && middleCurled && ringCurled) {
            return { name: 'Shaka', emoji: '🤙', confidence: 0.87 };
        }
        return null;
    }

    // Recognize gesture from hand landmarks
    recognize(landmarks) {
        if (!landmarks || landmarks.length < 21) {
            return null;
        }

        // Try all gesture detectors
        const gestures = [
            this.detectPeace(landmarks),
            this.detectThumbsUp(landmarks),
            this.detectPointing(landmarks),
            this.detectFist(landmarks),
            this.detectOpenPalm(landmarks),
            this.detectShaka(landmarks)
        ];

        // Find the gesture with highest confidence
        const detected = gestures.filter(g => g !== null);
        if (detected.length === 0) {
            return null;
        }

        // Sort by confidence and return best match
        detected.sort((a, b) => b.confidence - a.confidence);
        const bestGesture = detected[0];

        // Add to history for smoothing
        this.gestureHistory.push(bestGesture.name);
        if (this.gestureHistory.length > this.historySize) {
            this.gestureHistory.shift();
        }

        // Use most common gesture in history
        const gestureCounts = {};
        this.gestureHistory.forEach(g => {
            gestureCounts[g] = (gestureCounts[g] || 0) + 1;
        });

        let mostCommon = bestGesture.name;
        let maxCount = 0;
        for (const [gesture, count] of Object.entries(gestureCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = gesture;
            }
        }

        // Find the emoji for the most common gesture
        const finalGesture = detected.find(g => g.name === mostCommon) || bestGesture;
        
        this.currentGesture = finalGesture.name;
        this.gestureConfidence = finalGesture.confidence;

        return finalGesture;
    }

    // Reset gesture history
    reset() {
        this.gestureHistory = [];
        this.currentGesture = null;
        this.gestureConfidence = 0;
    }
}

// Export for use in other modules
window.GestureRecognizer = GestureRecognizer;
