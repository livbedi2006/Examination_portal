// Proctoring Module
class ProctoringMonitor {
    constructor(examId) {
        this.examId = examId;
        this.videoStream = null;
        this.canvas = null;
        this.context = null;
        this.violations = [];
        this.monitoring = false;
        this.websocket = null;
    }

    async start() {
        try {
            this.monitoring = true;
            
            // Request camera access
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true,
            });
            
            const videoElement = document.getElementById('proctoring-video');
            videoElement.srcObject = this.videoStream;
            
            // Setup canvas for frame capture
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
            this.canvas.width = 640;
            this.canvas.height = 480;
            
            // Start monitoring
            this.monitorFrames();
            
            // Connect WebSocket for real-time monitoring
            this.connectWebSocket();
            
            showNotification('Proctoring started', 'success');
        } catch (error) {
            showNotification(`Camera access denied: ${error.message}`, 'error');
            this.monitoring = false;
        }
    }

    stop() {
        this.monitoring = false;
        
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.websocket) {
            this.websocket.close();
        }
    }

    monitorFrames() {
        if (!this.monitoring) return;
        
        const video = document.getElementById('proctoring-video');
        
        // Capture frame
        this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Check for violations (placeholder - integrate actual detection)
        this.checkForViolations();
        
        // Continue monitoring
        requestAnimationFrame(() => this.monitorFrames());
    }

    async checkForViolations() {
        // Placeholder for violation detection logic
        // In production, integrate with your proctoring system
        
        // Example: Check if face is visible
        // Example: Check for multiple people
        // Example: Check for prohibited objects
        // Example: Check audio levels
    }

    connectWebSocket() {
        try {
            const wsUrl = api.getWebSocketURL(this.examId);
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('WebSocket connected');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
            this.websocket.onclose = () => {
                console.log('WebSocket disconnected');
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }

    handleServerMessage(data) {
        if (data.violations_count > this.violations.length) {
            this.updateViolationsList();
        }
    }

    async logViolation(violationType, severity, description) {
        try {
            await api.logProctoringViolation(
                this.examId,
                violationType,
                severity,
                description
            );
            
            this.violations.push({
                type: violationType,
                severity,
                description,
                timestamp: new Date(),
            });
            
            this.updateViolationsList();
        } catch (error) {
            console.error('Failed to log violation:', error);
        }
    }

    updateViolationsList() {
        const container = document.getElementById('violations-list');
        container.innerHTML = '';
        
        this.violations.slice(-5).forEach(violation => {
            const item = document.createElement('div');
            item.className = 'violation-item';
            item.innerHTML = `
                <div class="violation-type">${violation.type}</div>
                <div class="violation-time">${violation.timestamp.toLocaleTimeString()}</div>
            `;
            container.appendChild(item);
        });
        
        // Update violation count
        document.getElementById('violation-count').textContent = this.violations.length;
    }

    async updateStatus() {
        try {
            const status = await api.getProctoringStatus(this.examId);
            document.getElementById('face-status').textContent = status.face_detected ? '✓' : '✗';
            document.getElementById('attention-level').textContent = `${(status.attention_level * 100).toFixed(0)}%`;
        } catch (error) {
            console.error('Failed to update proctoring status:', error);
        }
    }
}

// Global proctoring monitor instance
let proctoringMonitor = null;

// Initialize proctoring when exam starts
function initializeProctoring(examId) {
    proctoringMonitor = new ProctoringMonitor(examId);
    proctoringMonitor.start();
    
    // Update status periodically
    setInterval(() => {
        if (proctoringMonitor) {
            proctoringMonitor.updateStatus();
        }
    }, 5000);
}

// Stop proctoring when exam ends
function stopProctoring() {
    if (proctoringMonitor) {
        proctoringMonitor.stop();
        proctoringMonitor = null;
    }
}

// Test violation logging
async function testViolation() {
    if (proctoringMonitor) {
        await proctoringMonitor.logViolation(
            'test_violation',
            'low',
            'This is a test violation'
        );
    }
}
