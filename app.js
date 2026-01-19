// Main Application
// Initializes and coordinates all modules

class GestureVisionApp {
    constructor() {
        this.trackingManager = null;
        this.controlsManager = null;
        this.isInitialized = false;

        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('output-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
    }

    // Initialize the application
    async init() {
        try {
            console.log('Initializing Gesture Vision...');

            // Show loading screen
            this.showLoading('Initializing camera and AI models...');

            // Initialize tracking manager
            this.trackingManager = new TrackingManager(
                this.videoElement,
                this.canvasElement
            );

            // Set up callbacks
            this.trackingManager.onGestureDetected = (gesture) => {
                if (this.controlsManager) {
                    this.controlsManager.updateGestureDisplay(gesture);
                }
            };

            // Start tracking
            await this.trackingManager.start();

            // Initialize controls manager
            this.controlsManager = new ControlsManager(this.trackingManager);

            // Start FPS update loop
            this.startFPSLoop();

            // Hide loading screen
            this.hideLoading();

            this.isInitialized = true;
            console.log('Gesture Vision initialized successfully!');

        } catch (error) {
            console.error('Initialization error:', error);
            this.showError(error);
        }
    }

    // Show loading screen
    showLoading(message) {
        this.loadingScreen.classList.remove('hidden');
        const loadingText = this.loadingScreen.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    // Hide loading screen
    hideLoading() {
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
        }, 500);
    }

    // Show error
    showError(error) {
        this.loadingScreen.classList.remove('hidden');
        const loadingText = this.loadingScreen.querySelector('.loading-text');
        const spinner = this.loadingScreen.querySelector('.loading-spinner');

        if (spinner) {
            spinner.style.display = 'none';
        }

        if (loadingText) {
            loadingText.innerHTML = `
                <div style="color: #ef4444; font-weight: 600; margin-bottom: 1rem;">
                    ⚠️ Initialization Failed
                </div>
                <div style="color: #fff; font-size: 0.9rem; max-width: 500px; margin: 0 auto;">
                    ${error.message || 'Unknown error occurred'}
                </div>
                <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 1rem;">
                    Please ensure camera permissions are granted and try refreshing the page.
                </div>
            `;
        }
    }

    // Start FPS update loop
    startFPSLoop() {
        setInterval(() => {
            if (this.trackingManager && this.controlsManager) {
                const fps = this.trackingManager.getFPS();
                this.controlsManager.updateFPS(fps);
            }
        }, 500); // Update every 500ms
    }
}

// Initialize app when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new GestureVisionApp();
        app.init();
    });
} else {
    app = new GestureVisionApp();
    app.init();
}

// Export for debugging
window.app = app;
