import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database configuration - switchable between SQLite and Postgres
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    ADMIN_API_KEY = os.getenv('ADMIN_API_KEY', 'admin123')
    
    # ML Model configuration
    MODEL_DIR = os.getenv('MODEL_DIR', 'models_artifacts')
    
    # Fairness configuration
    FAIRNESS_BOOST = float(os.getenv('FAIRNESS_BOOST', '0.05'))
    SKILL_OVERLAP_THRESHOLD = int(os.getenv('SKILL_OVERLAP_THRESHOLD', '2'))
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/app.log')