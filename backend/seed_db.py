#!/usr/bin/env python3
"""
Database seeding script for PM Internship Scheme
Usage: python seed_db.py --students data/small_students.json --internships data/small_internships.json
"""

import json
import argparse
import os
import sys
from flask import Flask
from models import db, Student, Internship
from config import Config

def create_app():
    """Create Flask app for database operations"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Ensure database directory exists for SQLite
    if app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite:'):
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        os.makedirs(os.path.dirname(db_path) if os.path.dirname(db_path) else '.', exist_ok=True)
    
    db.init_app(app)
    return app

def seed_students(students_file: str, app) -> int:
    """Seed students from JSON file"""
    if not os.path.exists(students_file):
        print(f"Students file not found: {students_file}")
        return 0
    
    with open(students_file, 'r') as f:
        students_data = json.load(f)
    
    added_count = 0
    updated_count = 0
    
    with app.app_context():
        for student_data in students_data:
            # Check if student already exists
            existing = Student.query.filter_by(email=student_data['email']).first()
            
            if existing:
                # Update existing student
                existing.name = student_data['name']
                existing.college = student_data['college']
                existing.degree = student_data['degree']
                existing.year = student_data['year']
                existing.set_skills(student_data['skills'])
                existing.location_pref = student_data['location_pref']
                existing.set_sector_interests(student_data['sector_interests'])
                existing.category = student_data['category']
                existing.aspirational_district = student_data['aspirational_district']
                existing.past_internships = student_data['past_internships']
                updated_count += 1
            else:
                # Create new student
                student = Student(
                    name=student_data['name'],
                    email=student_data['email'],
                    college=student_data['college'],
                    degree=student_data['degree'],
                    year=student_data['year'],
                    location_pref=student_data['location_pref'],
                    category=student_data['category'],
                    aspirational_district=student_data['aspirational_district'],
                    past_internships=student_data['past_internships']
                )
                student.set_skills(student_data['skills'])
                student.set_sector_interests(student_data['sector_interests'])
                db.session.add(student)
                added_count += 1
        
        db.session.commit()
        print(f"Students: {added_count} added, {updated_count} updated")
        return added_count + updated_count

def seed_internships(internships_file: str, app) -> int:
    """Seed internships from JSON file"""
    if not os.path.exists(internships_file):
        print(f"Internships file not found: {internships_file}")
        return 0
    
    with open(internships_file, 'r') as f:
        internships_data = json.load(f)
    
    added_count = 0
    updated_count = 0
    
    with app.app_context():
        for internship_data in internships_data:
            # Check if internship already exists (by company and title)
            existing = Internship.query.filter_by(
                company_name=internship_data['company_name'],
                title=internship_data['title']
            ).first()
            
            if existing:
                # Update existing internship
                existing.email = internship_data['email']
                existing.sector = internship_data['sector']
                existing.description = internship_data['description']
                existing.set_required_skills(internship_data['required_skills'])
                existing.location = internship_data['location']
                existing.capacity = internship_data['capacity']
                existing.set_reservation_quota(internship_data['reservation_quota'])
                updated_count += 1
            else:
                # Create new internship
                internship = Internship(
                    company_name=internship_data['company_name'],
                    email=internship_data['email'],
                    sector=internship_data['sector'],
                    title=internship_data['title'],
                    description=internship_data['description'],
                    location=internship_data['location'],
                    capacity=internship_data['capacity']
                )
                internship.set_required_skills(internship_data['required_skills'])
                internship.set_reservation_quota(internship_data['reservation_quota'])
                db.session.add(internship)
                added_count += 1
        
        db.session.commit()
        print(f"Internships: {added_count} added, {updated_count} updated")
        return added_count + updated_count

def main():
    parser = argparse.ArgumentParser(description='Seed database with student and internship data')
    parser.add_argument('--students', type=str, default='data/small_students.json',
                       help='Path to students JSON file')
    parser.add_argument('--internships', type=str, default='data/small_internships.json',
                       help='Path to internships JSON file')
    parser.add_argument('--create-tables', action='store_true',
                       help='Create database tables if they do not exist')
    
    args = parser.parse_args()
    
    # Create Flask app
    app = create_app()
    
    with app.app_context():
        if args.create_tables:
            print("Creating database tables...")
            db.create_all()
        
        print("Seeding database...")
        
        # Seed students
        student_count = seed_students(args.students, app)
        
        # Seed internships
        internship_count = seed_internships(args.internships, app)
        
        print(f"\nSeeding completed successfully!")
        print(f"Total students processed: {student_count}")
        print(f"Total internships processed: {internship_count}")
        
        # Print current database stats
        total_students = Student.query.count()
        total_internships = Internship.query.count()
        print(f"\nCurrent database contents:")
        print(f"Students: {total_students}")
        print(f"Internships: {total_internships}")

if __name__ == "__main__":
    main()