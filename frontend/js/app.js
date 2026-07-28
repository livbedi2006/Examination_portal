// Global State
const appState = {
    user: null,
    currentExam: null,
    currentQuestion: null,
    selectedAnswer: null,
    examStartTime: null,
    timerInterval: null,
    jobRole: null,
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    
    // Load frontend configuration
    try {
        const configResponse = await fetch(`${api.baseURL}/config/frontend`);
        if (!configResponse.ok) throw new Error('Backend configuration is unavailable');
        const config = await configResponse.json();
        localStorage.setItem('GOOGLE_CLIENT_ID', config.google_client_id);
        // Update API base URL if needed
        if (config.backend_url) {
            api.baseURL = config.backend_url;
        }
    } catch (error) {
        console.warn('Could not load config from backend:', error);
        // Will use defaults from localStorage or static config
    }
    
    if (token && userId) {
        try {
            showLoading(true);
            api.setToken(token);
            const user = await api.getCurrentUser();
            appState.user = user;
            localStorage.setItem('user_id', user.id);
            showDashboard();
        } catch (error) {
            console.error('Failed to load user:', error);
            showAuthModal();
        } finally {
            showLoading(false);
        }
    } else {
        showAuthModal();
    }
}

// ============ AUTHENTICATION ============

function handleCredentialResponse(response) {
    // This is called by Google Sign-in button
    const token = response.credential;
    authenticateWithGoogle(token);
}

async function authenticateWithGoogle(token) {
    try {
        showLoading(true);
        const response = await api.googleSignIn(token);
        
        if (!response.access_token) {
            throw new Error('No access token received');
        }
        
        api.setToken(response.access_token);
        
        // Store user ID
        if (response.user_id) {
            localStorage.setItem('user_id', response.user_id);
        }
        
        // Get user info
        try {
            const user = await api.getCurrentUser();
            appState.user = user;
            localStorage.setItem('user_id', user.id);
        } catch (e) {
            console.warn('Could not fetch user info:', e);
        }
        
        showNotification('Successfully signed in!', 'success');
        showDashboard();
    } catch (error) {
        console.error('Google auth error:', error);
        showNotification(`Sign in failed: ${error.message}`, 'error');
        localStorage.removeItem('access_token');
    } finally {
        showLoading(false);
    }
}

async function handleManualSignin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // TODO: Implement manual signin with backend
    showNotification('Please use Google Sign-in', 'info');
}

async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const jobRole = document.getElementById('job-role').value;
    
    if (!name || !email || !jobRole) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const response = await api.registerUser({
            name,
            email,
            job_role: jobRole,
        });
        
        // Handle token response from registration
        if (response.access_token) {
            api.setToken(response.access_token);
            localStorage.setItem('access_token', response.access_token);
            
            if (response.user_id) {
                localStorage.setItem('user_id', response.user_id);
            }
            
            // Try to fetch user info
            try {
                const user = await api.getCurrentUser();
                appState.user = user;
                localStorage.setItem('user_id', user.id);
            } catch (e) {
                console.warn('Could not fetch user info:', e);
            }
            
            showNotification('Account created successfully!', 'success');
            toggleSignup();
            showDashboard();
        } else {
            throw new Error('No auth token received');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(`Sign up failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function handleLogout() {
    localStorage.clear();
    location.reload();
}

// ============ MODAL MANAGEMENT ============

function showAuthModal() {
    hideAllViews();
    document.getElementById('auth-modal').style.display = 'flex';
    initializeGoogleSignIn();
}

function showDashboard() {
    hideAllViews();
    document.getElementById('dashboard').style.display = 'flex';
    loadDashboard();
}

function showExamInterface() {
    hideAllViews();
    document.getElementById('exam-interface').style.display = 'flex';
}

function showResultsPage() {
    hideAllViews();
    document.getElementById('results-page').style.display = 'flex';
}

function hideAllViews() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('signup-modal').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('exam-interface').style.display = 'none';
    document.getElementById('results-page').style.display = 'none';
}

function toggleSignup() {
    document.getElementById('auth-modal').style.display = 
        document.getElementById('auth-modal').style.display === 'none' ? 'flex' : 'none';
    document.getElementById('signup-modal').style.display = 
        document.getElementById('signup-modal').style.display === 'none' ? 'flex' : 'none';
}

function initializeGoogleSignIn() {
    // Ensure Google API is loaded
    if (typeof window.google === 'undefined' || !window.google.accounts) {
        console.warn('Google Sign-in API not loaded yet');
        // Schedule retry after a short delay
        setTimeout(initializeGoogleSignIn, 500);
        return;
    }
    
    const container = document.getElementById('google-signin-container');
    if (!container) {
        console.error('Google sign-in container not found');
        return;
    }
    
    try {
        // Get Google Client ID from localStorage (loaded from backend config)
        let googleClientId = localStorage.getItem('GOOGLE_CLIENT_ID');
        
        // Validate Client ID
        if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID' || googleClientId.includes('YOUR_GOOGLE')) {
            container.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f5c6cb;">
                    <strong>⚠️ Google OAuth Not Configured</strong>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">Please follow the <strong>GOOGLE_OAUTH_SETUP.md</strong> guide to set up Google OAuth with the backend.</p>
                    <p style="margin: 5px 0 0 0; font-size: 13px;">After setup, the Google Sign-in button will appear here.</p>
                </div>
            `;
            return;
        }
        
        // Initialize Google Sign-in with callback
        google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false,
        });
        
        // Render the button
        google.accounts.id.renderButton(
            container,
            {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'signin_with'
            }
        );
    } catch (error) {
        console.error('Error initializing Google Sign-in:', error);
        container.innerHTML = `
            <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; border: 1px solid #f5c6cb;">
                <strong>Error Initializing Google Sign-in</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">${error.message}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px;">Check the browser console for more details.</p>
            </div>
        `;
    }
}

// ============ DASHBOARD ============

async function loadDashboard() {
    try {
        showLoading(true);
        
        // Update user name
        if (appState.user) {
            document.getElementById('user-name').textContent = appState.user.name;
        }
        
        // Load job roles
        const jobRoles = await api.getJobRoles();
        renderJobRoles(jobRoles);
        
        // Load exam history
        const history = await api.getExamHistory();
        renderExamHistory(history);
    } catch (error) {
        showNotification(`Failed to load dashboard: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function renderJobRoles(jobRoles) {
    const container = document.getElementById('job-roles-container');
    container.innerHTML = '';
    
    jobRoles.forEach(role => {
        const card = document.createElement('div');
        card.className = 'job-role-card';
        card.innerHTML = `<h4>${role}</h4>`;
        card.onclick = () => selectJobRole(role, card);
        container.appendChild(card);
    });
}

async function selectJobRole(role, selectedCard) {
    appState.jobRole = role;
    
    try {
        showLoading(true);
        const data = await api.getSubjectsByJobRole(role);
        
        // Update selected state
        document.querySelectorAll('.job-role-card').forEach(card => {
            card.classList.remove('selected');
        });
        selectedCard?.classList.add('selected');
        
        // Render subjects
        renderSubjects(data.subjects);
        document.getElementById('subjects-section').style.display = 'block';
    } catch (error) {
        showNotification(`Failed to load subjects: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function renderSubjects(subjects) {
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';
    
    subjects.forEach(subject => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `
            <h4>${subject.name}</h4>
            <p>${subject.description}</p>
            <div class="subject-details">
                <span>${subject.questions_count} Questions</span>
                <span>${subject.estimated_duration} mins</span>
            </div>
        `;
        card.onclick = () => startExam(subject.subject_id);
        container.appendChild(card);
    });
}

function renderExamHistory(history) {
    const container = document.getElementById('results-container');
    container.innerHTML = '';
    
    if (history.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center;">No exams taken yet</p>';
        return;
    }
    
    history.slice(0, 5).forEach(exam => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <div class="result-item-info">
                <h4>${exam.subject}</h4>
                <p>${new Date(exam.completed_at).toLocaleDateString()}</p>
            </div>
            <div class="result-item-score">${exam.score.toFixed(1)}%</div>
        `;
        container.appendChild(item);
    });
}

// ============ EXAM FLOW ============

async function startExam(subjectId) {
    try {
        showLoading(true);
        
        const exam = await api.startExam(subjectId, appState.jobRole);
        appState.currentExam = exam;
        appState.examStartTime = new Date();
        
        // Start proctoring
        await api.startProctoring(exam.id);
        
        showExamInterface();
        loadExamQuestion();
        startTimer();
    } catch (error) {
        showNotification(`Failed to start exam: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function loadExamQuestion() {
    const exam = appState.currentExam;
    
    if (!exam.questions || exam.questions.length === 0) {
        showNotification('No questions available', 'error');
        return;
    }
    
    appState.currentQuestion = exam.questions[exam.questions.length - 1];
    
    // Update header
    document.getElementById('subject-title').textContent = exam.subject;
    document.getElementById('current-question').textContent = exam.total_questions + 1;
    document.getElementById('total-questions').textContent = 50; // or from exam data
    
    // Update question content
    document.getElementById('question-text').textContent = appState.currentQuestion.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    const options = ['option_a', 'option_b', 'option_c', 'option_d'];
    const labels = ['A', 'B', 'C', 'D'];
    
    options.forEach((key, index) => {
        const option = document.createElement('div');
        option.className = 'option';
        option.innerHTML = `
            <input type="radio" id="option-${index}" name="answer" value="${labels[index].toLowerCase()}" />
            <label for="option-${index}">${appState.currentQuestion[key]}</label>
        `;
        option.onclick = () => selectOption(index);
        optionsContainer.appendChild(option);
    });
    
    // Update progress
    updateProgress();
}

function selectOption(index) {
    appState.selectedAnswer = String.fromCharCode(97 + index); // 'a', 'b', 'c', 'd'
    document.querySelectorAll('.option').forEach((el, i) => {
        el.classList.toggle('selected', i === index);
    });
}

async function submitAnswer() {
    if (!appState.selectedAnswer) {
        showNotification('Please select an answer', 'info');
        return;
    }
    
    try {
        showLoading(true);
        
        const timeTaken = Math.floor((new Date() - appState.examStartTime) / 1000);
        const response = await api.submitAnswer(
            appState.currentExam.id,
            appState.currentQuestion.question_id,
            appState.selectedAnswer,
            timeTaken
        );
        
        appState.currentExam.total_questions = response.score_update.total;
        appState.currentExam.correct_answers = response.score_update.correct;
        
        if (response.next_question) {
            appState.currentExam.questions.push(response.next_question);
            appState.selectedAnswer = null;
            loadExamQuestion();
        } else {
            completeExam();
        }
    } catch (error) {
        showNotification(`Failed to submit answer: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function completeExam() {
    try {
        showLoading(true);
        
        const result = await api.completeExam(appState.currentExam.id);
        clearInterval(appState.timerInterval);
        
        // Display results
        displayResults(result);
        showResultsPage();
    } catch (error) {
        showNotification(`Failed to complete exam: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function displayResults(result) {
    const score = result.score;
    const status = score >= 70 ? 'Excellent!' : score >= 50 ? 'Good!' : 'Keep practicing!';
    
    document.getElementById('final-score').textContent = `${score.toFixed(1)}%`;
    document.getElementById('score-status').textContent = status;
    document.getElementById('result-total').textContent = result.total_questions;
    document.getElementById('result-correct').textContent = result.correct_answers;
    document.getElementById('result-accuracy').textContent = `${score.toFixed(1)}%`;
    document.getElementById('result-difficulty').textContent = appState.currentExam.current_difficulty;
}

function previousQuestion() {
    showNotification('Feature not yet implemented', 'info');
}

async function endExam() {
    if (confirm('Are you sure you want to end the exam? This cannot be undone.')) {
        await completeExam();
    }
}

function goToDashboard() {
    appState.currentExam = null;
    appState.currentQuestion = null;
    showDashboard();
}

function downloadCertificate() {
    showNotification('Certificate download feature coming soon!', 'info');
}

// ============ TIMER ============

function startTimer() {
    let seconds = 0;
    appState.timerInterval = setInterval(() => {
        seconds++;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        document.getElementById('timer').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

// ============ PROGRESS ============

function updateProgress() {
    const exam = appState.currentExam;
    const percentage = exam.total_questions > 0 ? (exam.correct_answers / exam.total_questions) * 100 : 0;
    
    document.getElementById('correct-count').textContent = exam.correct_answers;
    document.getElementById('attempted-count').textContent = exam.total_questions;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}
