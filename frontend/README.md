# Exam System Frontend

An interactive React/Vanilla JavaScript frontend for the AI-powered exam system with real-time proctoring.

## Features

- **Google Sign-In** - Secure authentication with Google OAuth
- **Interactive Dashboard** - Job role and subject selection
- **Adaptive Exam Interface** - Dynamic question rendering
- **Real-time Proctoring** - Live camera monitoring
- **Progress Tracking** - Score and performance metrics
- **Results Analysis** - Detailed performance reports
- **Responsive Design** - Works on desktop, tablet, mobile

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (no build required)
- Responsive CSS Grid/Flexbox
- Google OAuth 2.0
- WebSockets for real-time updates
- Fetch API for HTTP communication

## Installation

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API running on `http://localhost:8000`

### Setup

No build process required! Just serve the files:

**Option 1: Python Built-in Server**
```bash
cd frontend
python -m http.server 8080
# Visit http://localhost:8080
```

**Option 2: Node.js http-server**
```bash
cd frontend
npx http-server
# Visit http://localhost:8080
```

**Option 3: Nginx/Apache**
```bash
# Point DocumentRoot to /path/to/frontend
```

## Configuration

Edit `js/api.js` to configure:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### Google OAuth Setup

1. Get Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `index.html`:
```html
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
```

## File Structure

```
frontend/
├── index.html           # Main HTML structure
├── css/
│   └── styles.css      # All styling (responsive design)
├── js/
│   ├── api.js          # API client and HTTP handling
│   ├── app.js          # Main app logic and flow
│   ├── exam.js         # Exam utilities and helpers
│   └── proctoring.js   # Proctoring monitor
└── README.md           # This file
```

## Usage

### Authentication Flow
1. User lands on page → Shows Google Sign-in
2. User clicks Google button → Authenticates with Google
3. Backend creates user account if new
4. Access token stored in localStorage
5. Dashboard loads with user profile

### Exam Flow
1. User selects job role → Loads available subjects
2. User selects subject → Exam starts
3. Proctoring camera activates → Monitors user
4. User answers questions → Adaptive difficulty adjusts
5. User submits exam → Results page shows score
6. User can download report or retake

### Proctoring Features
- Real-time camera monitoring
- Violation logging (tab switch, object detection, etc.)
- Attention level tracking
- Violation history display

## Key JavaScript Objects

### `appState`
Holds global exam state:
- `user` - Current user object
- `currentExam` - Active exam session
- `currentQuestion` - Current question being answered
- `selectedAnswer` - User's selected answer
- `examStartTime` - Exam start timestamp
- `timerInterval` - Active timer reference

### `api` (APIClient)
Manages all HTTP communication:
- Authentication endpoints
- Exam endpoints
- Proctoring endpoints
- WebSocket connections

### `proctoringMonitor` (ProctoringMonitor)
Handles proctoring:
- Camera stream management
- Frame capture and analysis
- WebSocket communication
- Violation logging

## Styling

All styles use CSS custom properties (variables) for easy theming:

```css
--primary: #3b82f6;
--success: #10b981;
--danger: #ef4444;
--bg: #f9fafb;
--surface: #ffffff;
```

Edit these in `css/styles.css` to customize colors.

## API Integration

Frontend expects backend at `http://localhost:8000` with:
- REST API endpoints
- WebSocket support at `/proctoring/ws/`
- CORS enabled for frontend origin

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- ES6 JavaScript support
- Fetch API
- WebSockets
- MediaDevices API (for camera)

## Performance

- No external dependencies (faster loading)
- Lazy loading of components
- Efficient DOM manipulation
- CSS animations for smooth UX
- WebSocket for real-time updates

## Troubleshooting

### Google Sign-in Not Working
- Verify Client ID in index.html
- Check browser console for errors
- Ensure backend is running
- Clear browser cache and cookies

### Camera Not Showing
- Check browser camera permissions
- Ensure HTTPS (required for camera access in production)
- Verify MediaDevices API support

### API Requests Failing
- Verify backend is running on http://localhost:8000
- Check CORS configuration in backend
- Open browser developer console for errors
- Verify network tab for request details

### Connection Issues
- Check network connectivity
- Verify backend health: `http://localhost:8000/health`
- Check firewall settings
- Verify API URLs in js/api.js

## Development Tips

### Debugging
Open browser Developer Tools (F12):
- **Console** - Check for JavaScript errors
- **Network** - Monitor API calls
- **Application** - Check localStorage/sessionStorage
- **Elements** - Inspect DOM

### Testing Authentication
```javascript
// In browser console
localStorage.setItem('access_token', 'test-token');
localStorage.setItem('user_id', 'test-user-id');
location.reload();
```

### Mock API Responses
Edit `js/api.js` to return mock data for testing without backend.

## Security Considerations

- Tokens stored in localStorage (consider sessionStorage for higher security)
- HTTPS required in production
- CSRF protection via CORS
- Input validation on frontend (trust backend validation)
- Camera/audio permissions handled by browser

## Deployment

### Development
```bash
python -m http.server 8080
```

### Production
```bash
# Using Nginx
server {
    listen 80;
    root /path/to/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8000;
    }
}
```

## License

Part of the Student Examination System.

## Support

Check browser console (F12) for detailed error messages and API responses.
