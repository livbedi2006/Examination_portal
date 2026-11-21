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
        localStorage.setItem('GITHUB_CLIENT_ID', config.github_client_id);
        if (config.firebase_config && config.firebase_config.apiKey) {
            window.FIREBASE_CONFIG = config.firebase_config;
            if (typeof initFirebase === 'function') {
                initFirebase();
            }
        }
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
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            handleGitHubCallback(code);
        } else {
            showAuthModal();
        }
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

async function handleGitHubCallback(code) {
    try {
        showLoading(true);
        const response = await api.githubSignIn(code);
        
        if (!response.access_token) {
            throw new Error('No access token received');
        }
        
        api.setToken(response.access_token);
        
        if (response.user_id) {
            localStorage.setItem('user_id', response.user_id);
        }
        
        try {
            const user = await api.getCurrentUser();
            appState.user = user;
            localStorage.setItem('user_id', user.id);
        } catch (e) {
            console.warn('Could not fetch user info:', e);
        }
        
        showNotification('Successfully signed in with GitHub!', 'success');
        showDashboard();
    } catch (error) {
        console.error('GitHub auth error:', error);
        showNotification(`GitHub sign in failed: ${error.message}`, 'error');
        localStorage.removeItem('access_token');
        showAuthModal();
    } finally {
        showLoading(false);
    }
}

function initiateGitHubSignIn() {
    let githubClientId = localStorage.getItem('GITHUB_CLIENT_ID');
    
    // Check if real client ID is not configured
    if (!githubClientId || githubClientId.toLowerCase().includes('your-github')) {
        console.log('GitHub Client ID not configured. Using mock login.');
        // Bypass real OAuth and just use mock code
        handleGitHubCallback("mock-github-code");
        return;
    }
    
    // Redirect to GitHub OAuth
    const redirectUri = window.location.origin + window.location.pathname;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=user:email`;
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
    const fbModal = document.getElementById('firebase-config-modal');
    if (fbModal) fbModal.style.display = 'none';
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
    // Check if Firebase is available and configured
    if (typeof initFirebase === 'function') {
        initFirebase();
    }
}

// ============ FIREBASE GOOGLE AUTH ============

async function signInWithFirebaseGoogle() {
    if (typeof isFirebaseConfigured === 'function' && !isFirebaseConfigured()) {
        showNotification('Please enter your Firebase credentials to enable Google Sign-In', 'info');
        openFirebaseConfigModal();
        return;
    }

    try {
        showLoading(true);
        const auth = initFirebase();
        if (!auth) {
            throw new Error('Firebase could not be initialized. Please check credentials.');
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        const idToken = await user.getIdToken();

        // Send token and user details to backend
        const response = await api.googleSignIn(idToken, {
            email: user.email,
            name: user.displayName,
            picture: user.photoURL,
        });

        if (!response.access_token) {
            throw new Error('No access token received from backend');
        }

        api.setToken(response.access_token);
        if (response.user_id) {
            localStorage.setItem('user_id', response.user_id);
        }

        try {
            const currentUser = await api.getCurrentUser();
            appState.user = currentUser;
            localStorage.setItem('user_id', currentUser.id);
        } catch (e) {
            appState.user = {
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                profile_picture: user.photoURL
            };
        }

        showNotification('Successfully signed in with Google!', 'success');
        showDashboard();
    } catch (error) {
        console.error('Firebase Google Auth error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            showNotification('Google Sign-in was cancelled', 'info');
        } else if (error.code === 'auth/unauthorized-domain') {
            showNotification('Domain not authorized in Firebase Console (Authentication > Settings > Authorized Domains)', 'error');
        } else {
            showNotification(`Sign in failed: ${error.message}`, 'error');
        }
    } finally {
        showLoading(false);
    }
}

function signInWithMockGoogle(e) {
    if (e && e.preventDefault) e.preventDefault();
    authenticateWithGoogle('mock-google-token');
}

function openFirebaseConfigModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    const config = typeof getFirebaseConfig === 'function' ? getFirebaseConfig() : {};
    const apiKeyInput = document.getElementById('fb-api-key');
    const authDomainInput = document.getElementById('fb-auth-domain');
    const projectIdInput = document.getElementById('fb-project-id');
    const appIdInput = document.getElementById('fb-app-id');

    if (apiKeyInput && config.apiKey && !config.apiKey.includes('YOUR_FIREBASE')) {
        apiKeyInput.value = config.apiKey;
    }
    if (authDomainInput && config.authDomain && !config.authDomain.includes('YOUR_FIREBASE')) {
        authDomainInput.value = config.authDomain;
    }
    if (projectIdInput && config.projectId && !config.projectId.includes('YOUR_FIREBASE')) {
        projectIdInput.value = config.projectId;
    }
    if (appIdInput && config.appId && !config.appId.includes('YOUR_FIREBASE')) {
        appIdInput.value = config.appId;
    }

    const modal = document.getElementById('firebase-config-modal');
    if (modal) modal.style.display = 'flex';
}

function closeFirebaseConfigModal() {
    const modal = document.getElementById('firebase-config-modal');
    if (modal) modal.style.display = 'none';
}

function handleSaveFirebaseConfig(e) {
    e.preventDefault();
    const apiKey = document.getElementById('fb-api-key').value.trim();
    const authDomain = document.getElementById('fb-auth-domain').value.trim();
    const projectId = document.getElementById('fb-project-id').value.trim();
    const appId = document.getElementById('fb-app-id').value.trim();

    if (!apiKey || !projectId) {
        showNotification('Please fill in at least API Key and Project ID', 'error');
        return;
    }

    const config = {
        apiKey,
        authDomain: authDomain || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: `${projectId}.appspot.com`,
        messagingSenderId: "",
        appId
    };

    saveFirebaseConfig(config);
    showNotification('Firebase configuration saved!', 'success');
    closeFirebaseConfigModal();
    initFirebase();
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
