"""
Unit tests for the ML matching system
"""

import pytest
import numpy as np
import os
import sys
import tempfile
import shutil
from unittest.mock import patch, MagicMock

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from matcher import InternshipMatcher

class TestInternshipMatcher:
    
    @pytest.fixture
    def matcher(self):
        """Create a matcher instance with temporary model directory"""
        temp_dir = tempfile.mkdtemp()
        matcher = InternshipMatcher(model_dir=temp_dir)
        yield matcher
        # Cleanup
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def sample_students(self):
        """Sample student data for testing"""
        return [
            {
                'id': 1,
                'name': 'Test Student 1',
                'skills': ['Python', 'Machine Learning'],
                'sector_interests': ['AI/ML', 'Data Science'],
                'location_pref': 'Delhi',
                'category': 'General',
                'aspirational_district': False
            },
            {
                'id': 2,
                'name': 'Test Student 2',
                'skills': ['JavaScript', 'React'],
                'sector_interests': ['Web Development'],
                'location_pref': 'Remote',
                'category': 'SC',
                'aspirational_district': True
            }
        ]
    
    @pytest.fixture
    def sample_internships(self):
        """Sample internship data for testing"""
        return [
            {
                'id': 101,
                'title': 'AI Intern',
                'company_name': 'Tech Corp',
                'sector': 'AI/ML',
                'description': 'Work on machine learning projects',
                'required_skills': ['Python', 'Machine Learning'],
                'location': 'Delhi',
                'capacity': 5,
                'reservation_quota': {'SC': 1, 'ST': 0, 'OBC': 1, 'PwD': 0}
            },
            {
                'id': 102,
                'title': 'Web Developer Intern',
                'company_name': 'Web Solutions',
                'sector': 'Web Development',
                'description': 'Frontend and backend development',
                'required_skills': ['JavaScript', 'React', 'Node.js'],
                'location': 'Remote',
                'capacity': 3,
                'reservation_quota': {'SC': 0, 'ST': 0, 'OBC': 0, 'PwD': 0}
            }
        ]
    
    def test_build_skill_vocab(self, matcher, sample_students, sample_internships):
        """Test skill vocabulary building"""
        vocab = matcher.build_skill_vocab(sample_students, sample_internships)
        
        expected_skills = {'JavaScript', 'Machine Learning', 'Node.js', 'Python', 'React'}
        assert set(vocab) == expected_skills
        assert vocab == sorted(vocab)  # Should be sorted
    
    def test_build_sector_vocab(self, matcher, sample_students, sample_internships):
        """Test sector vocabulary building"""
        vocab = matcher.build_sector_vocab(sample_students, sample_internships)
        
        expected_sectors = {'AI/ML', 'Data Science', 'Web Development'}
        assert set(vocab) == expected_sectors
        assert vocab == sorted(vocab)  # Should be sorted
    
    def test_vectorize_profiles(self, matcher, sample_students, sample_internships):
        """Test profile vectorization"""
        student_features, internship_features = matcher.vectorize_profiles(
            sample_students, sample_internships, fit_transformers=True
        )
        
        # Check shapes
        assert student_features.shape[0] == len(sample_students)
        assert internship_features.shape[0] == len(sample_internships)
        assert student_features.shape[1] == internship_features.shape[1]  # Same feature dimensions
        
        # Check that features are normalized (scaled)
        assert not np.any(np.isnan(student_features))
        assert not np.any(np.isnan(internship_features))
    
    def test_compute_similarity_scores(self, matcher, sample_students, sample_internships):
        """Test similarity score computation"""
        student_features, internship_features = matcher.vectorize_profiles(
            sample_students, sample_internships, fit_transformers=True
        )
        
        scores = matcher.compute_similarity_scores(student_features, internship_features)
        
        # Check shape
        assert scores.shape == (len(sample_students), len(sample_internships))
        
        # Check score range [0, 1]
        assert np.all(scores >= 0)
        assert np.all(scores <= 1)
        
        # Student 1 should have higher score for AI internship than Web internship
        # (due to skill and sector match)
        assert scores[0, 0] > scores[0, 1]
        
        # Student 2 should have higher score for Web internship than AI internship
        assert scores[1, 1] > scores[1, 0]
    
    def test_create_synthetic_labels(self, matcher, sample_students, sample_internships):
        """Test synthetic label creation"""
        labels = matcher.create_synthetic_labels(sample_students, sample_internships)
        
        # Check shape
        assert labels.shape == (len(sample_students), len(sample_internships))
        
        # Check binary labels
        assert np.all(np.isin(labels, [0, 1]))
        
        # Student 1 should have positive label for AI internship (skill + sector match)
        assert labels[0, 0] == 1
        
        # Student 2 should have positive label for Web internship
        assert labels[1, 1] == 1
    
    def test_apply_fairness_boost(self, matcher, sample_students, sample_internships):
        """Test fairness boost application"""
        student_features, internship_features = matcher.vectorize_profiles(
            sample_students, sample_internships, fit_transformers=True
        )
        
        original_scores = matcher.compute_similarity_scores(student_features, internship_features)
        boosted_scores = matcher.apply_fairness_boost(original_scores, sample_students)
        
        # Student 1 (General, not aspirational) should have same scores
        assert np.allclose(boosted_scores[0, :], original_scores[0, :])
        
        # Student 2 (SC, aspirational) should have boosted scores
        expected_boost = original_scores[1, :] + matcher.fairness_boost
        assert np.allclose(boosted_scores[1, :], np.clip(expected_boost, 0, 1))
    
    def test_apply_fairness_and_allocate_quota_strategy(self, matcher):
        """Test quota-based fairness allocation"""
        # Mock data
        internship_id = 101
        capacity = 3
        quota = {'SC': 1, 'ST': 0, 'OBC': 0, 'PwD': 0}
        
        # Ranked candidates: (student_id, score)
        ranked_candidates = [
            (1, 0.9),  # General student, highest score
            (2, 0.8),  # SC student, second highest
            (3, 0.7),  # General student, third highest
            (4, 0.6),  # SC student, fourth highest
        ]
        
        with patch('matcher.Internship') as mock_internship_class:
            mock_internship = MagicMock()
            mock_internship.capacity = capacity
            mock_internship_class.query.get.return_value = mock_internship
            
            with patch('matcher.Student') as mock_student_class:
                def mock_get_student(student_id):
                    mock_student = MagicMock()
                    if student_id == 2 or student_id == 4:
                        mock_student.category = 'SC'
                    else:
                        mock_student.category = 'General'
                    return mock_student
                
                mock_student_class.query.get.side_effect = mock_get_student
                
                allocations = matcher.apply_fairness_and_allocate(
                    internship_id, ranked_candidates, quota, strategy="quota"
                )
                
                # Should allocate 3 students total
                assert len(allocations) == 3
                
                # Should have 1 SC student in reserved quota
                sc_allocations = [a for a in allocations if a['quota_category'] == 'SC']
                assert len(sc_allocations) == 1
                assert sc_allocations[0]['student_id'] == 2  # Highest scoring SC student
    
    def test_apply_fairness_and_allocate_boost_strategy(self, matcher):
        """Test boost-based fairness allocation"""
        internship_id = 101
        capacity = 2
        quota = {'SC': 0, 'ST': 0, 'OBC': 0, 'PwD': 0}
        
        # Ranked candidates: (student_id, score) - already boosted
        ranked_candidates = [
            (1, 0.9),  # General student
            (2, 0.85), # SC student (boosted)
            (3, 0.8),  # General student
        ]
        
        with patch('matcher.Internship') as mock_internship_class:
            mock_internship = MagicMock()
            mock_internship.capacity = capacity
            mock_internship_class.query.get.return_value = mock_internship
            
            with patch('matcher.Student') as mock_student_class:
                def mock_get_student(student_id):
                    mock_student = MagicMock()
                    if student_id == 2:
                        mock_student.category = 'SC'
                    else:
                        mock_student.category = 'General'
                    return mock_student
                
                mock_student_class.query.get.side_effect = mock_get_student
                
                allocations = matcher.apply_fairness_and_allocate(
                    internship_id, ranked_candidates, quota, strategy="boost"
                )
                
                # Should allocate top 2 students by score
                assert len(allocations) == 2
                assert allocations[0]['student_id'] == 1
                assert allocations[1]['student_id'] == 2
    
    def test_train_model_similarity(self, matcher, sample_students, sample_internships):
        """Test similarity model training"""
        metrics = matcher.train_model(
            model_type="similarity",
            students=sample_students,
            internships=sample_internships
        )
        
        assert metrics['model_type'] == 'similarity'
        assert 'message' in metrics
        
        # Check that vectorizers are created
        assert matcher.skill_vectorizer is not None
        assert matcher.desc_vectorizer is not None
        assert matcher.scaler is not None
    
    def test_train_model_lightgbm(self, matcher, sample_students, sample_internships):
        """Test LightGBM model training"""
        metrics = matcher.train_model(
            model_type="lightgbm",
            students=sample_students,
            internships=sample_internships
        )
        
        assert 'model_type' in metrics
        assert 'training_samples' in metrics
        assert 'positive_samples' in metrics
        
        # Check that model is created
        assert matcher.model is not None
    
    def test_save_and_load_artifacts(self, matcher, sample_students, sample_internships):
        """Test saving and loading model artifacts"""
        # Train a model first
        matcher.train_model(
            model_type="similarity",
            students=sample_students,
            internships=sample_internships
        )
        
        # Save artifacts
        matcher.save_artifacts()
        
        # Check that files are created
        expected_files = [
            'skill_vectorizer.pkl',
            'sector_vectorizer.pkl',
            'desc_vectorizer.pkl',
            'scaler.pkl',
            'model_type.pkl'
        ]
        
        for filename in expected_files:
            filepath = os.path.join(matcher.model_dir, filename)
            assert os.path.exists(filepath), f"File {filename} should exist"
        
        # Create new matcher and load artifacts
        new_matcher = InternshipMatcher(model_dir=matcher.model_dir)
        success = new_matcher.load_artifacts()
        
        assert success
        assert new_matcher.skill_vectorizer is not None
        assert new_matcher.model_type == "similarity"
    
    def test_evaluate_on_synthetic(self, matcher, sample_students, sample_internships):
        """Test model evaluation on synthetic data"""
        # Train model first
        matcher.train_model(
            model_type="similarity",
            students=sample_students,
            internships=sample_internships
        )
        
        # Set cached data for evaluation
        matcher.students_cache = sample_students
        matcher.internships_cache = sample_internships
        matcher._load_cached_data = MagicMock()  # Mock to prevent database call
        
        metrics = matcher.evaluate_on_synthetic()
        
        # Check that metrics are returned
        expected_metrics = ['precision@1', 'precision@3', 'precision@5', 'precision@10',
                          'recall@1', 'recall@3', 'recall@5', 'recall@10', 'map']
        
        for metric in expected_metrics:
            assert metric in metrics
            assert 0 <= metrics[metric] <= 1  # Valid probability range
    
    @pytest.mark.parametrize("model_type", ["similarity", "lightgbm"])
    def test_predict_scores(self, matcher, sample_students, sample_internships, model_type):
        """Test score prediction for different model types"""
        # Train model
        matcher.train_model(
            model_type=model_type,
            students=sample_students,
            internships=sample_internships
        )
        
        student_features, internship_features = matcher.vectorize_profiles(
            sample_students, sample_internships, fit_transformers=False
        )
        
        scores = matcher.predict_scores(student_features, internship_features)
        
        # Check output shape and range
        assert scores.shape == (len(sample_students), len(sample_internships))
        assert np.all(scores >= 0)
        assert np.all(scores <= 1)
        assert not np.any(np.isnan(scores))
    
    def test_skill_overlap_threshold(self, matcher, sample_students, sample_internships):
        """Test that skill overlap threshold works correctly"""
        # Set threshold to 2
        matcher.skill_overlap_threshold = 2
        
        labels = matcher.create_synthetic_labels(sample_students, sample_internships)
        
        # Student 1 has 2 matching skills with AI internship (Python, ML) -> should be positive
        assert labels[0, 0] == 1
        
        # Student 2 has 1 matching skill with Web internship (JavaScript) -> should be negative
        assert labels[1, 1] == 0
        
        # Lower threshold to 1
        matcher.skill_overlap_threshold = 1
        labels = matcher.create_synthetic_labels(sample_students, sample_internships)
        
        # Now Student 2 should have positive label for Web internship
        assert labels[1, 1] == 1