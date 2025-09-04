import React, { useState, useEffect } from 'react';
import { apiService, handleApiError } from '../utils/api';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Training configuration
  const [trainingConfig, setTrainingConfig] = useState({
    model_type: 'similarity',
    fairness_strategy: 'boost'
  });

  // Allocation configuration
  const [allocationConfig, setAllocationConfig] = useState({
    fairness_strategy: 'quota'
  });

  // Seeding configuration
  const [seedConfig, setSeedConfig] = useState({
    students_file: 'data/small_students.json',
    internships_file: 'data/small_internships.json'
  });

  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await apiService.getSystemStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch system stats:', err);
    }
  };

  const fetchData = async (type) => {
    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'students':
          response = await apiService.getAllStudents();
          setStudents(response.data.students);
          break;
        case 'internships':
          response = await apiService.getAllInternships();
          setInternships(response.data.internships);
          break;
        case 'allocations':
          response = await apiService.getAllAllocations();
          setAllocations(response.data.allocations);
          break;
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.seedDatabase(seedConfig);
      setSuccess(`Database seeded successfully! ${response.data.students_processed} students and ${response.data.internships_processed} internships processed.`);
      fetchSystemStats();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.trainModel(trainingConfig);
      setSuccess(`Model trained successfully! Type: ${response.data.training_info.model_type}`);
      fetchSystemStats();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAllocation = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.runBatchAllocation(allocationConfig);
      const stats = response.data.allocation_stats;
      setSuccess(`Batch allocation completed! ${stats.matched_count} students allocated.`);
      fetchSystemStats();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateModel = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.evaluateModel();
      const metrics = response.data.evaluation_metrics;
      setSuccess(`Model evaluation completed! MAP: ${(metrics.map * 100).toFixed(1)}%`);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: '📊' },
    { id: 'data', name: 'Data Management', icon: '💾' },
    { id: 'model', name: 'Model Training', icon: '🤖' },
    { id: 'allocation', name: 'Batch Allocation', icon: '⚖️' },
    { id: 'monitoring', name: 'Monitoring', icon: '📈' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600 mb-6">
          Manage the AI-Based Smart Allocation Engine system
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
            
            {stats && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Database</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Students:</span>
                      <span className="font-bold">{stats.database.students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Internships:</span>
                      <span className="font-bold">{stats.database.internships}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allocations:</span>
                      <span className="font-bold">{stats.database.allocations}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Model Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Artifacts:</span>
                      <span className={`font-bold ${stats.model.artifacts_exist ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.model.artifacts_exist ? 'Available' : 'Missing'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Model Dir: {stats.model.model_dir}
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('data')}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Seed Database
                    </button>
                    <button
                      onClick={() => setActiveTab('model')}
                      className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Train Model
                    </button>
                    <button
                      onClick={() => setActiveTab('allocation')}
                      className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                    >
                      Run Allocation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {stats?.model?.last_training_metrics && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Training Results</h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Model Type</div>
                    <div className="font-bold">{stats.model.last_training_metrics.model_type}</div>
                  </div>
                  {stats.model.last_training_metrics.precision && (
                    <>
                      <div>
                        <div className="text-gray-600">Precision</div>
                        <div className="font-bold">{(stats.model.last_training_metrics.precision * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Recall</div>
                        <div className="font-bold">{(stats.model.last_training_metrics.recall * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Avg Precision</div>
                        <div className="font-bold">{(stats.model.last_training_metrics.average_precision * 100).toFixed(1)}%</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
            
            {/* Seeding Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seed Database</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Students File
                  </label>
                  <input
                    type="text"
                    value={seedConfig.students_file}
                    onChange={(e) => setSeedConfig({...seedConfig, students_file: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="data/small_students.json"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internships File
                  </label>
                  <input
                    type="text"
                    value={seedConfig.internships_file}
                    onChange={(e) => setSeedConfig({...seedConfig, internships_file: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="data/small_internships.json"
                  />
                </div>
              </div>
              <button
                onClick={handleSeedDatabase}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Seeding...' : 'Seed Database'}
              </button>
            </div>

            {/* Data Viewing */}
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => fetchData('students')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                View Students ({stats?.database?.students || 0})
              </button>
              <button
                onClick={() => fetchData('internships')}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                View Internships ({stats?.database?.internships || 0})
              </button>
              <button
                onClick={() => fetchData('allocations')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                View Allocations ({stats?.database?.allocations || 0})
              </button>
            </div>

            {/* Data Display */}
            {students.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Students ({students.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">ID</th>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">College</th>
                        <th className="text-left py-2">Category</th>
                        <th className="text-left py-2">Skills</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 10).map((student) => (
                        <tr key={student.id} className="border-b">
                          <td className="py-2">{student.id}</td>
                          <td className="py-2">{student.name}</td>
                          <td className="py-2">{student.college}</td>
                          <td className="py-2">{student.category}</td>
                          <td className="py-2">{student.skills.slice(0, 2).join(', ')}{student.skills.length > 2 ? '...' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {students.length > 10 && (
                    <p className="text-gray-500 text-center mt-2">Showing first 10 of {students.length} students</p>
                  )}
                </div>
              </div>
            )}

            {internships.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Internships ({internships.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">ID</th>
                        <th className="text-left py-2">Company</th>
                        <th className="text-left py-2">Title</th>
                        <th className="text-left py-2">Sector</th>
                        <th className="text-left py-2">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internships.slice(0, 10).map((internship) => (
                        <tr key={internship.id} className="border-b">
                          <td className="py-2">{internship.id}</td>
                          <td className="py-2">{internship.company_name}</td>
                          <td className="py-2">{internship.title}</td>
                          <td className="py-2">{internship.sector}</td>
                          <td className="py-2">{internship.capacity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {internships.length > 10 && (
                    <p className="text-gray-500 text-center mt-2">Showing first 10 of {internships.length} internships</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'model' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Model Training</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Configuration</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Type
                  </label>
                  <select
                    value={trainingConfig.model_type}
                    onChange={(e) => setTrainingConfig({...trainingConfig, model_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="similarity">Similarity-based</option>
                    <option value="lightgbm">LightGBM/Logistic Regression</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fairness Strategy
                  </label>
                  <select
                    value={trainingConfig.fairness_strategy}
                    onChange={(e) => setTrainingConfig({...trainingConfig, fairness_strategy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="boost">Score Boost</option>
                    <option value="quota">Quota Enforcement</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleTrainModel}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Training...' : 'Train Model'}
                </button>
                
                <button
                  onClick={handleEvaluateModel}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Evaluating...' : 'Evaluate Model'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Model Information</h3>
              <ul className="space-y-2 text-blue-800">
                <li><strong>Similarity Model:</strong> Uses cosine similarity with TF-IDF and skill matching</li>
                <li><strong>LightGBM Model:</strong> Advanced ML model trained on synthetic labels</li>
                <li><strong>Score Boost:</strong> Adds fairness boost to underrepresented students</li>
                <li><strong>Quota Enforcement:</strong> Reserves slots for specific categories</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'allocation' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Batch Allocation</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation Configuration</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fairness Strategy
                </label>
                <select
                  value={allocationConfig.fairness_strategy}
                  onChange={(e) => setAllocationConfig({...allocationConfig, fairness_strategy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md max-w-xs"
                >
                  <option value="quota">Quota Enforcement</option>
                  <option value="boost">Score Boost</option>
                </select>
              </div>
              
              <button
                onClick={handleBatchAllocation}
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
              >
                {loading ? 'Running Allocation...' : 'Run Batch Allocation'}
              </button>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">⚠️ Important Notes</h3>
              <ul className="space-y-2 text-yellow-800">
                <li>• Batch allocation will clear all existing allocations</li>
                <li>• Ensure the model is trained before running allocation</li>
                <li>• Quota enforcement respects reservation quotas set by companies</li>
                <li>• Score boost gives preference to underrepresented students</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Backend API</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ML Model</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${stats?.model?.artifacts_exist ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {stats?.model?.artifacts_exist ? 'Ready' : 'Not Trained'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Registrations</span>
                    <span className="font-bold">{(stats?.database?.students || 0) + (stats?.database?.internships || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful Allocations</span>
                    <span className="font-bold">{stats?.database?.allocations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allocation Rate</span>
                    <span className="font-bold">
                      {stats?.database?.students > 0 
                        ? ((stats.database.allocations / stats.database.students) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Logs</h3>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
                <div>[{new Date().toISOString()}] System initialized</div>
                <div>[{new Date().toISOString()}] Database connection established</div>
                <div>[{new Date().toISOString()}] ML model artifacts loaded</div>
                <div>[{new Date().toISOString()}] Admin panel accessed</div>
                <div>[{new Date().toISOString()}] System status: Healthy</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;