"""
Unit tests for Flask API endpoints
"""

import pytest
import json
import os
import sys
import tempfile
import shutil
from unittest.mock import patch, MagicMock

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, Student, Internship, Allocation
from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    ADMIN_API_KEY = 'test-admin-key'
    SECRET_KEY = 'test-secret-key'

@pytest.fixture
def app():
    """Create test Flask application"""
    app = create_app()
    app.config.from_object(TestConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def admin_headers():
    """Headers with admin API key"""
    return {'x-admin-key': 'test-admin-key', 'Content-Type': 'application/json'}

@pytest.fixture
def sample_student_data():
    """Sample student data for testing"""
    return {
        'name': 'Test Student',
        'email': 'test@example.com',
        'college': 'Test University',
        'degree': 'B.Tech CSE',
        'year': 3,
        'skills': ['Python', 'Machine Learning'],
        'location_pref': 'Delhi',
        'sector_interests': ['AI/ML', 'Data Science'],
        'category': 'General',
        'aspirational_district': False,
        'past_internships': 0
    }

@pytest.fixture
def sample_internship_data():
    """Sample internship data for testing"""
    return {
        'company_name': 'Test Company',
        'email': 'hr@testcompany.com',
        'sector': 'AI/ML',
        'title': 'AI Intern',
        'description': 'Work on machine learning projects',
        'required_skills': ['Python', 'Machine Learning'],
        'location': 'Delhi',
        'capacity': 5,
        'reservation_quota': {'SC': 1, 'ST': 0, 'OBC': 1, 'PwD': 0}
    }

class TestHealthEndpoint:
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'AI-Based Smart Allocation Engine' in data['message']

class TestStudentEndpoints:
    
    def test_create_student_success(self, client, sample_student_data):
        """Test successful student creation"""
        response = client.post('/api/student', 
                             data=json.dumps(sample_student_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['message'] == 'Student created successfully'
        assert 'student_id' in data
        assert data['student']['name'] == sample_student_data['name']
    
    def test_create_student_missing_fields(self, client):
        """Test student creation with missing required fields"""
        incomplete_data = {
            'name': 'Test Student',
            'email': 'test@example.com'
            # Missing other required fields
        }
        
        response = client.post('/api/student',
                             data=json.dumps(incomplete_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error'] == 'Validation failed'
        assert 'details' in data
    
    def test_create_student_invalid_year(self, client, sample_student_data):
        """Test student creation with invalid year"""
        sample_student_data['year'] = 10  # Invalid year
        
        response = client.post('/api/student',
                             data=json.dumps(sample_student_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Year must be between 1 and 5' in str(data)
    
    def test_create_student_duplicate_email(self, client, sample_student_data):
        """Test student creation with duplicate email"""
        # Create first student
        client.post('/api/student',
                   data=json.dumps(sample_student_data),
                   content_type='application/json')
        
        # Try to create second student with same email
        response = client.post('/api/student',
                             data=json.dumps(sample_student_data),
                             content_type='application/json')
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'already exists' in data['error']
    
    def test_create_student_invalid_content_type(self, client, sample_student_data):
        """Test student creation with invalid content type"""
        response = client.post('/api/student',
                             data=sample_student_data)  # No JSON content type
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Content-Type must be application/json' in data['error']

class TestInternshipEndpoints:
    
    def test_create_internship_success(self, client, sample_internship_data):
        """Test successful internship creation"""
        response = client.post('/api/company',
                             data=json.dumps(sample_internship_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['message'] == 'Internship created successfully'
        assert 'internship_id' in data
        assert data['internship']['title'] == sample_internship_data['title']
    
    def test_create_internship_auto_quota(self, client):
        """Test internship creation with auto-generated quota"""
        internship_data = {
            'company_name': 'Test Company',
            'email': 'hr@test.com',
            'sector': 'Software',
            'title': 'Software Intern',
            'description': 'Software development internship',
            'required_skills': ['Python', 'JavaScript'],
            'location': 'Mumbai',
            'capacity': 10
            # No reservation_quota provided - should be auto-generated
        }
        
        response = client.post('/api/company',
                             data=json.dumps(internship_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        quota = data['internship']['reservation_quota']
        
        # Check auto-generated quota
        assert quota['SC'] == 1  # 10% of 10
        assert quota['ST'] == 0  # 5% of 10 (rounded down)
        assert quota['OBC'] == 1  # 15% of 10 (rounded down)
        assert quota['PwD'] == 0  # 2% of 10 (rounded down)
    
    def test_create_internship_missing_fields(self, client):
        """Test internship creation with missing fields"""
        incomplete_data = {
            'company_name': 'Test Company',
            'title': 'Test Intern'
            # Missing other required fields
        }
        
        response = client.post('/api/company',
                             data=json.dumps(incomplete_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error'] == 'Validation failed'

class TestMatchingEndpoints:
    
    def test_get_student_matches_success(self, client, sample_student_data, sample_internship_data):
        """Test getting matches for a student"""
        # Create student and internship
        student_response = client.post('/api/student',
                                     data=json.dumps(sample_student_data),
                                     content_type='application/json')
        student_id = json.loads(student_response.data)['student_id']
        
        client.post('/api/company',
                   data=json.dumps(sample_internship_data),
                   content_type='application/json')
        
        # Mock the matcher to return sample matches
        with patch('app.matcher') as mock_matcher:
            mock_matcher.load_artifacts.return_value = True
            mock_matcher.get_top_matches_for_student.return_value = [
                {
                    'internship_id': 101,
                    'title': 'AI Intern',
                    'company_name': 'Test Company',
                    'sector': 'AI/ML',
                    'location': 'Delhi',
                    'score': 0.85,
                    'capacity': 5,
                    'quota_info': None,
                    'description': 'Test description'
                }
            ]
            
            response = client.get(f'/api/match/student/{student_id}?k=5&strategy=boost')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['student_id'] == student_id
            assert len(data['matches']) == 1
            assert data['matches'][0]['title'] == 'AI Intern'
    
    def test_get_student_matches_not_found(self, client):
        """Test getting matches for non-existent student"""
        response = client.get('/api/match/student/999')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'Student not found' in data['error']
    
    def test_get_student_matches_model_not_trained(self, client, sample_student_data):
        """Test getting matches when model is not trained"""
        # Create student
        student_response = client.post('/api/student',
                                     data=json.dumps(sample_student_data),
                                     content_type='application/json')
        student_id = json.loads(student_response.data)['student_id']
        
        # Mock matcher to return False for load_artifacts
        with patch('app.matcher') as mock_matcher:
            mock_matcher.load_artifacts.return_value = False
            
            response = client.get(f'/api/match/student/{student_id}')
            
            assert response.status_code == 503
            data = json.loads(response.data)
            assert 'Model not trained' in data['error']

class TestAdminEndpoints:
    
    def test_seed_database_success(self, client, admin_headers):
        """Test successful database seeding"""
        with patch('app.seed_students') as mock_seed_students, \
             patch('app.seed_internships') as mock_seed_internships:
            
            mock_seed_students.return_value = 5
            mock_seed_internships.return_value = 3
            
            response = client.post('/api/seed',
                                 headers=admin_headers,
                                 data=json.dumps({}),
                                 content_type='application/json')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'Database seeded successfully' in data['message']
    
    def test_seed_database_unauthorized(self, client):
        """Test database seeding without admin key"""
        response = client.post('/api/seed',
                             data=json.dumps({}),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'Unauthorized' in data['error']
    
    def test_train_model_success(self, client, admin_headers):
        """Test successful model training"""
        # Create some test data first
        with client.application.app_context():
            student = Student(name='Test', email='test@test.com', college='Test',
                            degree='Test', year=3, location_pref='Delhi',
                            category='General')
            student.set_skills(['Python'])
            student.set_sector_interests(['AI/ML'])
            
            internship = Internship(company_name='Test', email='test@test.com',
                                  sector='AI/ML', title='Test', description='Test',
                                  location='Delhi', capacity=1)
            internship.set_required_skills(['Python'])
            internship.set_reservation_quota({'SC': 0, 'ST': 0, 'OBC': 0, 'PwD': 0})
            
            db.session.add(student)
            db.session.add(internship)
            db.session.commit()
        
        with patch('app.matcher') as mock_matcher:
            mock_matcher.train_model.return_value = {
                'model_type': 'similarity',
                'message': 'Training completed'
            }
            
            training_config = {
                'model_type': 'similarity',
                'fairness_strategy': 'boost'
            }
            
            response = client.post('/api/admin/train',
                                 headers=admin_headers,
                                 data=json.dumps(training_config))
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'Model trained successfully' in data['message']
    
    def test_train_model_insufficient_data(self, client, admin_headers):
        """Test model training with insufficient data"""
        training_config = {
            'model_type': 'similarity',
            'fairness_strategy': 'boost'
        }
        
        response = client.post('/api/admin/train',
                             headers=admin_headers,
                             data=json.dumps(training_config))
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Insufficient data' in data['error']
    
    def test_batch_allocation_success(self, client, admin_headers):
        """Test successful batch allocation"""
        with patch('app.matcher') as mock_matcher:
            mock_matcher.load_artifacts.return_value = True
            mock_matcher.batch_allocate_all.return_value = {
                'matched_count': 10,
                'quota_fulfillment': {},
                'fulfillment_rates': {},
                'strategy_used': 'quota'
            }
            
            allocation_config = {'fairness_strategy': 'quota'}
            
            response = client.post('/api/match/batch',
                                 headers=admin_headers,
                                 data=json.dumps(allocation_config))
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'Batch allocation completed' in data['message']
    
    def test_batch_allocation_model_not_trained(self, client, admin_headers):
        """Test batch allocation when model is not trained"""
        with patch('app.matcher') as mock_matcher:
            mock_matcher.load_artifacts.return_value = False
            
            allocation_config = {'fairness_strategy': 'quota'}
            
            response = client.post('/api/match/batch',
                                 headers=admin_headers,
                                 data=json.dumps(allocation_config))
            
            assert response.status_code == 503
            data = json.loads(response.data)
            assert 'Model not trained' in data['error']

class TestDataEndpoints:
    
    def test_get_students(self, client, sample_student_data):
        """Test getting all students"""
        # Create a student first
        client.post('/api/student',
                   data=json.dumps(sample_student_data),
                   content_type='application/json')
        
        response = client.get('/api/students')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'students' in data
        assert data['count'] == 1
        assert data['students'][0]['name'] == sample_student_data['name']
    
    def test_get_internships(self, client, sample_internship_data):
        """Test getting all internships"""
        # Create an internship first
        client.post('/api/company',
                   data=json.dumps(sample_internship_data),
                   content_type='application/json')
        
        response = client.get('/api/internships')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'internships' in data
        assert data['count'] == 1
        assert data['internships'][0]['title'] == sample_internship_data['title']
    
    def test_get_allocations_empty(self, client):
        """Test getting allocations when none exist"""
        response = client.get('/api/allocations')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['count'] == 0
        assert data['allocations'] == []

class TestErrorHandling:
    
    def test_404_error(self, client):
        """Test 404 error handling"""
        response = client.get('/api/nonexistent')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'Endpoint not found' in data['error']
    
    def test_invalid_json(self, client):
        """Test handling of invalid JSON"""
        response = client.post('/api/student',
                             data='invalid json',
                             content_type='application/json')
        
        assert response.status_code == 400
    
    def test_admin_key_validation(self, client):
        """Test admin key validation"""
        # Test with wrong admin key
        wrong_headers = {'x-admin-key': 'wrong-key', 'Content-Type': 'application/json'}
        
        response = client.post('/api/seed',
                             headers=wrong_headers,
                             data=json.dumps({}))
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'Unauthorized' in data['error']