#!/usr/bin/env python3
"""
Flask API for PM Internship Scheme - AI-Based Smart Allocation Engine
"""

import os
import logging
import json
from functools import wraps
from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
from models import db, Student, Internship, Allocation
from matcher import InternshipMatcher
from config import Config

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for frontend
    CORS(app)
    
    # Initialize database
    db.init_app(app)
    
    # Ensure log directory exists
    os.makedirs('logs', exist_ok=True)
    
    # Set up file logging
    file_handler = logging.FileHandler(app.config['LOG_FILE'])
    file_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    app.logger.addHandler(file_handler)
    
    return app

app = create_app()

# Initialize matcher
matcher = InternshipMatcher(model_dir=app.config['MODEL_DIR'])

def require_admin_key(f):
    """Decorator to require admin API key for protected endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_key = request.headers.get('x-admin-key')
        if admin_key != current_app.config['ADMIN_API_KEY']:
            return jsonify({'error': 'Unauthorized - Invalid admin key'}), 401
        return f(*args, **kwargs)
    return decorated_function

def validate_student_data(data: dict) -> tuple:
    """Validate student data and return (is_valid, errors)"""
    errors = []
    required_fields = ['name', 'email', 'college', 'degree', 'year', 'skills', 
                      'location_pref', 'sector_interests', 'category']
    
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    if 'year' in data and not isinstance(data['year'], int):
        errors.append("Year must be an integer")
    
    if 'year' in data and not (1 <= data['year'] <= 5):
        errors.append("Year must be between 1 and 5")
    
    if 'skills' in data and not isinstance(data['skills'], list):
        errors.append("Skills must be a list")
    
    if 'sector_interests' in data and not isinstance(data['sector_interests'], list):
        errors.append("Sector interests must be a list")
    
    if 'category' in data and data['category'] not in ['General', 'OBC', 'SC', 'ST', 'PwD']:
        errors.append("Category must be one of: General, OBC, SC, ST, PwD")
    
    return len(errors) == 0, errors

def validate_internship_data(data: dict) -> tuple:
    """Validate internship data and return (is_valid, errors)"""
    errors = []
    required_fields = ['company_name', 'email', 'sector', 'title', 'description',
                      'required_skills', 'location', 'capacity']
    
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    if 'capacity' in data and not isinstance(data['capacity'], int):
        errors.append("Capacity must be an integer")
    
    if 'capacity' in data and data['capacity'] <= 0:
        errors.append("Capacity must be positive")
    
    if 'required_skills' in data and not isinstance(data['required_skills'], list):
        errors.append("Required skills must be a list")
    
    return len(errors) == 0, errors

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'AI-Based Smart Allocation Engine is running'})

@app.route('/api/seed', methods=['POST'])
@require_admin_key
def seed_database():
    """Seed database from JSON files"""
    try:
        # Import here to avoid circular imports
        from seed_db import seed_students, seed_internships
        
        # Default to small data files
        students_file = 'data/small_students.json'
        internships_file = 'data/small_internships.json'
        
        # Allow override via request body
        if request.is_json:
            data = request.get_json()
            students_file = data.get('students_file', students_file)
            internships_file = data.get('internships_file', internships_file)
        
        logger.info(f"Seeding database from {students_file} and {internships_file}")
        
        # Ensure tables exist
        db.create_all()
        
        # Seed data
        student_count = seed_students(students_file, app)
        internship_count = seed_internships(internships_file, app)
        
        # Get total counts
        total_students = Student.query.count()
        total_internships = Internship.query.count()
        
        result = {
            'message': 'Database seeded successfully',
            'students_processed': student_count,
            'internships_processed': internship_count,
            'total_students': total_students,
            'total_internships': total_internships
        }
        
        logger.info(f"Seeding completed: {result}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        return jsonify({'error': f'Seeding failed: {str(e)}'}), 500

@app.route('/api/student', methods=['POST'])
def create_student():
    """Create a new student"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        
        # Validate data
        is_valid, errors = validate_student_data(data)
        if not is_valid:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        # Check if email already exists
        existing = Student.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'error': 'Student with this email already exists'}), 409
        
        # Create student
        student = Student(
            name=data['name'],
            email=data['email'],
            college=data['college'],
            degree=data['degree'],
            year=data['year'],
            location_pref=data['location_pref'],
            category=data['category'],
            aspirational_district=data.get('aspirational_district', False),
            past_internships=data.get('past_internships', 0)
        )
        
        student.set_skills(data['skills'])
        student.set_sector_interests(data['sector_interests'])
        
        db.session.add(student)
        db.session.commit()
        
        logger.info(f"Created student: {student.name} (ID: {student.id})")
        
        return jsonify({
            'message': 'Student created successfully',
            'student_id': student.id,
            'student': student.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating student: {e}")
        return jsonify({'error': f'Failed to create student: {str(e)}'}), 500

@app.route('/api/company', methods=['POST'])
def create_internship():
    """Create a new internship"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        
        # Validate data
        is_valid, errors = validate_internship_data(data)
        if not is_valid:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        # Set default reservation quota if not provided
        if 'reservation_quota' not in data:
            capacity = data['capacity']
            data['reservation_quota'] = {
                "SC": max(0, int(capacity * 0.10)),
                "ST": max(0, int(capacity * 0.05)),
                "OBC": max(0, int(capacity * 0.15)),
                "PwD": max(0, int(capacity * 0.02))
            }
        
        # Create internship
        internship = Internship(
            company_name=data['company_name'],
            email=data['email'],
            sector=data['sector'],
            title=data['title'],
            description=data['description'],
            location=data['location'],
            capacity=data['capacity']
        )
        
        internship.set_required_skills(data['required_skills'])
        internship.set_reservation_quota(data['reservation_quota'])
        
        db.session.add(internship)
        db.session.commit()
        
        logger.info(f"Created internship: {internship.title} at {internship.company_name} (ID: {internship.id})")
        
        return jsonify({
            'message': 'Internship created successfully',
            'internship_id': internship.id,
            'internship': internship.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating internship: {e}")
        return jsonify({'error': f'Failed to create internship: {str(e)}'}), 500

@app.route('/api/match/student/<int:student_id>', methods=['GET'])
def get_student_matches(student_id):
    """Get top k internship matches for a student"""
    try:
        # Get query parameters
        k = request.args.get('k', 5, type=int)
        strategy = request.args.get('strategy', 'boost')
        
        if strategy not in ['quota', 'boost']:
            return jsonify({'error': 'Strategy must be "quota" or "boost"'}), 400
        
        # Check if student exists
        student = Student.query.get(student_id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Load model artifacts if not loaded
        if not matcher.load_artifacts():
            return jsonify({'error': 'Model not trained. Please train the model first.'}), 503
        
        # Get matches
        matches = matcher.get_top_matches_for_student(student_id, k=k, strategy=strategy)
        
        if not matches:
            return jsonify({'error': 'No matches found. Ensure database is populated.'}), 404
        
        logger.info(f"Retrieved {len(matches)} matches for student {student_id}")
        
        return jsonify({
            'student_id': student_id,
            'student_name': student.name,
            'matches': matches,
            'strategy_used': strategy
        })
        
    except Exception as e:
        logger.error(f"Error getting matches for student {student_id}: {e}")
        return jsonify({'error': f'Failed to get matches: {str(e)}'}), 500

@app.route('/api/admin/train', methods=['POST'])
@require_admin_key
def train_model():
    """Train the ML model"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        model_type = data.get('model_type', 'similarity')
        fairness_strategy = data.get('fairness_strategy', 'boost')
        
        if model_type not in ['similarity', 'lightgbm']:
            return jsonify({'error': 'model_type must be "similarity" or "lightgbm"'}), 400
        
        if fairness_strategy not in ['quota', 'boost']:
            return jsonify({'error': 'fairness_strategy must be "quota" or "boost"'}), 400
        
        # Check if database has data
        student_count = Student.query.count()
        internship_count = Internship.query.count()
        
        if student_count == 0 or internship_count == 0:
            return jsonify({
                'error': 'Insufficient data for training',
                'students': student_count,
                'internships': internship_count
            }), 400
        
        logger.info(f"Starting model training: {model_type} with {fairness_strategy} fairness")
        
        # Train model
        metrics = matcher.train_model(model_type=model_type)
        
        # Save training info
        training_info = {
            'model_type': model_type,
            'fairness_strategy': fairness_strategy,
            'training_data_size': {
                'students': student_count,
                'internships': internship_count
            },
            'metrics': metrics
        }
        
        logger.info(f"Model training completed: {metrics}")
        
        return jsonify({
            'message': 'Model trained successfully',
            'training_info': training_info
        })
        
    except Exception as e:
        logger.error(f"Error training model: {e}")
        return jsonify({'error': f'Training failed: {str(e)}'}), 500

@app.route('/api/match/batch', methods=['POST'])
@require_admin_key
def batch_allocation():
    """Run batch allocation for all students"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        fairness_strategy = data.get('fairness_strategy', 'quota')
        
        if fairness_strategy not in ['quota', 'boost']:
            return jsonify({'error': 'fairness_strategy must be "quota" or "boost"'}), 400
        
        # Load model artifacts if not loaded
        if not matcher.load_artifacts():
            return jsonify({'error': 'Model not trained. Please train the model first.'}), 503
        
        logger.info(f"Starting batch allocation with {fairness_strategy} strategy")
        
        # Run batch allocation
        allocation_stats = matcher.batch_allocate_all(fairness_strategy=fairness_strategy)
        
        if 'error' in allocation_stats:
            return jsonify(allocation_stats), 500
        
        logger.info(f"Batch allocation completed: {allocation_stats}")
        
        return jsonify({
            'message': 'Batch allocation completed successfully',
            'allocation_stats': allocation_stats
        })
        
    except Exception as e:
        logger.error(f"Error in batch allocation: {e}")
        return jsonify({'error': f'Batch allocation failed: {str(e)}'}), 500

@app.route('/api/allocations/internship/<int:internship_id>', methods=['GET'])
def get_internship_allocations(internship_id):
    """Get allocated students for an internship"""
    try:
        # Check if internship exists
        internship = Internship.query.get(internship_id)
        if not internship:
            return jsonify({'error': 'Internship not found'}), 404
        
        # Get allocations
        allocations = Allocation.query.filter_by(internship_id=internship_id).all()
        
        result = {
            'internship_id': internship_id,
            'internship_title': internship.title,
            'company_name': internship.company_name,
            'capacity': internship.capacity,
            'allocated_count': len(allocations),
            'allocations': []
        }
        
        for allocation in allocations:
            result['allocations'].append({
                'student_id': allocation.student_id,
                'student_name': allocation.student.name,
                'student_email': allocation.student.email,
                'student_category': allocation.student.category,
                'quota_category': allocation.quota_category,
                'score': allocation.score
            })
        
        # Sort by score descending
        result['allocations'].sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error getting allocations for internship {internship_id}: {e}")
        return jsonify({'error': f'Failed to get allocations: {str(e)}'}), 500

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students (for admin panel)"""
    try:
        students = Student.query.all()
        return jsonify({
            'students': [student.to_dict() for student in students],
            'count': len(students)
        })
    except Exception as e:
        logger.error(f"Error getting students: {e}")
        return jsonify({'error': f'Failed to get students: {str(e)}'}), 500

@app.route('/api/internships', methods=['GET'])
def get_internships():
    """Get all internships (for admin panel)"""
    try:
        internships = Internship.query.all()
        return jsonify({
            'internships': [internship.to_dict() for internship in internships],
            'count': len(internships)
        })
    except Exception as e:
        logger.error(f"Error getting internships: {e}")
        return jsonify({'error': f'Failed to get internships: {str(e)}'}), 500

@app.route('/api/allocations', methods=['GET'])
def get_all_allocations():
    """Get all allocations (for admin panel)"""
    try:
        allocations = Allocation.query.all()
        return jsonify({
            'allocations': [allocation.to_dict() for allocation in allocations],
            'count': len(allocations)
        })
    except Exception as e:
        logger.error(f"Error getting allocations: {e}")
        return jsonify({'error': f'Failed to get allocations: {str(e)}'}), 500

@app.route('/api/admin/evaluate', methods=['POST'])
@require_admin_key
def evaluate_model():
    """Evaluate model performance on synthetic data"""
    try:
        # Load model artifacts if not loaded
        if not matcher.load_artifacts():
            return jsonify({'error': 'Model not trained. Please train the model first.'}), 503
        
        logger.info("Running model evaluation on synthetic data")
        
        # Run evaluation
        eval_metrics = matcher.evaluate_on_synthetic()
        
        if not eval_metrics:
            return jsonify({'error': 'Evaluation failed - no metrics returned'}), 500
        
        logger.info(f"Evaluation completed: {eval_metrics}")
        
        return jsonify({
            'message': 'Model evaluation completed',
            'evaluation_metrics': eval_metrics
        })
        
    except Exception as e:
        logger.error(f"Error evaluating model: {e}")
        return jsonify({'error': f'Evaluation failed: {str(e)}'}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_system_stats():
    """Get system statistics"""
    try:
        stats = {
            'database': {
                'students': Student.query.count(),
                'internships': Internship.query.count(),
                'allocations': Allocation.query.count()
            },
            'model': {
                'artifacts_exist': os.path.exists(os.path.join(matcher.model_dir, 'skill_vectorizer.pkl')),
                'model_dir': matcher.model_dir
            }
        }
        
        # Check for training metrics
        metrics_file = os.path.join(matcher.model_dir, 'train_metrics.json')
        if os.path.exists(metrics_file):
            with open(metrics_file, 'r') as f:
                stats['model']['last_training_metrics'] = json.load(f)
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting system stats: {e}")
        return jsonify({'error': f'Failed to get stats: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        logger.info("Database tables created/verified")
        
        # Load model artifacts if available
        if matcher.load_artifacts():
            logger.info("Model artifacts loaded successfully")
        else:
            logger.info("No model artifacts found - train the model first")
    
    # Run the application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting AI-Based Smart Allocation Engine on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)