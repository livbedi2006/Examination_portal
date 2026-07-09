// Exam-specific utilities and helpers

// Mock exam data for testing
const MOCK_QUESTIONS = [
    {
        question_id: "q1",
        question: "What is the time complexity of binary search?",
        option_a: "O(n)",
        option_b: "O(log n)",
        option_c: "O(n log n)",
        option_d: "O(1)",
        band: "Intermediate",
        correct_answer: "b"
    },
    {
        question_id: "q2",
        question: "Which data structure is LIFO?",
        option_a: "Queue",
        option_b: "Stack",
        option_c: "Deque",
        option_d: "Linked List",
        band: "Easy",
        correct_answer: "b"
    },
    {
        question_id: "q3",
        question: "What is the space complexity of merge sort?",
        option_a: "O(1)",
        option_b: "O(log n)",
        option_c: "O(n)",
        option_d: "O(n^2)",
        band: "Hard",
        correct_answer: "c"
    },
];

// Initialize exam environment
function initializeExamEnvironment() {
    // Disable certain keyboard shortcuts during exam
    document.addEventListener('keydown', (e) => {
        // Prevent Ctrl+C, Ctrl+V, etc.
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    });
    
    // Warn on page unload
    window.addEventListener('beforeunload', (e) => {
        if (appState.currentExam && appState.currentExam.status === 'in_progress') {
            e.preventDefault();
            e.returnValue = '';
        }
    });
    
    // Monitor for tab switch (exam violations)
    document.addEventListener('visibilitychange', () => {
        if (appState.currentExam && appState.currentExam.status === 'in_progress') {
            if (document.hidden) {
                handleTabSwitchViolation();
            }
        }
    });
}

async function handleTabSwitchViolation() {
    if (proctoringMonitor) {
        await proctoringMonitor.logViolation(
            'tab_switch',
            'high',
            'User switched to another tab during exam'
        );
    }
}

// Exam question generation (can be enhanced with API calls)
async function generateAdaptiveQuestions(subject, difficulty, count = 50) {
    // This would call your AI model API to generate questions
    // For now, using mock data
    return MOCK_QUESTIONS;
}

// Calculate exam performance
function calculatePerformance(totalQuestions, correctAnswers) {
    const accuracy = (correctAnswers / totalQuestions) * 100;
    let grade = 'F';
    
    if (accuracy >= 90) grade = 'A';
    else if (accuracy >= 80) grade = 'B';
    else if (accuracy >= 70) grade = 'C';
    else if (accuracy >= 60) grade = 'D';
    
    return { accuracy, grade };
}

// Estimate next difficulty
function estimateNextDifficulty(currentDifficulty, lastAnswerCorrect) {
    const levels = ['Easy', 'Intermediate', 'Hard', 'Expert'];
    const currentIndex = levels.indexOf(currentDifficulty);
    
    if (lastAnswerCorrect) {
        return levels[Math.min(currentIndex + 1, levels.length - 1)];
    } else {
        return levels[Math.max(currentIndex - 1, 0)];
    }
}

// Format time for display
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Export exam result
function exportExamResult(exam) {
    const csv = [
        ['Exam Report'],
        ['Subject', exam.subject],
        ['Date', new Date(exam.completed_at).toLocaleDateString()],
        ['Total Questions', exam.total_questions],
        ['Correct Answers', exam.correct_answers],
        ['Score', `${exam.score.toFixed(2)}%`],
        ['Violations', exam.proctoring_violations || 0],
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-report-${exam.id}.csv`;
    a.click();
}

// Initialize exam when interface is shown
document.addEventListener('DOMContentLoaded', () => {
    initializeExamEnvironment();
});
