// UI Controls Module
// Handles all user interface interactions and settings

class ControlsManager {
    constructor(trackingManager) {
        this.tracking = trackingManager;
        this.settings = this.loadSettings();

        this.initElements();
        this.initEventListeners();
        this.applySettings();
    }

    // Initialize DOM elements
    initElements() {
        // Toggles
        this.toggleHands = document.getElementById('toggle-hands');
        this.togglePose = document.getElementById('toggle-pose');
        this.toggleGestures = document.getElementById('toggle-gestures');

        // Color pickers
        this.handColorPicker = document.getElementById('hand-color');
        this.poseColorPicker = document.getElementById('pose-color');

        // Slider
        this.confidenceSlider = document.getElementById('confidence-slider');
        this.confidenceValue = document.getElementById('confidence-value');

        // Buttons
        this.screenshotBtn = document.getElementById('screenshot-btn');
        this.toggleTextBtn = document.getElementById('toggle-text-btn');
        this.resetBtn = document.getElementById('reset-btn');

        // Overlays
        this.textOverlay = document.getElementById('text-overlay');
        this.gestureDisplay = document.getElementById('gesture-display');
        this.fpsCounter = document.getElementById('fps-counter');

        // Gesture library
        this.gestureLibrary = document.getElementById('gesture-library');
        this.gestureCards = this.gestureLibrary.querySelectorAll('.gesture-card');
    }

    // Initialize event listeners
    initEventListeners() {
        // Toggle switches
        this.toggleHands.addEventListener('change', (e) => {
            this.tracking.toggleHandTracking(e.target.checked);
            this.settings.handTracking = e.target.checked;
            this.saveSettings();
        });

        this.togglePose.addEventListener('change', (e) => {
            this.tracking.togglePoseTracking(e.target.checked);
            this.settings.poseTracking = e.target.checked;
            this.saveSettings();
        });

        this.toggleGestures.addEventListener('change', (e) => {
            this.tracking.toggleGestureRecognition(e.target.checked);
            this.settings.gestureRecognition = e.target.checked;
            this.saveSettings();
        });

        // Color pickers
        this.handColorPicker.addEventListener('input', (e) => {
            this.tracking.updateSettings({ handColor: e.target.value });
            this.settings.handColor = e.target.value;
            this.saveSettings();
        });

        this.poseColorPicker.addEventListener('input', (e) => {
            this.tracking.updateSettings({ poseColor: e.target.value });
            this.settings.poseColor = e.target.value;
            this.saveSettings();
        });

        // Confidence slider
        this.confidenceSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.confidenceValue.textContent = value.toFixed(2);
            this.tracking.updateSettings({ minConfidence: value });
            this.settings.minConfidence = value;
            this.saveSettings();
        });

        // Buttons
        this.screenshotBtn.addEventListener('click', () => this.takeScreenshot());
        this.toggleTextBtn.addEventListener('click', () => this.toggleTextOverlay());
        this.resetBtn.addEventListener('click', () => this.resetSettings());

        // Text overlay
        this.textOverlay.addEventListener('input', () => {
            this.settings.overlayText = this.textOverlay.textContent;
            this.saveSettings();
        });
    }

    // Apply saved settings
    applySettings() {
        // Toggles
        this.toggleHands.checked = this.settings.handTracking;
        this.togglePose.checked = this.settings.poseTracking;
        this.toggleGestures.checked = this.settings.gestureRecognition;

        // Colors
        this.handColorPicker.value = this.settings.handColor;
        this.poseColorPicker.value = this.settings.poseColor;

        // Confidence
        this.confidenceSlider.value = this.settings.minConfidence;
        this.confidenceValue.textContent = this.settings.minConfidence.toFixed(2);

        // Text overlay
        if (this.settings.overlayText) {
            this.textOverlay.textContent = this.settings.overlayText;
        }
        if (this.settings.textOverlayVisible) {
            this.textOverlay.classList.add('active');
        }

        // Apply to tracking manager
        this.tracking.updateSettings({
            handColor: this.settings.handColor,
            poseColor: this.settings.poseColor,
            minConfidence: this.settings.minConfidence
        });

        this.tracking.toggleHandTracking(this.settings.handTracking);
        this.tracking.togglePoseTracking(this.settings.poseTracking);
        this.tracking.toggleGestureRecognition(this.settings.gestureRecognition);
    }

    // Take screenshot
    takeScreenshot() {
        const video = document.getElementById('webcam');
        const canvas = document.getElementById('output-canvas');

        // Create temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw video (flipped)
        tempCtx.save();
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(video, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.restore();

        // Draw overlay canvas
        tempCtx.save();
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(canvas, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.restore();

        // Draw text overlay if active and has content
        if (this.textOverlay.classList.contains('active') && this.textOverlay.textContent.trim() !== '') {
            const text = this.textOverlay.textContent;

            tempCtx.save();
            tempCtx.font = "500 30px 'Inter', sans-serif"; // Match CSS approximate size
            tempCtx.fillStyle = "white";
            tempCtx.textAlign = "center";
            tempCtx.textBaseline = "bottom";

            // Add shadow/glow to match UI style
            tempCtx.shadowColor = "rgba(0, 0, 0, 0.7)";
            tempCtx.shadowBlur = 10;
            tempCtx.lineWidth = 4; // stroke width
            tempCtx.strokeStyle = "rgba(0,0,0,0.5)";

            // Position from bottom
            // 2rem (spacing-lg) is approx 32px
            const bottomPadding = 40;
            const x = tempCanvas.width / 2;
            const y = tempCanvas.height - bottomPadding;

            tempCtx.strokeText(text, x, y);
            tempCtx.fillText(text, x, y);
            tempCtx.restore();
        }

        // Download
        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gesture-capture-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Visual feedback
        this.screenshotBtn.textContent = '✓ Saved!';
        setTimeout(() => {
            this.screenshotBtn.textContent = '📸 Screenshot';
        }, 2000);
    }

    // Toggle text overlay
    toggleTextOverlay() {
        this.textOverlay.classList.toggle('active');
        this.settings.textOverlayVisible = this.textOverlay.classList.contains('active');
        this.saveSettings();

        if (this.textOverlay.classList.contains('active')) {
            this.textOverlay.focus();
        }
    }

    // Reset settings to defaults
    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        this.applySettings();

        // Clear text overlay
        this.textOverlay.textContent = '';
        this.textOverlay.classList.remove('active');

        // Visual feedback
        this.resetBtn.textContent = '✓ Reset!';
        setTimeout(() => {
            this.resetBtn.textContent = '🔄 Reset';
        }, 2000);
    }

    // Update gesture display
    updateGestureDisplay(gesture) {
        const icon = this.gestureDisplay.querySelector('.gesture-icon');
        const name = this.gestureDisplay.querySelector('.gesture-name');

        if (gesture) {
            icon.textContent = gesture.emoji;
            name.textContent = gesture.name;
            this.gestureDisplay.style.opacity = '1';

            // Highlight corresponding card
            this.highlightGestureCard(gesture.name);
        } else {
            icon.textContent = '✋';
            name.textContent = 'No gesture detected';
            this.gestureDisplay.style.opacity = '0.7';

            // Clear highlights
            this.gestureCards.forEach(card => card.classList.remove('active'));
        }
    }

    // Highlight gesture card
    highlightGestureCard(gestureName) {
        this.gestureCards.forEach(card => {
            const label = card.querySelector('.gesture-label').textContent;
            if (label === gestureName || this.matchGestureName(label, gestureName)) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // Match gesture names (handle variations)
    matchGestureName(label, gestureName) {
        const matches = {
            'Peace': 'Peace',
            'Thumbs Up': 'Thumbs Up',
            'Pointing': 'Pointing',
            'Fist': 'Fist',
            'Open Palm': 'Open Palm',
            'Shaka': 'Shaka'
        };
        return matches[label] === gestureName;
    }

    // Update FPS counter
    updateFPS(fps) {
        this.fpsCounter.textContent = `FPS: ${fps}`;

        // Color code based on performance
        if (fps >= 25) {
            this.fpsCounter.style.color = '#10b981'; // Green
        } else if (fps >= 15) {
            this.fpsCounter.style.color = '#f59e0b'; // Yellow
        } else {
            this.fpsCounter.style.color = '#ef4444'; // Red
        }
    }

    // Load settings from localStorage
    loadSettings() {
        const saved = localStorage.getItem('gestureVisionSettings');
        if (saved) {
            try {
                return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load settings:', e);
                return this.getDefaultSettings();
            }
        }
        return this.getDefaultSettings();
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('gestureVisionSettings', JSON.stringify(this.settings));
    }

    // Get default settings
    getDefaultSettings() {
        return {
            handTracking: true,
            poseTracking: true,
            gestureRecognition: true,
            handColor: '#00ffff',
            poseColor: '#ff00ff',
            minConfidence: 0.5,
            overlayText: '',
            textOverlayVisible: false
        };
    }
}

// Export for use in other modules
window.ControlsManager = ControlsManager;
