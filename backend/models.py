from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    college = db.Column(db.String(200), nullable=False)
    degree = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    skills = db.Column(db.Text, nullable=False)  # JSON string
    location_pref = db.Column(db.String(100), nullable=False)
    sector_interests = db.Column(db.Text, nullable=False)  # JSON string
    category = db.Column(db.String(20), nullable=False)  # General, OBC, SC, ST, PwD
    aspirational_district = db.Column(db.Boolean, default=False)
    past_internships = db.Column(db.Integer, default=0)
    
    # Relationships
    allocations = db.relationship('Allocation', backref='student', lazy=True)
    
    def get_skills(self):
        """Parse skills JSON string to list"""
        return json.loads(self.skills) if self.skills else []
    
    def set_skills(self, skills_list):
        """Set skills from list to JSON string"""
        self.skills = json.dumps(skills_list)
    
    def get_sector_interests(self):
        """Parse sector interests JSON string to list"""
        return json.loads(self.sector_interests) if self.sector_interests else []
    
    def set_sector_interests(self, interests_list):
        """Set sector interests from list to JSON string"""
        self.sector_interests = json.dumps(interests_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'college': self.college,
            'degree': self.degree,
            'year': self.year,
            'skills': self.get_skills(),
            'location_pref': self.location_pref,
            'sector_interests': self.get_sector_interests(),
            'category': self.category,
            'aspirational_district': self.aspirational_district,
            'past_internships': self.past_internships
        }

class Internship(db.Model):
    __tablename__ = 'internships'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    sector = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.Text, nullable=False)  # JSON string
    location = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    reservation_quota = db.Column(db.Text, nullable=False)  # JSON string
    
    # Relationships
    allocations = db.relationship('Allocation', backref='internship', lazy=True)
    
    def get_required_skills(self):
        """Parse required skills JSON string to list"""
        return json.loads(self.required_skills) if self.required_skills else []
    
    def set_required_skills(self, skills_list):
        """Set required skills from list to JSON string"""
        self.required_skills = json.dumps(skills_list)
    
    def get_reservation_quota(self):
        """Parse reservation quota JSON string to dict"""
        return json.loads(self.reservation_quota) if self.reservation_quota else {}
    
    def set_reservation_quota(self, quota_dict):
        """Set reservation quota from dict to JSON string"""
        self.reservation_quota = json.dumps(quota_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'email': self.email,
            'sector': self.sector,
            'title': self.title,
            'description': self.description,
            'required_skills': self.get_required_skills(),
            'location': self.location,
            'capacity': self.capacity,
            'reservation_quota': self.get_reservation_quota()
        }

class Allocation(db.Model):
    __tablename__ = 'allocations'
    
    id = db.Column(db.Integer, primary_key=True)
    internship_id = db.Column(db.Integer, db.ForeignKey('internships.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    quota_category = db.Column(db.String(20), nullable=True)  # SC, ST, OBC, PwD, or None for general
    score = db.Column(db.Float, nullable=False)
    
    # Unique constraint to prevent duplicate allocations
    __table_args__ = (db.UniqueConstraint('internship_id', 'student_id', name='unique_allocation'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'internship_id': self.internship_id,
            'student_id': self.student_id,
            'quota_category': self.quota_category,
            'score': self.score,
            'student': self.student.to_dict() if self.student else None,
            'internship': self.internship.to_dict() if self.internship else None
        }