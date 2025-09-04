"""
ML-based matching system for PM Internship Scheme
Implements similarity-based matching and fairness-aware allocation
"""

import numpy as np
import pandas as pd
import joblib
import os
import logging
from typing import List, Dict, Tuple, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer, StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import precision_score, recall_score, average_precision_score
from sklearn.linear_model import LogisticRegression
from flask import current_app

from models import db, Student, Internship, Allocation

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
    logger.info("LightGBM is available for advanced modeling")
except ImportError:
    LIGHTGBM_AVAILABLE = False
    logger.info("LightGBM not available, falling back to sklearn LogisticRegression")

class InternshipMatcher:
    """
    ML-based internship matching system with fairness considerations
    """
    
    def __init__(self, model_dir: str = "models_artifacts"):
        self.model_dir = model_dir
        os.makedirs(model_dir, exist_ok=True)
        
        # Feature extractors
        self.skill_vectorizer = None
        self.sector_vectorizer = None  
        self.desc_vectorizer = None
        self.scaler = None
        
        # Models
        self.model = None
        self.model_type = "similarity"  # or "lightgbm"
        
        # Fairness configuration
        self.fairness_boost = 0.05
        self.skill_overlap_threshold = 2
        
        # Cached data for efficiency
        self.students_cache = None
        self.internships_cache = None
        self.student_features = None
        self.internship_features = None
    
    def build_skill_vocab(self, students: List[Dict], internships: List[Dict]) -> List[str]:
        """Build stable vocabulary of all skills"""
        all_skills = set()
        
        # Collect from students
        for student in students:
            all_skills.update(student['skills'])
        
        # Collect from internships
        for internship in internships:
            all_skills.update(internship['required_skills'])
        
        # Return sorted list for stability
        return sorted(list(all_skills))
    
    def build_sector_vocab(self, students: List[Dict], internships: List[Dict]) -> List[str]:
        """Build stable vocabulary of all sectors/interests"""
        all_sectors = set()
        
        # Collect from students
        for student in students:
            all_sectors.update(student['sector_interests'])
        
        # Collect from internships
        for internship in internships:
            all_sectors.add(internship['sector'])
        
        return sorted(list(all_sectors))
    
    def vectorize_profiles(self, students: List[Dict], internships: List[Dict], 
                          fit_transformers: bool = True) -> Tuple[np.ndarray, np.ndarray]:
        """
        Convert student and internship profiles to feature vectors
        
        Returns:
            student_features: (n_students, n_features) array
            internship_features: (n_internships, n_features) array
        """
        
        # Build vocabularies
        skill_vocab = self.build_skill_vocab(students, internships)
        sector_vocab = self.build_sector_vocab(students, internships)
        
        if fit_transformers:
            # Initialize feature extractors
            self.skill_vectorizer = MultiLabelBinarizer()
            self.skill_vectorizer.fit([skill_vocab])  # Fit on complete vocabulary
            
            self.sector_vectorizer = MultiLabelBinarizer()
            self.sector_vectorizer.fit([sector_vocab])
            
            # TF-IDF for internship descriptions
            descriptions = [internship['description'] for internship in internships]
            self.desc_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
            self.desc_vectorizer.fit(descriptions)
            
            self.scaler = StandardScaler()
        
        # Extract student features
        student_skills = [student['skills'] for student in students]
        student_sectors = [student['sector_interests'] for student in students]
        
        student_skill_features = self.skill_vectorizer.transform(student_skills)
        student_sector_features = self.sector_vectorizer.transform(student_sectors)
        
        # Extract internship features
        internship_skills = [internship['required_skills'] for internship in internships]
        internship_sectors = [[internship['sector']] for internship in internships]  # Single sector per internship
        
        internship_skill_features = self.skill_vectorizer.transform(internship_skills)
        internship_sector_features = self.sector_vectorizer.transform(internship_sectors)
        
        # TF-IDF features for internship descriptions
        descriptions = [internship['description'] for internship in internships]
        desc_features = self.desc_vectorizer.transform(descriptions)
        
        # Location matching feature
        student_locations = np.array([[1.0 if student['location_pref'] == internship['location'] or 
                                      student['location_pref'] == 'Remote' else 0.0
                                      for internship in internships] for student in students])
        
        # Combine features for students (skills + sectors + location compatibility)
        student_features_list = []
        for i, student in enumerate(students):
            # Student skills and sectors
            student_feat = np.concatenate([
                student_skill_features[i].toarray().flatten(),
                student_sector_features[i].toarray().flatten(),
            ])
            student_features_list.append(student_feat)
        
        student_features = np.array(student_features_list)
        
        # Combine features for internships (skills + sectors + descriptions)
        internship_features_list = []
        for i, internship in enumerate(internships):
            internship_feat = np.concatenate([
                internship_skill_features[i].toarray().flatten(),
                internship_sector_features[i].toarray().flatten(),
                desc_features[i].toarray().flatten()
            ])
            internship_features_list.append(internship_feat)
        
        internship_features = np.array(internship_features_list)
        
        if fit_transformers:
            # Fit scaler on combined features for normalization
            all_features = np.vstack([student_features, internship_features])
            self.scaler.fit(all_features)
        
        # Scale features
        student_features = self.scaler.transform(student_features)
        internship_features = self.scaler.transform(internship_features)
        
        return student_features, internship_features
    
    def compute_similarity_scores(self, student_features: np.ndarray, 
                                 internship_features: np.ndarray) -> np.ndarray:
        """
        Compute cosine similarity between students and internships
        
        Returns:
            scores: (n_students, n_internships) similarity matrix
        """
        # Compute cosine similarity
        similarity_matrix = cosine_similarity(student_features, internship_features)
        
        # Ensure scores are in [0, 1] range
        similarity_matrix = np.clip((similarity_matrix + 1) / 2, 0, 1)
        
        return similarity_matrix
    
    def create_synthetic_labels(self, students: List[Dict], internships: List[Dict]) -> np.ndarray:
        """
        Create synthetic positive/negative labels for training
        Positive match = skill overlap >= threshold AND sector match
        """
        labels = np.zeros((len(students), len(internships)))
        
        for i, student in enumerate(students):
            student_skills = set(student['skills'])
            student_sectors = set(student['sector_interests'])
            
            for j, internship in enumerate(internships):
                internship_skills = set(internship['required_skills'])
                internship_sector = internship['sector']
                
                # Check skill overlap
                skill_overlap = len(student_skills & internship_skills)
                
                # Check sector match
                sector_match = internship_sector in student_sectors
                
                # Positive label if sufficient skill overlap AND sector match
                if skill_overlap >= self.skill_overlap_threshold and sector_match:
                    labels[i, j] = 1
        
        return labels
    
    def train_model(self, model_type: str = "similarity", students: List[Dict] = None, 
                   internships: List[Dict] = None) -> Dict[str, Any]:
        """
        Train the matching model
        
        Args:
            model_type: "similarity" or "lightgbm"
            students: List of student dictionaries
            internships: List of internship dictionaries
            
        Returns:
            Dictionary with training metrics
        """
        self.model_type = model_type
        
        if students is None or internships is None:
            # Load from database
            students = [s.to_dict() for s in Student.query.all()]
            internships = [i.to_dict() for i in Internship.query.all()]
        
        logger.info(f"Training {model_type} model with {len(students)} students and {len(internships)} internships")
        
        # Vectorize profiles
        student_features, internship_features = self.vectorize_profiles(students, internships, fit_transformers=True)
        
        # Cache data and features
        self.students_cache = students
        self.internships_cache = internships
        self.student_features = student_features
        self.internship_features = internship_features
        
        metrics = {}
        
        if model_type == "similarity":
            # For similarity model, we just prepare the vectorizers
            # The actual similarity computation happens during inference
            logger.info("Similarity-based model prepared (no training required)")
            metrics['model_type'] = 'similarity'
            metrics['message'] = 'Vectorizers prepared for similarity computation'
            
        elif model_type == "lightgbm":
            # Create training data
            labels = self.create_synthetic_labels(students, internships)
            
            # Prepare training data by creating student-internship pairs
            X_train = []
            y_train = []
            
            for i in range(len(students)):
                for j in range(len(internships)):
                    # Combine student and internship features
                    combined_features = np.concatenate([student_features[i], internship_features[j]])
                    X_train.append(combined_features)
                    y_train.append(labels[i, j])
            
            X_train = np.array(X_train)
            y_train = np.array(y_train)
            
            logger.info(f"Training data: {len(X_train)} pairs, {np.sum(y_train)} positive")
            
            # Train model
            if LIGHTGBM_AVAILABLE:
                self.model = lgb.LGBMClassifier(
                    objective='binary',
                    metric='binary_logloss',
                    boosting_type='gbdt',
                    num_leaves=31,
                    learning_rate=0.05,
                    feature_fraction=0.9,
                    bagging_fraction=0.8,
                    bagging_freq=5,
                    verbose=-1,
                    random_state=42
                )
                logger.info("Training LightGBM model")
            else:
                self.model = LogisticRegression(random_state=42, max_iter=1000)
                logger.info("Training LogisticRegression model (LightGBM not available)")
            
            self.model.fit(X_train, y_train)
            
            # Evaluate on training data (simple metrics)
            y_pred = self.model.predict(X_train)
            y_pred_proba = self.model.predict_proba(X_train)[:, 1]
            
            metrics = {
                'model_type': 'lightgbm' if LIGHTGBM_AVAILABLE else 'logistic_regression',
                'training_samples': len(X_train),
                'positive_samples': int(np.sum(y_train)),
                'precision': float(precision_score(y_train, y_pred, zero_division=0)),
                'recall': float(recall_score(y_train, y_pred, zero_division=0)),
                'average_precision': float(average_precision_score(y_train, y_pred_proba))
            }
            
            logger.info(f"Training metrics: {metrics}")
        
        # Save model artifacts
        self.save_artifacts()
        
        return metrics
    
    def predict_scores(self, student_features: np.ndarray, 
                      internship_features: np.ndarray) -> np.ndarray:
        """
        Predict matching scores between students and internships
        
        Returns:
            scores: (n_students, n_internships) score matrix
        """
        if self.model_type == "similarity":
            return self.compute_similarity_scores(student_features, internship_features)
        
        elif self.model_type == "lightgbm" and self.model is not None:
            scores = np.zeros((len(student_features), len(internship_features)))
            
            for i in range(len(student_features)):
                for j in range(len(internship_features)):
                    combined_features = np.concatenate([student_features[i], internship_features[j]])
                    score = self.model.predict_proba([combined_features])[0, 1]
                    scores[i, j] = score
            
            return scores
        
        else:
            logger.warning("No trained model available, falling back to similarity")
            return self.compute_similarity_scores(student_features, internship_features)
    
    def apply_fairness_boost(self, scores: np.ndarray, students: List[Dict]) -> np.ndarray:
        """
        Apply fairness boost to scores for underrepresented students
        """
        boosted_scores = scores.copy()
        
        for i, student in enumerate(students):
            # Apply boost to underrepresented categories
            if (student['category'] in ['SC', 'ST', 'OBC', 'PwD'] or 
                student['aspirational_district']):
                boosted_scores[i, :] += self.fairness_boost
        
        return np.clip(boosted_scores, 0, 1)
    
    def apply_fairness_and_allocate(self, internship_id: int, ranked_candidates: List[Tuple[int, float]], 
                                   quota: Dict[str, int], strategy: str = "quota") -> List[Dict]:
        """
        Apply fairness strategy and allocate internship slots
        
        Args:
            internship_id: ID of the internship
            ranked_candidates: List of (student_id, score) tuples sorted by score
            quota: Reservation quota dict {"SC": x, "ST": y, "OBC": z, "PwD": w}
            strategy: "quota" or "boost"
            
        Returns:
            List of allocation dictionaries
        """
        # Get internship capacity
        internship = Internship.query.get(internship_id)
        if not internship:
            return []
        
        capacity = internship.capacity
        allocations = []
        
        if strategy == "quota":
            # Quota enforcement strategy
            allocated_by_category = {cat: [] for cat in quota.keys()}
            allocated_general = []
            
            # Separate candidates by category
            candidates_by_category = {cat: [] for cat in quota.keys()}
            general_candidates = []
            
            for student_id, score in ranked_candidates:
                student = Student.query.get(student_id)
                if student and student.category in quota:
                    candidates_by_category[student.category].append((student_id, score))
                else:
                    general_candidates.append((student_id, score))
            
            # Fill reserved slots first
            total_reserved = 0
            for category, reserved_slots in quota.items():
                if reserved_slots > 0:
                    category_candidates = candidates_by_category[category]
                    for i in range(min(reserved_slots, len(category_candidates))):
                        student_id, score = category_candidates[i]
                        allocations.append({
                            'student_id': student_id,
                            'quota_category': category,
                            'score': score
                        })
                        total_reserved += 1
            
            # Fill remaining slots with highest scoring candidates
            remaining_capacity = capacity - total_reserved
            all_remaining = []
            
            # Add unreserved candidates from reserved categories
            for category, reserved_slots in quota.items():
                candidates = candidates_by_category[category]
                if len(candidates) > reserved_slots:
                    all_remaining.extend(candidates[reserved_slots:])
            
            # Add general candidates
            all_remaining.extend(general_candidates)
            
            # Sort by score and take top candidates
            all_remaining.sort(key=lambda x: x[1], reverse=True)
            
            for i in range(min(remaining_capacity, len(all_remaining))):
                student_id, score = all_remaining[i]
                allocations.append({
                    'student_id': student_id,
                    'quota_category': None,
                    'score': score
                })
        
        else:  # strategy == "boost"
            # Score boost strategy - just take top candidates (boost already applied to scores)
            for i, (student_id, score) in enumerate(ranked_candidates[:capacity]):
                student = Student.query.get(student_id)
                quota_category = None
                if student and student.category in quota:
                    quota_category = student.category
                
                allocations.append({
                    'student_id': student_id,
                    'quota_category': quota_category,
                    'score': score
                })
        
        return allocations
    
    def get_top_matches_for_student(self, student_id: int, k: int = 10, 
                                   strategy: str = "boost") -> List[Dict]:
        """
        Get top k internship matches for a student
        
        Returns:
            List of match dictionaries with internship info and scores
        """
        # Load data if not cached
        if self.students_cache is None or self.internships_cache is None:
            self._load_cached_data()
        
        # Find student index
        student_idx = None
        for i, student in enumerate(self.students_cache):
            if student['id'] == student_id:
                student_idx = i
                break
        
        if student_idx is None:
            logger.error(f"Student {student_id} not found in cache")
            return []
        
        # Compute scores
        if self.student_features is None or self.internship_features is None:
            logger.error("Features not available, need to train model first")
            return []
        
        scores = self.predict_scores(self.student_features, self.internship_features)
        
        # Apply fairness boost if requested
        if strategy == "boost":
            scores = self.apply_fairness_boost(scores, self.students_cache)
        
        # Get student's scores for all internships
        student_scores = scores[student_idx, :]
        
        # Get top k matches
        top_indices = np.argsort(student_scores)[::-1][:k]
        
        matches = []
        for idx in top_indices:
            internship = self.internships_cache[idx]
            score = student_scores[idx]
            
            # Get quota info for this student
            student = self.students_cache[student_idx]
            quota_info = None
            if student['category'] in internship['reservation_quota']:
                quota_info = student['category']
            
            matches.append({
                'internship_id': internship['id'],
                'title': internship['title'],
                'company_name': internship['company_name'],
                'sector': internship['sector'],
                'location': internship['location'],
                'score': float(score),
                'capacity': internship['capacity'],
                'quota_info': quota_info,
                'description': internship['description']
            })
        
        return matches
    
    def batch_allocate_all(self, fairness_strategy: str = "quota") -> Dict[str, Any]:
        """
        Run batch allocation for all students to all internships
        
        Returns:
            Allocation summary statistics
        """
        # Load data if not cached
        if self.students_cache is None or self.internships_cache is None:
            self._load_cached_data()
        
        if self.student_features is None or self.internship_features is None:
            logger.error("Features not available, need to train model first")
            return {'error': 'Model not trained'}
        
        # Clear existing allocations
        Allocation.query.delete()
        db.session.commit()
        
        # Compute all scores
        scores = self.predict_scores(self.student_features, self.internship_features)
        
        # Apply fairness boost if requested
        if fairness_strategy == "boost":
            scores = self.apply_fairness_boost(scores, self.students_cache)
        
        total_allocated = 0
        quota_fulfillment = {}
        
        # Process each internship
        for j, internship in enumerate(self.internships_cache):
            internship_id = internship['id']
            
            # Get candidates ranked by score for this internship
            internship_scores = scores[:, j]
            ranked_candidates = [(self.students_cache[i]['id'], internship_scores[i]) 
                               for i in range(len(self.students_cache))]
            ranked_candidates.sort(key=lambda x: x[1], reverse=True)
            
            # Apply fairness and allocate
            quota = internship['reservation_quota']
            allocations = self.apply_fairness_and_allocate(
                internship_id, ranked_candidates, quota, fairness_strategy
            )
            
            # Save allocations to database
            for alloc in allocations:
                allocation = Allocation(
                    internship_id=internship_id,
                    student_id=alloc['student_id'],
                    quota_category=alloc['quota_category'],
                    score=alloc['score']
                )
                db.session.add(allocation)
                total_allocated += 1
            
            # Track quota fulfillment
            for category, required in quota.items():
                if required > 0:
                    filled = sum(1 for a in allocations if a['quota_category'] == category)
                    if category not in quota_fulfillment:
                        quota_fulfillment[category] = {'required': 0, 'filled': 0}
                    quota_fulfillment[category]['required'] += required
                    quota_fulfillment[category]['filled'] += filled
        
        db.session.commit()
        
        # Calculate fulfillment rates
        fulfillment_rates = {}
        for category, data in quota_fulfillment.items():
            if data['required'] > 0:
                fulfillment_rates[category] = data['filled'] / data['required']
            else:
                fulfillment_rates[category] = 1.0
        
        return {
            'matched_count': total_allocated,
            'quota_fulfillment': quota_fulfillment,
            'fulfillment_rates': fulfillment_rates,
            'strategy_used': fairness_strategy
        }
    
    def _load_cached_data(self):
        """Load student and internship data from database"""
        self.students_cache = [s.to_dict() for s in Student.query.all()]
        self.internships_cache = [i.to_dict() for i in Internship.query.all()]
        
        if len(self.students_cache) > 0 and len(self.internships_cache) > 0:
            # Re-vectorize with cached data
            self.student_features, self.internship_features = self.vectorize_profiles(
                self.students_cache, self.internships_cache, fit_transformers=False
            )
    
    def save_artifacts(self):
        """Save model artifacts to disk"""
        artifacts = {
            'skill_vectorizer': self.skill_vectorizer,
            'sector_vectorizer': self.sector_vectorizer,
            'desc_vectorizer': self.desc_vectorizer,
            'scaler': self.scaler,
            'model': self.model,
            'model_type': self.model_type,
            'fairness_boost': self.fairness_boost,
            'skill_overlap_threshold': self.skill_overlap_threshold
        }
        
        for name, artifact in artifacts.items():
            if artifact is not None:
                filepath = os.path.join(self.model_dir, f"{name}.pkl")
                joblib.dump(artifact, filepath)
                logger.info(f"Saved {name} to {filepath}")
    
    def load_artifacts(self) -> bool:
        """Load model artifacts from disk"""
        try:
            artifact_names = ['skill_vectorizer', 'sector_vectorizer', 'desc_vectorizer', 
                            'scaler', 'model', 'model_type', 'fairness_boost', 
                            'skill_overlap_threshold']
            
            for name in artifact_names:
                filepath = os.path.join(self.model_dir, f"{name}.pkl")
                if os.path.exists(filepath):
                    artifact = joblib.load(filepath)
                    setattr(self, name, artifact)
                    logger.info(f"Loaded {name} from {filepath}")
            
            return True
        except Exception as e:
            logger.error(f"Error loading artifacts: {e}")
            return False
    
    def evaluate_on_synthetic(self) -> Dict[str, float]:
        """
        Evaluate model performance on synthetic labels
        """
        if self.students_cache is None or self.internships_cache is None:
            self._load_cached_data()
        
        if self.student_features is None or self.internship_features is None:
            logger.error("Features not available")
            return {}
        
        # Create synthetic labels
        true_labels = self.create_synthetic_labels(self.students_cache, self.internships_cache)
        predicted_scores = self.predict_scores(self.student_features, self.internship_features)
        
        # Compute metrics
        metrics = {}
        
        # For each k, compute Precision@k and Recall@k
        for k in [1, 3, 5, 10]:
            precisions = []
            recalls = []
            
            for i in range(len(self.students_cache)):
                # Get top k predictions for student i
                student_scores = predicted_scores[i, :]
                top_k_indices = np.argsort(student_scores)[::-1][:k]
                
                # True positives in top k
                true_positives = np.sum(true_labels[i, top_k_indices])
                
                # Precision@k for this student
                precision_k = true_positives / k if k > 0 else 0
                precisions.append(precision_k)
                
                # Recall@k for this student
                total_relevant = np.sum(true_labels[i, :])
                recall_k = true_positives / total_relevant if total_relevant > 0 else 0
                recalls.append(recall_k)
            
            metrics[f'precision@{k}'] = np.mean(precisions)
            metrics[f'recall@{k}'] = np.mean(recalls)
        
        # Mean Average Precision (MAP)
        average_precisions = []
        for i in range(len(self.students_cache)):
            student_scores = predicted_scores[i, :]
            student_labels = true_labels[i, :]
            
            if np.sum(student_labels) > 0:  # Only if there are positive examples
                ap = average_precision_score(student_labels, student_scores)
                average_precisions.append(ap)
        
        metrics['map'] = np.mean(average_precisions) if average_precisions else 0.0
        
        return metrics

# Global matcher instance
matcher = InternshipMatcher()