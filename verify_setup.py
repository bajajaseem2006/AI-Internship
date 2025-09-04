#!/usr/bin/env python3
"""
Setup verification script for PM Internship Scheme
Run this after installing dependencies to verify everything is working
"""

import os
import sys
import json
import importlib.util

def check_file_exists(filepath, description):
    """Check if a file exists and report"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} - NOT FOUND")
        return False

def check_directory_structure():
    """Verify the project directory structure"""
    print("🏗️  Checking directory structure...")
    
    required_dirs = [
        "backend",
        "backend/data",
        "backend/models_artifacts", 
        "backend/tests",
        "backend/logs",
        "frontend",
        "frontend/src",
        "frontend/src/pages",
        "frontend/src/utils",
        "docs",
        "scripts",
        ".github/workflows"
    ]
    
    all_good = True
    for dir_path in required_dirs:
        if os.path.exists(dir_path):
            print(f"✅ Directory: {dir_path}")
        else:
            print(f"❌ Directory: {dir_path} - NOT FOUND")
            all_good = False
    
    return all_good

def check_backend_files():
    """Check backend files"""
    print("\n🔧 Checking backend files...")
    
    backend_files = [
        ("backend/app.py", "Flask application"),
        ("backend/config.py", "Configuration"),
        ("backend/models.py", "Database models"),
        ("backend/matcher.py", "ML matching engine"),
        ("backend/train_model.py", "Training script"),
        ("backend/run_inference.py", "Inference script"),
        ("backend/seed_db.py", "Database seeding"),
        ("backend/requirements.txt", "Python dependencies"),
        ("backend/Dockerfile", "Backend Docker config"),
        ("backend/Procfile", "Heroku deployment"),
        ("backend/data/small_students.json", "Sample student data"),
        ("backend/data/small_internships.json", "Sample internship data"),
        ("backend/data/generate_synthetic_data.py", "Data generator")
    ]
    
    all_good = True
    for filepath, description in backend_files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    return all_good

def check_frontend_files():
    """Check frontend files"""
    print("\n⚛️  Checking frontend files...")
    
    frontend_files = [
        ("frontend/package.json", "Node.js dependencies"),
        ("frontend/src/App.js", "Main React app"),
        ("frontend/src/utils/api.js", "API utilities"),
        ("frontend/src/pages/Home.jsx", "Home page"),
        ("frontend/src/pages/StudentForm.jsx", "Student form"),
        ("frontend/src/pages/CompanyForm.jsx", "Company form"),
        ("frontend/src/pages/StudentResults.jsx", "Results page"),
        ("frontend/src/pages/AdminPanel.jsx", "Admin panel"),
        ("frontend/tailwind.config.js", "TailwindCSS config"),
        ("frontend/Dockerfile", "Frontend Docker config"),
        ("frontend/.env.example", "Environment variables example")
    ]
    
    all_good = True
    for filepath, description in frontend_files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    return all_good

def check_deployment_files():
    """Check deployment and documentation files"""
    print("\n🚀 Checking deployment files...")
    
    deployment_files = [
        ("docker-compose.yml", "Docker Compose config"),
        ("scripts/dev_backend.sh", "Backend dev script"),
        ("scripts/dev_frontend.sh", "Frontend dev script"),
        (".github/workflows/ci.yml", "CI/CD pipeline"),
        ("README.md", "Main documentation"),
        ("docs/demo_steps.md", "Demo guide"),
        ("docs/report.pdf", "Technical report template")
    ]
    
    all_good = True
    for filepath, description in deployment_files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    return all_good

def check_sample_data():
    """Verify sample data files are valid JSON"""
    print("\n📊 Checking sample data...")
    
    try:
        with open("backend/data/small_students.json", 'r') as f:
            students = json.load(f)
        print(f"✅ Student data: {len(students)} students loaded")
        
        # Verify structure
        required_fields = ['id', 'name', 'email', 'skills', 'sector_interests', 'category']
        if all(field in students[0] for field in required_fields):
            print("✅ Student data structure is valid")
        else:
            print("❌ Student data missing required fields")
            return False
            
    except Exception as e:
        print(f"❌ Error loading student data: {e}")
        return False
    
    try:
        with open("backend/data/small_internships.json", 'r') as f:
            internships = json.load(f)
        print(f"✅ Internship data: {len(internships)} internships loaded")
        
        # Verify structure
        required_fields = ['id', 'company_name', 'title', 'required_skills', 'capacity']
        if all(field in internships[0] for field in required_fields):
            print("✅ Internship data structure is valid")
        else:
            print("❌ Internship data missing required fields")
            return False
            
    except Exception as e:
        print(f"❌ Error loading internship data: {e}")
        return False
    
    return True

def check_python_syntax():
    """Check Python files for syntax errors"""
    print("\n🐍 Checking Python syntax...")
    
    python_files = [
        "backend/app.py",
        "backend/models.py", 
        "backend/matcher.py",
        "backend/train_model.py",
        "backend/run_inference.py",
        "backend/seed_db.py",
        "backend/config.py"
    ]
    
    all_good = True
    for filepath in python_files:
        try:
            with open(filepath, 'r') as f:
                compile(f.read(), filepath, 'exec')
            print(f"✅ Syntax OK: {filepath}")
        except SyntaxError as e:
            print(f"❌ Syntax Error in {filepath}: {e}")
            all_good = False
        except Exception as e:
            print(f"❌ Error checking {filepath}: {e}")
            all_good = False
    
    return all_good

def main():
    """Main verification function"""
    print("🔍 PM Internship Scheme - Setup Verification")
    print("=" * 50)
    
    # Change to project root if we're not there
    if os.path.basename(os.getcwd()) != "workspace":
        if os.path.exists("workspace"):
            os.chdir("workspace")
        elif os.path.exists("../workspace"):
            os.chdir("../workspace")
    
    checks = [
        check_directory_structure(),
        check_backend_files(),
        check_frontend_files(), 
        check_deployment_files(),
        check_sample_data(),
        check_python_syntax()
    ]
    
    print("\n" + "=" * 50)
    if all(checks):
        print("🎉 ALL CHECKS PASSED!")
        print("\n✅ Your PM Internship Scheme system is ready!")
        print("\n📋 Next steps:")
        print("1. Install Python dependencies: cd backend && pip install -r requirements.txt")
        print("2. Install Node.js dependencies: cd frontend && npm install") 
        print("3. Run backend: cd backend && python app.py")
        print("4. Run frontend: cd frontend && npm start")
        print("5. Visit http://localhost:3000 to see the application")
        print("\n📖 See README.md for detailed setup instructions")
        return True
    else:
        print("❌ SOME CHECKS FAILED!")
        print("\n🔧 Please fix the issues above before proceeding")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)