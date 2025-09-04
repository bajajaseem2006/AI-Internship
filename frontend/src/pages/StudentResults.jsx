import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService, handleApiError } from '../utils/api';

const StudentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [matches, setMatches] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strategy, setStrategy] = useState('boost');
  const [k, setK] = useState(5);

  // Get student ID from URL params or form input
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlStudentId = urlParams.get('student_id');
    if (urlStudentId) {
      setStudentId(urlStudentId);
      fetchMatches(urlStudentId, k, strategy);
    }
  }, [location.search]);

  const fetchMatches = async (id, numMatches = 5, fairnessStrategy = 'boost') => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getStudentMatches(id, numMatches, fairnessStrategy);
      setMatches(response.data.matches);
      setStudentInfo({
        id: response.data.student_id,
        name: response.data.student_name,
        strategy: response.data.strategy_used
      });
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (studentId) {
      fetchMatches(studentId, k, strategy);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Fair Match';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Results</h1>
        <p className="text-gray-600 mb-6">
          View personalized internship matches based on AI-powered analysis
        </p>

        {/* Search Form */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="number"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter student ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Results
              </label>
              <select
                value={k}
                onChange={(e) => setK(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fairness Strategy
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="boost">Score Boost</option>
                <option value="quota">Quota Enforcement</option>
              </select>
            </div>
            
            <button
              onClick={handleSearch}
              disabled={!studentId || loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Get Matches'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Student Info */}
        {studentInfo && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-900">
              Results for: {studentInfo.name} (ID: {studentInfo.id})
            </h2>
            <p className="text-blue-700">
              Strategy used: {studentInfo.strategy === 'boost' ? 'Score Boost for Fairness' : 'Quota-based Allocation'}
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {matches.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Top {matches.length} Internship Matches
          </h2>
          
          {matches.map((match, index) => (
            <div key={match.internship_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{match.title}</h3>
                  </div>
                  <p className="text-lg text-primary-600 font-semibold">{match.company_name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span>🏢 {match.sector}</span>
                    <span>📍 {match.location}</span>
                    <span>👥 {match.capacity} positions</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.score)}`}>
                    {getScoreLabel(match.score)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {(match.score * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Match Score</div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{match.description}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Why this is a good match:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Skills alignment with your profile</li>
                    <li>• Sector matches your interests</li>
                    <li>• Location preference considered</li>
                    {match.quota_info && (
                      <li className="text-blue-600">• Eligible for {match.quota_info} quota consideration</li>
                    )}
                  </ul>
                </div>
                
                {match.quota_info && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">Quota Eligibility</div>
                    <div className="text-blue-700">{match.quota_info} Category</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Internship ID: {match.internship_id}
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && matches.length === 0 && studentId && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Matches Found</h2>
          <p className="text-yellow-700 mb-4">
            We couldn't find any internship matches for Student ID {studentId}.
          </p>
          <div className="text-sm text-yellow-600">
            <p>This could be because:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The student ID doesn't exist in the system</li>
              <li>No internships match the student's profile</li>
              <li>The ML model hasn't been trained yet</li>
            </ul>
          </div>
        </div>
      )}

      {/* Help Section */}
      {!studentId && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use This Page</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Students:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Enter your Student ID (received after registration)</li>
                <li>• Choose how many matches you want to see</li>
                <li>• Select fairness strategy preference</li>
                <li>• View your personalized internship matches</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding Results:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <span className="text-green-600">Excellent Match (80%+)</span>: Highly recommended</li>
                <li>• <span className="text-yellow-600">Good Match (60-79%)</span>: Strong potential</li>
                <li>• <span className="text-red-600">Fair Match (&lt;60%)</span>: Consider if interested</li>
                <li>• Quota eligibility shown when applicable</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/student')}
              className="bg-primary-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
            >
              Register as New Student
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResults;