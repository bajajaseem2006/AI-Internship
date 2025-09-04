#!/usr/bin/env python3
"""
Inference script for PM Internship Scheme
Usage: python run_inference.py --student_id 1
"""

import argparse
import sys
from flask import Flask
from models import db, Student
from matcher import InternshipMatcher
from config import Config

def create_app():
    """Create Flask app for database operations"""
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    return app

def main():
    parser = argparse.ArgumentParser(description='Run inference for student-internship matching')
    parser.add_argument('--student_id', type=int, required=True,
                       help='ID of the student to get matches for')
    parser.add_argument('--k', type=int, default=10,
                       help='Number of top matches to return')
    parser.add_argument('--strategy', type=str, choices=['quota', 'boost'], default='boost',
                       help='Fairness strategy to use')
    parser.add_argument('--model_dir', type=str, default='models_artifacts',
                       help='Directory containing model artifacts')
    
    args = parser.parse_args()
    
    # Create Flask app and initialize database
    app = create_app()
    
    with app.app_context():
        # Check if student exists
        student = Student.query.get(args.student_id)
        if not student:
            print(f"Error: Student with ID {args.student_id} not found")
            sys.exit(1)
        
        print(f"Getting top {args.k} matches for student: {student.name}")
        print(f"Email: {student.email}")
        print(f"College: {student.college}")
        print(f"Skills: {', '.join(student.get_skills())}")
        print(f"Interests: {', '.join(student.get_sector_interests())}")
        print(f"Location Preference: {student.location_pref}")
        print(f"Category: {student.category}")
        print(f"Aspirational District: {student.aspirational_district}")
        print("-" * 80)
        
        # Initialize matcher
        matcher = InternshipMatcher(model_dir=args.model_dir)
        
        # Load trained model artifacts
        if not matcher.load_artifacts():
            print("Error: Could not load model artifacts")
            print("Please run train_model.py first to train the model")
            sys.exit(1)
        
        try:
            # Get top matches
            matches = matcher.get_top_matches_for_student(
                student_id=args.student_id,
                k=args.k,
                strategy=args.strategy
            )
            
            if not matches:
                print("No matches found. Please ensure the model is trained and database is populated.")
                sys.exit(1)
            
            print(f"Top {len(matches)} matches (using {args.strategy} strategy):")
            print()
            
            for i, match in enumerate(matches, 1):
                print(f"{i}. {match['title']} at {match['company_name']}")
                print(f"   Sector: {match['sector']}")
                print(f"   Location: {match['location']}")
                print(f"   Capacity: {match['capacity']}")
                print(f"   Match Score: {match['score']:.3f}")
                
                if match['quota_info']:
                    print(f"   Quota Category: {match['quota_info']}")
                
                print(f"   Description: {match['description']}")
                print()
            
            # Print summary statistics
            avg_score = sum(m['score'] for m in matches) / len(matches)
            print(f"Average match score: {avg_score:.3f}")
            
            quota_matches = sum(1 for m in matches if m['quota_info'])
            if quota_matches > 0:
                print(f"Matches with quota consideration: {quota_matches}")
            
        except Exception as e:
            print(f"Error during inference: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()