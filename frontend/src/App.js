import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import StudentForm from './pages/StudentForm';
import CompanyForm from './pages/CompanyForm';
import StudentResults from './pages/StudentResults';
import AdminPanel from './pages/AdminPanel';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/student', label: 'Student Registration', icon: '🎓' },
    { path: '/company', label: 'Company Registration', icon: '🏢' },
    { path: '/results', label: 'View Results', icon: '📊' },
    { path: '/admin', label: 'Admin Panel', icon: '⚙️' }
  ];

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎯</span>
            <h1 className="text-xl font-bold">PM Internship Allocation</h1>
          </div>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-500 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student" element={<StudentForm />} />
            <Route path="/company" element={<CompanyForm />} />
            <Route path="/results" element={<StudentResults />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 AI-Based Smart Allocation Engine for PM Internship Scheme</p>
            <p className="text-gray-400 text-sm mt-2">
              Built with React, Flask, and Machine Learning
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
