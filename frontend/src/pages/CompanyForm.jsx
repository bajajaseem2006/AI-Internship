import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, handleApiError, showSuccess, showError } from '../utils/api';

const CompanyForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    sector: '',
    title: '',
    description: '',
    required_skills: [],
    location: '',
    capacity: 1,
    reservation_quota: {
      SC: 0,
      ST: 0,
      OBC: 0,
      PwD: 0
    }
  });

  const [skillInput, setSkillInput] = useState('');

  const sectors = [
    'AI/ML', 'Data Science', 'Web Development', 'Mobile Development',
    'Backend Development', 'Frontend Development', 'Full Stack Development',
    'Electronics', 'Hardware', 'Embedded Systems', 'VLSI', 'Robotics',
    'Automobile', 'Manufacturing', 'Civil Engineering', 'Mechanical Engineering',
    'Software Testing', 'DevOps', 'Cloud Computing', 'Cybersecurity',
    'Database', 'Networking', 'Business Analysis', 'Digital Marketing',
    'Finance', 'Consulting', 'Research', 'Product Management'
  ];

  const locations = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
    'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
    'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Coimbatore', 'Remote'
  ];

  const commonSkills = [
    'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Machine Learning',
    'Data Science', 'C++', 'SQL', 'Django', 'Flask', 'HTML', 'CSS',
    'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker',
    'Git', 'Linux', 'Embedded Systems', 'VLSI', 'CAD', 'Robotics',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleQuotaChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      reservation_quota: {
        ...prev.reservation_quota,
        [category]: parseInt(value) || 0
      }
    }));
  };

  const addSkill = (skill) => {
    if (skill && !formData.required_skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const autoFillQuota = () => {
    const capacity = formData.capacity;
    const autoQuota = {
      SC: Math.max(0, Math.floor(capacity * 0.10)),
      ST: Math.max(0, Math.floor(capacity * 0.05)),
      OBC: Math.max(0, Math.floor(capacity * 0.15)),
      PwD: Math.max(0, Math.floor(capacity * 0.02))
    };
    
    setFormData(prev => ({
      ...prev,
      reservation_quota: autoQuota
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (formData.required_skills.length === 0) {
        throw new Error('Please add at least one required skill');
      }

      const response = await apiService.createInternship(formData);
      const internshipId = response.data.internship_id;
      
      setSuccess(`Internship posted successfully! Internship ID: ${internshipId}`);
      showSuccess('Internship posted successfully!');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          company_name: '',
          email: '',
          sector: '',
          title: '',
          description: '',
          required_skills: [],
          location: '',
          capacity: 1,
          reservation_quota: { SC: 0, ST: 0, OBC: 0, PwD: 0 }
        });
        setSuccess('');
      }, 3000);
      
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

  const totalQuotaSlots = Object.values(formData.reservation_quota).reduce((sum, val) => sum + val, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Registration</h1>
        <p className="text-gray-600 mb-8">
          Post internship opportunities and connect with talented students
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
          {/* Company Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Tata Consultancy Services"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HR Contact Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="hr@company.com"
              />
            </div>
          </div>

          {/* Internship Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select sector</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internship Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Software Developer Intern"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the internship role, responsibilities, and learning opportunities..."
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills * (Skills needed for this internship)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.required_skills.map((skill, index) => (
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

          {/* Location and Capacity */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Number of intern positions"
              />
            </div>
          </div>

          {/* Reservation Quota */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Reservation Quota (Optional)
              </label>
              <button
                type="button"
                onClick={autoFillQuota}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Auto-fill Standard Quota
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.reservation_quota).map(([category, value]) => (
                <div key={category}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {category} ({category === 'SC' ? 'Scheduled Caste' : 
                              category === 'ST' ? 'Scheduled Tribe' :
                              category === 'OBC' ? 'Other Backward Class' :
                              'Persons with Disabilities'})
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleQuotaChange(category, e.target.value)}
                    min="0"
                    max={formData.capacity}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Reserved slots: {totalQuotaSlots} / {formData.capacity} total capacity
              {totalQuotaSlots > formData.capacity && (
                <span className="text-red-600 ml-2">⚠️ Reserved slots exceed capacity!</span>
              )}
            </p>
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
              disabled={loading || formData.required_skills.length === 0 || totalQuotaSlots > formData.capacity}
              className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Posting...' : 'Post Internship'}
            </button>
          </div>
        </form>
      </div>

      {/* Information Panel */}
      <div className="mt-8 bg-green-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">💡 Posting Tips</h2>
        <ul className="space-y-2 text-green-800">
          <li>• Clearly describe the role and learning opportunities</li>
          <li>• List specific skills that are truly required for the internship</li>
          <li>• Set realistic capacity based on your mentoring capabilities</li>
          <li>• Use standard reservation quotas to promote diversity and inclusion</li>
          <li>• Consider offering remote positions for wider talent access</li>
        </ul>
      </div>
    </div>
  );
};

export default CompanyForm;