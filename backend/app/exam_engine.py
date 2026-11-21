import pandas as pd
import joblib
import numpy as np
from scipy.sparse import hstack
from typing import Optional, List, Dict, Any
import os

class ExamEngine:
    """
    Integrates with existing AI models to provide adaptive questioning
    """
    
    def __init__(self):
        self.questions_df = None
        self.difficulty_model = None
        self.vectorizer = None
        self.load_models()
    
    @staticmethod
    def _find_file(rel_path: str) -> Optional[str]:
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "..", rel_path),
            os.path.join(os.path.dirname(__file__), "..", rel_path),
            os.path.join(os.getcwd(), rel_path),
            rel_path,
        ]
        for p in candidates:
            normalized = os.path.normpath(os.path.abspath(p))
            if os.path.exists(normalized):
                return normalized
        return None

    def load_models(self):
        """Load pre-trained models and question bank"""
        try:
            # Load question bank
            questions_path = self._find_file("data/clean_questions.csv") or self._find_file("../data/clean_questions.csv")
            if questions_path and os.path.exists(questions_path):
                self.questions_df = pd.read_csv(questions_path)
                print(f"Loaded {len(self.questions_df)} questions from {questions_path}")
            else:
                print("Warning: Questions file clean_questions.csv not found")
                self.questions_df = pd.DataFrame()
            
            # Load difficulty model
            model_path = self._find_file("models/difficulty_model.pkl") or self._find_file("../models/difficulty_model.pkl")
            if model_path and os.path.exists(model_path):
                self.difficulty_model = joblib.load(model_path)
                print(f"Loaded difficulty model from {model_path}")
            else:
                print("Warning: Difficulty model difficulty_model.pkl not found")
            
            # Load vectorizer
            vec_path = self._find_file("models/tfidf_vectorizer.pkl") or self._find_file("../models/tfidf_vectorizer.pkl")
            if vec_path and os.path.exists(vec_path):
                self.vectorizer = joblib.load(vec_path)
                print(f"Loaded TF-IDF vectorizer from {vec_path}")
            else:
                print("Warning: Vectorizer tfidf_vectorizer.pkl not found")
        
        except Exception as e:
            print(f"Error loading models: {e}")

    def get_first_question(self, subject: str) -> Optional[Dict[str, Any]]:
        """Get the first question for a subject (usually at Intermediate difficulty)"""
        if self.questions_df is None or len(self.questions_df) == 0:
            return self._generate_mock_question()
        
        # Filter questions by subject
        subject_mask = (
            self.questions_df.get('domain', '').str.contains(subject, case=False, na=False) |
            self.questions_df.get('topic', '').str.contains(subject, case=False, na=False)
        )
        subject_questions = self.questions_df[subject_mask]
        
        if len(subject_questions) == 0:
            # Fallback to any question if subject-specific not found
            subject_questions = self.questions_df
        
        # Get an intermediate difficulty question
        intermediate = subject_questions[
            subject_questions.get('difficulty', '') == 'Intermediate'
        ]
        
        if len(intermediate) > 0:
            question = intermediate.iloc[0]
        else:
            question = subject_questions.iloc[0]
        
        return self._format_question(question)
    
    def get_next_question(self, subject: str, difficulty: str) -> Optional[Dict[str, Any]]:
        """Get next question based on difficulty level"""
        if self.questions_df is None or len(self.questions_df) == 0:
            return self._generate_mock_question()
        
        # Filter by subject and difficulty
        subject_mask = (
            self.questions_df.get('domain', '').str.contains(subject, case=False, na=False) |
            self.questions_df.get('topic', '').str.contains(subject, case=False, na=False)
        )
        filtered = self.questions_df[
            subject_mask & (self.questions_df.get('difficulty', '') == difficulty)
        ]
        
        if len(filtered) == 0:
            # Fallback to any difficulty level
            filtered = self.questions_df[subject_mask]
        
        if len(filtered) == 0:
            return self._generate_mock_question()
        
        # Random selection to avoid repetition
        import random
        question = filtered.sample(n=1).iloc[0]
        
        return self._format_question(question)
    
    def update_difficulty(self, was_correct: bool, current_difficulty: str) -> str:
        """
        Adaptive difficulty adjustment algorithm
        """
        difficulty_levels = ["Easy", "Intermediate", "Hard", "Expert"]
        
        try:
            current_index = difficulty_levels.index(current_difficulty)
        except ValueError:
            current_index = 1  # Default to Intermediate
        
        if was_correct:
            # Move to harder difficulty
            new_index = min(current_index + 1, len(difficulty_levels) - 1)
        else:
            # Move to easier difficulty
            new_index = max(current_index - 1, 0)
        
        return difficulty_levels[new_index]
    
    def predict_question_difficulty(self, question_text: str) -> str:
        """
        Use the trained model to predict question difficulty
        """
        if self.vectorizer is None or self.difficulty_model is None:
            return "Intermediate"
        
        try:
            # Extract features
            text_features = self.vectorizer.transform([question_text])
            word_count = len(question_text.split())
            has_code = 1 if "```" in question_text else 0
            extra_features = np.array([[word_count, has_code]])
            features = hstack([text_features, extra_features])
            
            # Predict
            prediction = self.difficulty_model.predict(features)
            return prediction[0]
        except Exception as e:
            print(f"Error predicting difficulty: {e}")
            return "Intermediate"
    
    def _format_question(self, question_row: pd.Series) -> Dict[str, Any]:
        """Format a question row from DataFrame to API response format"""
        return {
            "question_id": str(question_row.get('question_id', hash(question_row.get('question', '')))),
            "question": question_row.get('question', ''),
            "option_a": question_row.get('option_a', question_row.get('a', '')),
            "option_b": question_row.get('option_b', question_row.get('b', '')),
            "option_c": question_row.get('option_c', question_row.get('c', '')),
            "option_d": question_row.get('option_d', question_row.get('d', '')),
            "band": question_row.get('difficulty', question_row.get('band', 'Intermediate')),
            "correct_answer": question_row.get('correct_answer', 'a')
        }
    
    def _generate_mock_question(self) -> Dict[str, Any]:
        """Generate a mock question for testing"""
        return {
            "question_id": "mock_001",
            "question": "What is the time complexity of binary search?",
            "option_a": "O(n)",
            "option_b": "O(log n)",
            "option_c": "O(n log n)",
            "option_d": "O(1)",
            "band": "Intermediate",
            "correct_answer": "b"
        }
