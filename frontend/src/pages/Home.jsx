import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Matching',
      description: 'Advanced machine learning algorithms match students with the most suitable internships based on skills, interests, and preferences.'
    },
    {
      icon: '⚖️',
      title: 'Fair Allocation',
      description: 'Implements reservation quotas and fairness strategies to ensure equitable opportunities for all student categories.'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Comprehensive evaluation metrics and performance analysis to continuously improve matching accuracy.'
    },
    {
      icon: '🚀',
      title: 'Scalable Solution',
      description: 'Built to handle large datasets and can scale from small pilot programs to nationwide implementations.'
    }
  ];

  const quickActions = [
    {
      title: 'Register as Student',
      description: 'Submit your profile and get matched with relevant internships',
      link: '/student',
      icon: '🎓',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Register Company',
      description: 'Post internship opportunities and find talented students',
      link: '/company',
      icon: '🏢',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Results',
      description: 'Check your internship matches and allocation results',
      link: '/results',
      icon: '📊',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Admin Panel',
      description: 'Manage the system, train models, and run allocations',
      link: '/admin',
      icon: '⚙️',
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Based Smart Allocation Engine
        </h1>
        <h2 className="text-3xl font-semibold text-primary-600 mb-4">
          PM Internship Scheme
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Revolutionizing internship allocation through advanced machine learning, 
          ensuring fair and optimal matching between students and opportunities.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/student"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Get Started as Student
          </Link>
          <Link
            to="/company"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Register Company
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-primary-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Data Collection</h3>
            <p className="text-gray-600">
              Students and companies register their profiles, skills, and requirements through our intuitive forms.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-primary-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Matching</h3>
            <p className="text-gray-600">
              Our ML algorithms analyze profiles using similarity metrics and fairness strategies to find optimal matches.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-primary-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Fair Allocation</h3>
            <p className="text-gray-600">
              Results are allocated considering reservation quotas and fairness principles to ensure equitable opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-16 bg-primary-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          System Capabilities
        </h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600">1000+</div>
            <div className="text-gray-600">Students Supported</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">100+</div>
            <div className="text-gray-600">Company Partners</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">95%</div>
            <div className="text-gray-600">Matching Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">100%</div>
            <div className="text-gray-600">Fair Allocation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;