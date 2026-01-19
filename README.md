# Hand Gesture Recognition

Real-time hand gesture and pose tracking application using MediaPipe computer vision. Detects hand gestures, tracks body pose, and provides an interactive visualization interface.

## Features

✨ **Real-time Tracking**
- Hand landmark detection (21 points per hand, up to 2 hands)
- Full body pose tracking (33 landmarks)
- 30+ FPS performance on modern devices

🤖 **Gesture Recognition**
- Peace Sign (✌️)
- Thumbs Up (👍)
- Pointing (👉)
- Fist (✊)
- Open Palm (🖐️)
- Shaka (🤙)

🎨 **Premium UI**
- Dark theme with glassmorphism effects
- Customizable landmark colors
- Real-time FPS counter
- Text overlay system
- Screenshot capture

## Quick Start

### Local Development

1. **Clone or download** this repository
2. **Open** `index.html` in a modern web browser
3. **Allow** camera permissions when prompted
4. **Start** making gestures!

> **Note**: The application works entirely in the browser with no build step required. All dependencies are loaded via CDN.

### Browser Requirements

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14.1+
- Must support WebRTC and camera access

## Deployment (Free Hosting)

### Option 1: Netlify Drop (Recommended)

1. Visit [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the entire project folder
3. Your app will be live instantly with HTTPS!

### Option 2: GitHub Pages

1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select main branch as source
5. Your app will be available at `https://yourusername.github.io/repo-name`

### Option 3: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts
4. Your app will be deployed!

## Usage Guide

### Controls

**Tracking Options**
- Toggle hand tracking on/off
- Toggle pose tracking on/off
- Toggle gesture recognition on/off

**Visual Settings**
- Customize hand landmark color
- Customize pose landmark color
- Adjust minimum confidence threshold

**Actions**
- 📸 Screenshot: Capture current frame with overlays
- 📝 Toggle Text: Show/hide editable text overlay
- 🔄 Reset: Reset all settings to defaults

### Gestures

Make these gestures in front of your camera:

- **Peace Sign**: Extend index and middle fingers
- **Thumbs Up**: Extend thumb with other fingers closed
- **Pointing**: Extend index finger only
- **Fist**: Close all fingers
- **Open Palm**: Extend all fingers
- **Shaka**: Extend thumb and pinky

### Tips for Best Results

1. **Lighting**: Ensure good, even lighting on your hands and body
2. **Background**: Plain backgrounds work best
3. **Distance**: Position yourself 2-4 feet from camera
4. **Gestures**: Make clear, distinct gestures
5. **Performance**: Close other tabs for best FPS

## Technical Stack

- **Computer Vision**: MediaPipe Hands & Pose
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Libraries**: MediaPipe (via CDN)
- **No Build Tools**: Works directly in browser

## File Structure

```
hand-gestures/
├── index.html          # Main HTML structure
├── styles.css          # Premium design system
├── app.js             # Main application logic
├── tracking.js        # MediaPipe integration
├── gestures.js        # Gesture recognition engine
├── controls.js        # UI controls manager
└── README.md          # This file
```

## Customization

### Adding New Gestures

Edit `gestures.js` and add a new detection method:

```javascript
detectMyGesture(landmarks) {
    // Your detection logic here
    return { name: 'My Gesture', emoji: '🎉', confidence: 0.9 };
}
```

Then add it to the `recognize()` method's gesture array.

### Changing Colors

Modify CSS variables in `styles.css`:

```css
:root {
    --primary: #00ffff;      /* Cyan */
    --secondary: #ff00ff;    /* Magenta */
    --accent: #7c3aed;       /* Purple */
}
```

## Performance

- **Target FPS**: 30+
- **Latency**: <100ms gesture recognition
- **Memory**: ~150MB typical usage
- **CPU**: Optimized for modern processors

## Troubleshooting

**Camera not working?**
- Check browser permissions
- Ensure HTTPS (required for camera access)
- Try a different browser

**Low FPS?**
- Close other tabs/applications
- Reduce confidence threshold
- Disable pose tracking if only using hands

**Gestures not detected?**
- Ensure good lighting
- Make clear, distinct gestures
- Adjust confidence threshold
- Check that gesture recognition is enabled

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Camera feed is never recorded or transmitted
- Settings stored only in browser localStorage

## License

MIT License - feel free to use and modify!

## Credits

Built with [MediaPipe](https://google.github.io/mediapipe/) by Google

---

**Enjoy tracking! 👋**
