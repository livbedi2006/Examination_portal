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
    
    def load_models(self):
        """Load pre-trained models and question bank"""
        try:
            # Load question bank
            questions_path = "../data/clean_questions.csv"
            if os.path.exists(questions_path):
                self.questions_df = pd.read_csv(questions_path)
                print(f"Loaded {len(self.questions_df)} questions")
            else:
                print(f"Warning: Questions file not found at {questions_path}")
                self.questions_df = pd.DataFrame()
            
            # Load difficulty model
            model_path = "../models/difficulty_model.pkl"
            if os.path.exists(model_path):
                self.difficulty_model = joblib.load(model_path)
                print("Loaded difficulty model")
            else:
                print(f"Warning: Difficulty model not found at {model_path}")
            
            # Load vectorizer
            vec_path = "../models/tfidf_vectorizer.pkl"
            if os.path.exists(vec_path):
                self.vectorizer = joblib.load(vec_path)
                print("Loaded TF-IDF vectorizer")
            else:
                print(f"Warning: Vectorizer not found at {vec_path}")
        
        except Exception as e:
            print(f"Error loading models: {e}")
            return None
        
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
