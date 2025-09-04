import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, handleApiError, showSuccess, showError } from '../utils/api';

const StudentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    degree: '',
    year: 3,
    skills: [],
    location_pref: '',
    sector_interests: [],
    category: 'General',
    aspirational_district: false,
    past_internships: 0
  });

  const [skillInput, setSkillInput] = useState('');
  const [sectorInput, setSectorInput] = useState('');

  const categories = ['General', 'OBC', 'SC', 'ST', 'PwD'];
  const locations = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
    'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Remote'
  ];

  const commonSkills = [
    'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Machine Learning',
    'Data Science', 'C++', 'SQL', 'Django', 'Flask', 'HTML', 'CSS',
    'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker',
    'Git', 'Linux', 'Embedded Systems', 'VLSI', 'CAD', 'Robotics'
  ];

  const commonSectors = [
    'AI/ML', 'Data Science', 'Web Development', 'Mobile Development',
    'Backend Development', 'Frontend Development', 'Electronics', 'Hardware',
    'Embedded Systems', 'Robotics', 'Automobile', 'Software Testing',
    'DevOps', 'Cybersecurity', 'Database', 'Cloud Computing'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addSector = (sector) => {
    if (sector && !formData.sector_interests.includes(sector)) {
      setFormData(prev => ({
        ...prev,
        sector_interests: [...prev.sector_interests, sector]
      }));
    }
    setSectorInput('');
  };

  const removeSector = (sectorToRemove) => {
    setFormData(prev => ({
      ...prev,
      sector_interests: prev.sector_interests.filter(sector => sector !== sectorToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (formData.skills.length === 0) {
        throw new Error('Please add at least one skill');
      }
      if (formData.sector_interests.length === 0) {
        throw new Error('Please add at least one sector interest');
      }

      const response = await apiService.createStudent(formData);
      const studentId = response.data.student_id;
      
      setSuccess(`Student registered successfully! Student ID: ${studentId}`);
      showSuccess('Student registered successfully!');
      
      // Navigate to results page after a short delay
      setTimeout(() => {
        navigate(`/results?student_id=${studentId}`);
      }, 2000);
      
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      if (errorInfo.details.length > 0) {
        setError(`${errorInfo.message}: ${errorInfo.details.join(', ')}`);
      }
      showError(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Registration</h1>
        <p className="text-gray-600 mb-8">
          Register your profile to get matched with suitable internship opportunities
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            <strong>Success:</strong> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College/University *
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., IIT Delhi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree *
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., B.Tech CSE"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills * (Add your technical and professional skills)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Type a skill and press Enter"
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Sector Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector Interests * (Industries you want to work in)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.sector_interests.map((sector, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {sector}
                  <button
                    type="button"
                    onClick={() => removeSector(sector)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={sectorInput}
                onChange={(e) => setSectorInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSector(sectorInput);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Type a sector and press Enter"
              />
              <button
                type="button"
                onClick={() => addSector(sectorInput)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonSectors.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => addSector(sector)}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  + {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences and Demographics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Preference *
              </label>
              <select
                name="location_pref"
                value={formData.location_pref}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select location preference</option>
                {locations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Past Internships
              </label>
              <select
                name="past_internships"
                value={formData.past_internships}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={0}>0 - First internship</option>
                <option value={1}>1 - One previous internship</option>
                <option value={2}>2+ - Multiple internships</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="aspirational_district"
                checked={formData.aspirational_district}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                From Aspirational District
                <span className="block text-xs text-gray-500">
                  (Eligible for additional support under government schemes)
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </button>
            
            <button
              type="submit"
              disabled={loading || formData.skills.length === 0 || formData.sector_interests.length === 0}
              className="bg-primary-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Registering...' : 'Register & Find Matches'}
            </button>
          </div>
        </form>
      </div>

      {/* Information Panel */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">📋 Registration Tips</h2>
        <ul className="space-y-2 text-blue-800">
          <li>• Be specific about your skills - this helps our AI find better matches</li>
          <li>• Select multiple sector interests to explore diverse opportunities</li>
          <li>• Choose "Remote" as location preference for maximum flexibility</li>
          <li>• Accurate category selection ensures fair allocation consideration</li>
          <li>• After registration, you'll immediately see your top internship matches</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentForm;