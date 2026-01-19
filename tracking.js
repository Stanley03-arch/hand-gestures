// MediaPipe Tracking Module
// Handles hand and pose tracking with visualization

class TrackingManager {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');

        this.hands = null;
        this.pose = null;
        this.camera = null;

        this.handTrackingEnabled = true;
        this.poseTrackingEnabled = true;
        this.gestureRecognitionEnabled = true;

        this.handColor = '#00ffff';
        this.poseColor = '#ff00ff';
        this.minConfidence = 0.5;

        this.gestureRecognizer = new GestureRecognizer();
        this.currentGesture = null;

        this.fpsCounter = new FPSCounter();

        this.onGestureDetected = null;
        this.onHandsDetected = null;
        this.onPoseDetected = null;
    }

    // Initialize MediaPipe Hands
    async initHands() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: this.minConfidence,
            minTrackingConfidence: this.minConfidence
        });

        this.hands.onResults((results) => this.onHandsResults(results));
    }

    // Initialize MediaPipe Pose
    async initPose() {
        this.pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: this.minConfidence,
            minTrackingConfidence: this.minConfidence
        });

        this.pose.onResults((results) => this.onPoseResults(results));
    }

    // Initialize camera
    async initCamera() {
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                if (this.handTrackingEnabled && this.hands) {
                    await this.hands.send({ image: this.video });
                }
                if (this.poseTrackingEnabled && this.pose) {
                    await this.pose.send({ image: this.video });
                }
            },
            width: 1280,
            height: 720
        });
    }

    // Start tracking
    async start() {
        await this.initHands();
        await this.initPose();
        await this.initCamera();
        await this.camera.start();
    }

    // Handle hands results
    onHandsResults(results) {
        if (!this.handTrackingEnabled) return;

        this.fpsCounter.tick();

        // Resize canvas to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Clear canvas
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw hand landmarks
        if (results.multiHandLandmarks) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];

                // Draw connections
                this.drawConnectors(landmarks, HAND_CONNECTIONS, this.handColor, 2);

                // Draw landmarks
                this.drawLandmarks(landmarks, this.handColor, 4);

                // Gesture recognition
                if (this.gestureRecognitionEnabled && i === 0) {
                    const gesture = this.gestureRecognizer.recognize(landmarks);
                    if (gesture && this.onGestureDetected) {
                        this.onGestureDetected(gesture);
                    }
                }
            }

            if (this.onHandsDetected) {
                this.onHandsDetected(results.multiHandLandmarks);
            }
        } else {
            // No hands detected
            if (this.onGestureDetected) {
                this.onGestureDetected(null);
            }
        }

        this.ctx.restore();
    }

    // Handle pose results
    onPoseResults(results) {
        if (!this.poseTrackingEnabled) return;

        // Resize canvas to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        this.ctx.save();

        // Draw pose landmarks
        if (results.poseLandmarks) {
            // Draw connections
            this.drawConnectors(results.poseLandmarks, POSE_CONNECTIONS, this.poseColor, 2);

            // Draw landmarks
            this.drawLandmarks(results.poseLandmarks, this.poseColor, 3);

            if (this.onPoseDetected) {
                this.onPoseDetected(results.poseLandmarks);
            }
        }

        this.ctx.restore();
    }

    // Draw landmark connections
    drawConnectors(landmarks, connections, color, lineWidth) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';

        for (const connection of connections) {
            const start = landmarks[connection[0]];
            const end = landmarks[connection[1]];

            if (start && end) {
                this.ctx.beginPath();
                this.ctx.moveTo(start.x * this.canvas.width, start.y * this.canvas.height);
                this.ctx.lineTo(end.x * this.canvas.width, end.y * this.canvas.height);
                this.ctx.stroke();
            }
        }
    }

    // Draw landmarks
    drawLandmarks(landmarks, color, radius) {
        this.ctx.fillStyle = color;

        for (const landmark of landmarks) {
            if (landmark) {
                const x = landmark.x * this.canvas.width;
                const y = landmark.y * this.canvas.height;

                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
                this.ctx.fill();

                // Add glow effect
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        }
    }

    // Update settings
    updateSettings(settings) {
        if (settings.handColor !== undefined) {
            this.handColor = settings.handColor;
        }
        if (settings.poseColor !== undefined) {
            this.poseColor = settings.poseColor;
        }
        if (settings.minConfidence !== undefined) {
            this.minConfidence = settings.minConfidence;
            if (this.hands) {
                this.hands.setOptions({
                    minDetectionConfidence: this.minConfidence,
                    minTrackingConfidence: this.minConfidence
                });
            }
            if (this.pose) {
                this.pose.setOptions({
                    minDetectionConfidence: this.minConfidence,
                    minTrackingConfidence: this.minConfidence
                });
            }
        }
    }

    // Toggle tracking
    toggleHandTracking(enabled) {
        this.handTrackingEnabled = enabled;
        if (!enabled) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    togglePoseTracking(enabled) {
        this.poseTrackingEnabled = enabled;
        if (!enabled) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    toggleGestureRecognition(enabled) {
        this.gestureRecognitionEnabled = enabled;
        if (!enabled && this.onGestureDetected) {
            this.onGestureDetected(null);
        }
    }

    // Get FPS
    getFPS() {
        return this.fpsCounter.getFPS();
    }
}

// FPS Counter
class FPSCounter {
    constructor() {
        this.frames = [];
        this.lastTime = performance.now();
    }

    tick() {
        const now = performance.now();
        this.frames.push(now);

        // Keep only last second of frames
        while (this.frames.length > 0 && this.frames[0] < now - 1000) {
            this.frames.shift();
        }
    }

    getFPS() {
        return this.frames.length;
    }
}

// Hand connections (MediaPipe format)
const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],           // Index
    [0, 9], [9, 10], [10, 11], [11, 12],      // Middle
    [0, 13], [13, 14], [14, 15], [15, 16],    // Ring
    [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
    [5, 9], [9, 13], [13, 17]                 // Palm
];

// Pose connections (MediaPipe format)
const POSE_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 7],           // Face
    [0, 4], [4, 5], [5, 6], [6, 8],           // Face
    [9, 10],                                   // Mouth
    [11, 12],                                  // Shoulders
    [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], // Left arm
    [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], // Right arm
    [11, 23], [12, 24], [23, 24],             // Torso
    [23, 25], [25, 27], [27, 29], [27, 31], [29, 31], // Left leg
    [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]  // Right leg
];

// Export for use in other modules
window.TrackingManager = TrackingManager;
