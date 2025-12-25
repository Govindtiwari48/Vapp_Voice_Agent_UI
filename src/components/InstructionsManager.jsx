import React, { useState, useEffect } from 'react';
import { 
  createInstructions, 
  getActiveInstructions, 
  getInstructionsList,
  deleteInstruction,
  deleteUserInstructions 
} from '../api';

const InstructionsManager = ({ onBack, onHome }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    greeting: '',
    system: '',
    isActive: true,
    version: '1.0.0'
  });
  
  // List state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [activeInstruction, setActiveInstruction] = useState(null);

  // Fetch active instruction and list
  useEffect(() => {
    fetchActiveInstruction();
    if (activeTab === 'list') {
      fetchInstructionsList();
    }
  }, [activeTab]);

  const fetchActiveInstruction = async () => {
    try {
      const response = await getActiveInstructions();
      if (response.success && response.data) {
        setActiveInstruction(response.data);
        // Pre-fill form with active instruction if it exists
        if (response.data) {
          setFormData({
            greeting: response.data.greeting || '',
            system: response.data.system || '',
            isActive: response.data.isActive || true,
            version: response.data.version || '1.0.0'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching active instruction:', err);
    }
  };

  const fetchInstructionsList = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await getInstructionsList({ page, limit });
      if (response) {
        setInstructions(response.instructions);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createInstructions(formData);
      // Refresh active instruction
      await fetchActiveInstruction();
      // Show success message
      alert('Instructions created successfully!');
      // Reset form
      setFormData({
        greeting: '',
        system: '',
        isActive: true,
        version: '1.0.0'
      });
    } catch (err) {
      setError(err.message || 'Failed to create instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (instructionId) => {
    if (window.confirm('Are you sure you want to delete this instruction set?')) {
      try {
        await deleteInstruction(instructionId);
        // Refresh list
        await fetchInstructionsList(pagination.currentPage, pagination.limit);
      } catch (err) {
        alert('Failed to delete instruction: ' + err.message);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL instruction sets? This action cannot be undone.')) {
      try {
        await deleteUserInstructions();
        // Refresh list
        await fetchInstructionsList(1, pagination.limit);
        setActiveInstruction(null);
      } catch (err) {
        alert('Failed to delete instructions: ' + err.message);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchInstructionsList(newPage, pagination.limit);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Instructions Management</h1>
            <button
              onClick={onHome}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m6-6h-6" />
              </svg>
            </button>
          </div>
          
          {/* Active instruction indicator */}
          {activeInstruction && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Active: {activeInstruction.greeting}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Instructions
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Instructions ({pagination.totalRecords})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' ? (
          <InstructionsForm 
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            activeInstruction={activeInstruction}
          />
        ) : (
          <InstructionsList
            instructions={instructions}
            pagination={pagination}
            loading={loading}
            error={error}
            onDelete={handleDelete}
            onDeleteAll={handleDeleteAll}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

// Create Instructions Form Component
const InstructionsForm = ({ formData, onChange, onSubmit, loading, error, activeInstruction }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold mb-4">Create New Instructions</h2>
    
    {error && (
      <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    )}

    {activeInstruction && (
      <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <p className="font-medium">Current Active Instructions:</p>
        <p className="mt-2"><strong>Greeting:</strong> {activeInstruction.greeting}</p>
        <p className="mt-1"><strong>System:</strong> {activeInstruction.system}</p>
      </div>
    )}

    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="greeting" className="block text-sm font-medium text-gray-700 mb-1">
          Greeting Message *
        </label>
        <input
          type="text"
          id="greeting"
          name="greeting"
          value={formData.greeting}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., नमस्ते! मैं आपकी निजी संपत्ति सलाहकार हूं"
        />
      </div>

      <div>
        <label htmlFor="system" className="block text-sm font-medium text-gray-700 mb-1">
          System Instructions *
        </label>
        <textarea
          id="system"
          name="system"
          value={formData.system}
          onChange={onChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., आप एक विशेषज्ञ संपत्ति सलाहकार हैं"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={onChange}
          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Mark as Active
        </label>
      </div>

      <div>
        <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
          Version
        </label>
        <input
          type="text"
          id="version"
          name="version"
          value={formData.version}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1.0.0"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Instructions'}
      </button>
    </form>
  </div>
);

// Instructions List Component
const InstructionsList = ({ instructions, pagination, loading, error, onDelete, onDeleteAll, onPageChange }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Instructions</h2>
          {instructions.length > 0 && (
            <button
              onClick={onDeleteAll}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {instructions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No instructions found. Create your first instruction set.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {instructions.map((instruction) => (
            <div key={instruction._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {instruction.greeting}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {instruction.system}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      instruction.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {instruction.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-500">Version: {instruction.version}</span>
                    {instruction.createdAt && (
                      <span className="text-gray-500">
                        Created: {new Date(instruction.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(instruction._id)}
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                {pagination.currentPage}
              </span>
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructionsManager;