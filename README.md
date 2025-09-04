# AI-Based Smart Allocation Engine for PM Internship Scheme

A complete, production-ready web application that uses machine learning to intelligently match students with internship opportunities while ensuring fair allocation through reservation quotas and bias-aware algorithms.

![System Architecture](https://img.shields.io/badge/Architecture-Full%20Stack%20ML-blue)
![Python](https://img.shields.io/badge/Python-3.11-green)
![React](https://img.shields.io/badge/React-18-blue)
![Flask](https://img.shields.io/badge/Flask-2.3-red)
![ML](https://img.shields.io/badge/ML-Scikit--Learn-orange)

## 🎯 Features

### Core Functionality
- **AI-Powered Matching**: Advanced ML algorithms using TF-IDF, cosine similarity, and optional LightGBM
- **Fair Allocation**: Implements reservation quotas (SC/ST/OBC/PwD) and bias-aware scoring
- **Real-time API**: RESTful backend with comprehensive validation and error handling
- **Modern UI**: Responsive React frontend with TailwindCSS styling
- **Scalable Architecture**: Supports small pilots to nationwide implementations

### Technical Highlights
- **Multi-Model Support**: Similarity-based and supervised learning approaches
- **Fairness Strategies**: Quota enforcement and score boosting for underrepresented groups
- **Production Ready**: Docker deployment, CI/CD pipeline, comprehensive testing
- **Database Flexibility**: SQLite for development, PostgreSQL for production
- **Performance Optimized**: Vectorized operations, caching, and efficient algorithms

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Local Development Setup

1. **Clone and Setup Backend**
   ```bash
   # Backend setup
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   cd backend
   pip install -r requirements.txt
   
   # Set environment variables
   export ADMIN_API_KEY=admin123
   export SECRET_KEY=dev-secret-key
   export DATABASE_URL=sqlite:///app.db
   
   # Initialize database and seed with sample data
   python seed_db.py --create-tables --students data/small_students.json --internships data/small_internships.json
   
   # Train the ML model
   python train_model.py --model_type similarity
   
   # Start backend server
   python app.py
   ```

2. **Setup Frontend**
   ```bash
   # In a new terminal
   cd frontend
   npm install
   
   # Set environment variables
   cp .env.example .env
   # Edit .env if needed
   
   # Start frontend server
   npm start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin (use admin key: `admin123`)

### Using Development Scripts

```bash
# Start backend (handles setup automatically)
./scripts/dev_backend.sh

# Start frontend (in another terminal)
./scripts/dev_frontend.sh
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Access application at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## 📊 Demo Walkthrough

### 1. Seed Database
- Go to Admin Panel → Data Management
- Click "Seed Database" to load sample data (5 students, 5 internships)

### 2. Train Model
- Go to Admin Panel → Model Training
- Select "Similarity-based" model type
- Click "Train Model"

### 3. Student Registration & Matching
- Go to Student Registration
- Fill out the form (or use provided sample data)
- View personalized matches with scores and fairness considerations

### 4. Company Registration
- Go to Company Registration
- Post internship opportunities with skill requirements and quotas

### 5. Batch Allocation
- Go to Admin Panel → Batch Allocation
- Run allocation with chosen fairness strategy
- View allocation results and quota fulfillment