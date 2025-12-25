import React, { useState } from 'react';
import { createInstructions } from '../api';

const InstructionsForm = () => {
  const [formData, setFormData] = useState({
    greeting: '',
    system: '',
    isActive: true,
    version: '1.0.0'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
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
    setSuccess(false);

    try {
      await createInstructions(formData);
      setSuccess(true);
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Instructions</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Instructions created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="greeting" className="block text-sm font-medium text-gray-700 mb-1">
            Greeting Message *
          </label>
          <input
            type="text"
            id="greeting"
            name="greeting"
            value={formData.greeting}
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active
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
            onChange={handleChange}
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
};

export default InstructionsForm;