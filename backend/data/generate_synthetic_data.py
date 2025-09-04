#!/usr/bin/env python3
"""
Synthetic data generator for PM Internship Scheme
Usage: python generate_synthetic_data.py --students 1000 --internships 100
"""

import json
import random
import numpy as np
import argparse
from typing import List, Dict, Any

# Set deterministic seeds for reproducibility
random.seed(42)
np.random.seed(42)

# Realistic skill vocabulary (~120 skills)
SKILLS_VOCABULARY = [
    # Programming Languages
    "Python", "Java", "C++", "JavaScript", "C", "C#", "Go", "Rust", "Swift", "Kotlin",
    "TypeScript", "PHP", "Ruby", "Scala", "R", "MATLAB", "Perl", "Shell Scripting",
    
    # Web Technologies
    "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring Boot",
    "ASP.NET", "Laravel", "Ruby on Rails", "HTML", "CSS", "Bootstrap", "Tailwind CSS",
    
    # Database & Data
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Apache Kafka",
    "Data Analysis", "Data Science", "Machine Learning", "Deep Learning", "TensorFlow",
    "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Apache Spark", "Hadoop", "ETL",
    
    # Cloud & DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub",
    "GitLab", "CI/CD", "Terraform", "Ansible", "Linux", "Unix", "Bash",
    
    # Mobile Development
    "Android", "iOS", "React Native", "Flutter", "Xamarin", "Ionic",
    
    # AI/ML Specific
    "Natural Language Processing", "Computer Vision", "Neural Networks", "Statistical Analysis",
    "Data Mining", "Big Data", "Business Intelligence", "Tableau", "Power BI",
    
    # Engineering & Technical
    "Embedded Systems", "VLSI", "Circuit Design", "PCB Design", "Microcontrollers",
    "FPGA", "Signal Processing", "Digital Signal Processing", "Control Systems",
    "Robotics", "Automation", "CAD", "SolidWorks", "AutoCAD", "CATIA",
    
    # Mechanical & Manufacturing
    "Mechanical Design", "Thermodynamics", "Fluid Mechanics", "Heat Transfer",
    "Manufacturing Processes", "Quality Control", "Six Sigma", "Lean Manufacturing",
    
    # Electronics & Communication
    "Analog Electronics", "Digital Electronics", "Communication Systems", "RF Design",
    "Antenna Design", "Wireless Communication", "Optical Communication", "Networking",
    
    # Software Engineering
    "Software Testing", "Test Automation", "Agile", "Scrum", "Software Architecture",
    "Design Patterns", "Microservices", "API Development", "REST APIs", "GraphQL",
    
    # Business & Analytics
    "Business Analysis", "Project Management", "Digital Marketing", "SEO", "Content Writing",
    "Market Research", "Financial Analysis", "Accounting", "Operations Research"
]

# College names for diversity
COLLEGES = [
    "IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kanpur", "IIT Kharagpur", "IIT Roorkee",
    "IIT Guwahati", "IIT Hyderabad", "IIIT Hyderabad", "IIIT Bangalore", "IIIT Delhi",
    "NIT Trichy", "NIT Warangal", "NIT Surathkal", "NIT Calicut", "NIT Rourkela",
    "Delhi University", "Mumbai University", "Pune University", "Anna University",
    "VIT Vellore", "SRM University", "Manipal Institute", "BITS Pilani", "DTU Delhi",
    "Jadavpur University", "BHU Varanasi", "Jamia Millia Islamia", "AMU Aligarh"
]

DEGREES = [
    "B.Tech CSE", "B.Tech ECE", "B.Tech ME", "B.Tech CE", "B.Tech EE", "B.Tech IT",
    "B.Sc IT", "B.Sc Computer Science", "B.E CSE", "B.E ECE", "B.E ME", "BCA", "MCA"
]

LOCATIONS = [
    "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata",
    "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore",
    "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Coimbatore", "Remote"
]

SECTORS = [
    "AI/ML", "Data Science", "Web Development", "Mobile Development", "Backend Development",
    "Frontend Development", "Full Stack Development", "DevOps", "Cloud Computing",
    "Electronics", "Hardware", "Embedded Systems", "VLSI", "Robotics", "Automation",
    "Mechanical Engineering", "Automobile", "Manufacturing", "Civil Engineering",
    "Software Testing", "Cybersecurity", "Networking", "Database", "Business Analysis",
    "Digital Marketing", "Finance", "Consulting", "Research", "Product Management"
]

COMPANY_NAMES = [
    "Tata Consultancy Services", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra",
    "Accenture", "IBM India", "Microsoft India", "Google India", "Amazon India",
    "Flipkart", "Paytm", "Ola", "Uber India", "Swiggy", "Zomato", "BYJU'S",
    "Qualcomm India", "Intel India", "Samsung India", "LG Electronics", "Sony India",
    "Tata Motors", "Mahindra & Mahindra", "Bajaj Auto", "Hero MotoCorp", "Maruti Suzuki",
    "L&T", "Reliance Industries", "ONGC", "NTPC", "BHEL", "DRDO", "ISRO",
    "Deloitte", "PwC", "EY", "KPMG", "McKinsey", "BCG", "Bain & Company"
]

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Aadhya", "Ananya", "Diya", "Aarohi", "Aanya", "Pari", "Fatima", "Ira", "Priya", "Kavya",
    "Rahul", "Rohit", "Amit", "Suresh", "Rajesh", "Vikram", "Ankit", "Deepak", "Manoj", "Santosh",
    "Meena", "Sunita", "Kavita", "Rekha", "Pooja", "Neha", "Swati", "Ritu", "Sonia", "Geeta"
]

LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Agarwal", "Tiwari", "Mishra", "Jain", "Bansal", "Singhal",
    "Yadav", "Kumar", "Singh", "Patel", "Shah", "Mehta", "Joshi", "Desai", "Modi",
    "Reddy", "Rao", "Naidu", "Chandra", "Prasad", "Murthy", "Iyer", "Nair", "Pillai",
    "Khan", "Ahmed", "Ali", "Hassan", "Hussain", "Ansari", "Qureshi", "Siddiqui"
]

def generate_student_data(num_students: int) -> List[Dict[str, Any]]:
    """Generate synthetic student data"""
    students = []
    
    # Category distribution: General 68%, OBC 15%, SC 10%, ST 5%, PwD 2%
    category_weights = [0.68, 0.15, 0.10, 0.05, 0.02]
    categories = ["General", "OBC", "SC", "ST", "PwD"]
    
    for i in range(1, num_students + 1):
        # Generate basic info
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        name = f"{first_name} {last_name}"
        email = f"{first_name.lower()}.{last_name.lower()}@example.com"
        
        # Academic info
        college = random.choice(COLLEGES)
        degree = random.choice(DEGREES)
        year = random.randint(2, 4)
        
        # Skills (2-6 skills per student)
        num_skills = random.randint(2, 6)
        skills = random.sample(SKILLS_VOCABULARY, num_skills)
        
        # Location and interests
        location_pref = random.choice(LOCATIONS)
        num_interests = random.randint(1, 3)
        sector_interests = random.sample(SECTORS, num_interests)
        
        # Category and demographics
        category = np.random.choice(categories, p=category_weights)
        aspirational_district = random.random() < 0.1  # ~10%
        past_internships = random.choices([0, 1, 2], weights=[0.7, 0.25, 0.05])[0]
        
        student = {
            "id": i,
            "name": name,
            "email": email,
            "college": college,
            "degree": degree,
            "year": year,
            "skills": skills,
            "location_pref": location_pref,
            "sector_interests": sector_interests,
            "category": category,
            "aspirational_district": aspirational_district,
            "past_internships": past_internships
        }
        students.append(student)
    
    return students

def generate_internship_data(num_internships: int) -> List[Dict[str, Any]]:
    """Generate synthetic internship data"""
    internships = []
    
    for i in range(101, 101 + num_internships):
        company_name = random.choice(COMPANY_NAMES)
        sector = random.choice(SECTORS)
        
        # Generate title based on sector
        title_templates = {
            "AI/ML": ["AI Intern", "ML Engineer Intern", "Data Scientist Intern"],
            "Data Science": ["Data Analyst Intern", "Data Science Intern", "Business Analyst Intern"],
            "Web Development": ["Web Developer Intern", "Full Stack Intern", "Frontend Intern"],
            "Backend Development": ["Backend Developer Intern", "API Developer Intern", "Server Engineer Intern"],
            "Mobile Development": ["Android Developer Intern", "iOS Developer Intern", "Mobile App Intern"],
            "Electronics": ["Electronics Intern", "Hardware Engineer Intern", "Circuit Design Intern"],
            "VLSI": ["VLSI Design Intern", "Chip Design Intern", "Digital Design Intern"],
            "Robotics": ["Robotics Intern", "Automation Engineer Intern", "Control Systems Intern"],
            "DevOps": ["DevOps Intern", "Cloud Engineer Intern", "Infrastructure Intern"],
            "Cybersecurity": ["Security Analyst Intern", "Cybersecurity Intern", "InfoSec Intern"]
        }
        
        if sector in title_templates:
            title = random.choice(title_templates[sector])
        else:
            title = f"{sector} Intern"
        
        # Generate description
        descriptions = [
            f"Work on cutting-edge {sector.lower()} projects and gain hands-on experience.",
            f"Join our team to develop innovative {sector.lower()} solutions.",
            f"Learn and contribute to {sector.lower()} initiatives in a collaborative environment.",
            f"Gain practical experience in {sector.lower()} while working on real-world problems.",
            f"Develop skills in {sector.lower()} through mentorship and project work."
        ]
        description = random.choice(descriptions)
        
        # Required skills (2-5 skills)
        # Filter skills relevant to the sector
        relevant_skills = [skill for skill in SKILLS_VOCABULARY 
                          if any(keyword in skill.lower() or keyword in sector.lower() 
                                for keyword in skill.lower().split())]
        if not relevant_skills:
            relevant_skills = SKILLS_VOCABULARY
        
        num_req_skills = random.randint(2, 5)
        required_skills = random.sample(relevant_skills[:min(20, len(relevant_skills))], 
                                      min(num_req_skills, len(relevant_skills)))
        
        # Location and capacity
        location = random.choice(LOCATIONS)
        capacity = random.randint(1, 10)
        
        # Reservation quota (default reasonable values)
        # 10% SC, 5% ST, 15% OBC, 2% PwD rounded to capacity
        quota = {
            "SC": max(0, int(capacity * 0.10)),
            "ST": max(0, int(capacity * 0.05)),
            "OBC": max(0, int(capacity * 0.15)),
            "PwD": max(0, int(capacity * 0.02))
        }
        
        internship = {
            "id": i,
            "company_name": company_name,
            "email": f"hr@{company_name.lower().replace(' ', '').replace('&', '')}.com",
            "sector": sector,
            "title": title,
            "description": description,
            "required_skills": required_skills,
            "location": location,
            "capacity": capacity,
            "reservation_quota": quota
        }
        internships.append(internship)
    
    return internships

def main():
    parser = argparse.ArgumentParser(description='Generate synthetic data for PM Internship Scheme')
    parser.add_argument('--students', type=int, default=100, help='Number of students to generate')
    parser.add_argument('--internships', type=int, default=20, help='Number of internships to generate')
    parser.add_argument('--output_dir', type=str, default='.', help='Output directory for generated files')
    
    args = parser.parse_args()
    
    print(f"Generating {args.students} students and {args.internships} internships...")
    print("Using deterministic seed (42) for reproducibility")
    
    # Generate data
    students = generate_student_data(args.students)
    internships = generate_internship_data(args.internships)
    
    # Save to files
    students_file = f"{args.output_dir}/students_{args.students}.json"
    internships_file = f"{args.output_dir}/internships_{args.internships}.json"
    
    with open(students_file, 'w') as f:
        json.dump(students, f, indent=2)
    
    with open(internships_file, 'w') as f:
        json.dump(internships, f, indent=2)
    
    # Also save small versions for quick testing
    small_students_file = f"{args.output_dir}/small_students.json"
    small_internships_file = f"{args.output_dir}/small_internships.json"
    
    with open(small_students_file, 'w') as f:
        json.dump(students[:5], f, indent=2)
    
    with open(small_internships_file, 'w') as f:
        json.dump(internships[:5], f, indent=2)
    
    print(f"Generated files:")
    print(f"  - {students_file} ({len(students)} students)")
    print(f"  - {internships_file} ({len(internships)} internships)")
    print(f"  - {small_students_file} (5 students for testing)")
    print(f"  - {small_internships_file} (5 internships for testing)")
    
    # Print some statistics
    categories = [s['category'] for s in students]
    category_counts = {cat: categories.count(cat) for cat in set(categories)}
    aspirational_count = sum(1 for s in students if s['aspirational_district'])
    
    print(f"\nStudent Statistics:")
    print(f"  Category distribution: {category_counts}")
    print(f"  Aspirational district: {aspirational_count} ({aspirational_count/len(students)*100:.1f}%)")
    
    total_capacity = sum(i['capacity'] for i in internships)
    print(f"\nInternship Statistics:")
    print(f"  Total capacity: {total_capacity}")
    print(f"  Average capacity per internship: {total_capacity/len(internships):.1f}")

if __name__ == "__main__":
    main()