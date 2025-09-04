#!/usr/bin/env python3
"""
Training script for ML models in PM Internship Scheme
Usage: python train_model.py --model_type similarity --save_dir models_artifacts
"""

import argparse
import json
import os
import sys
from flask import Flask
from models import db, Student, Internship
from matcher import InternshipMatcher
from config import Config

def create_app():
    """Create Flask app for database operations"""
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    return app

def main():
    parser = argparse.ArgumentParser(description='Train ML model for internship matching')
    parser.add_argument('--model_type', type=str, choices=['similarity', 'lightgbm'], 
                       default='similarity', help='Type of model to train')
    parser.add_argument('--save_dir', type=str, default='models_artifacts',
                       help='Directory to save model artifacts')
    parser.add_argument('--fairness_strategy', type=str, choices=['quota', 'boost'],
                       default='boost', help='Fairness strategy to use')
    parser.add_argument('--evaluate', action='store_true',
                       help='Run evaluation on synthetic data after training')
    
    args = parser.parse_args()
    
    # Create Flask app and initialize database
    app = create_app()
    
    with app.app_context():
        # Check if database has data
        student_count = Student.query.count()
        internship_count = Internship.query.count()
        
        if student_count == 0 or internship_count == 0:
            print(f"Error: Database has insufficient data")
            print(f"Students: {student_count}, Internships: {internship_count}")
            print("Please run seed_db.py first to populate the database")
            sys.exit(1)
        
        print(f"Training {args.model_type} model...")
        print(f"Database contains {student_count} students and {internship_count} internships")
        
        # Initialize matcher
        matcher = InternshipMatcher(model_dir=args.save_dir)
        
        # Configure fairness parameters
        matcher.fairness_boost = Config.FAIRNESS_BOOST
        matcher.skill_overlap_threshold = Config.SKILL_OVERLAP_THRESHOLD
        
        # Train model
        try:
            metrics = matcher.train_model(model_type=args.model_type)
            
            print(f"\nTraining completed successfully!")
            print(f"Model type: {metrics.get('model_type', args.model_type)}")
            
            if 'training_samples' in metrics:
                print(f"Training samples: {metrics['training_samples']}")
                print(f"Positive samples: {metrics['positive_samples']}")
                print(f"Precision: {metrics['precision']:.3f}")
                print(f"Recall: {metrics['recall']:.3f}")
                print(f"Average Precision: {metrics['average_precision']:.3f}")
            
            # Save training metrics
            metrics_file = os.path.join(args.save_dir, 'train_metrics.json')
            with open(metrics_file, 'w') as f:
                json.dump(metrics, f, indent=2)
            print(f"Training metrics saved to {metrics_file}")
            
            # Run evaluation if requested
            if args.evaluate:
                print("\nRunning evaluation on synthetic data...")
                eval_metrics = matcher.evaluate_on_synthetic()
                
                print("Evaluation Results:")
                for metric, value in eval_metrics.items():
                    print(f"  {metric}: {value:.3f}")
                
                # Save evaluation metrics
                eval_file = os.path.join(args.save_dir, 'eval_metrics.json')
                with open(eval_file, 'w') as f:
                    json.dump(eval_metrics, f, indent=2)
                print(f"Evaluation metrics saved to {eval_file}")
            
            print(f"\nModel artifacts saved in: {args.save_dir}")
            print("You can now run the Flask app to serve the trained model")
            
        except Exception as e:
            print(f"Error during training: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()