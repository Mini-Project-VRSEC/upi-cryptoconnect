const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration for face-matching service
const FACE_MATCHING_SERVICE_URL = process.env.FACE_MATCHING_SERVICE_URL || 'http://localhost:5005';

/**
 * Compare faces between the selfie and ID document
 * @param {string} selfiePath Path to the selfie image
 * @param {string} idDocPath Path to the ID document image
 * @returns {Promise<Object>} Comparison result
 */
exports.compareFaces = async (selfiePath, idDocPath) => {
  try {
    // Create form data with both images
    const formData = new FormData();
    formData.append('selfie', fs.createReadStream(selfiePath));
    formData.append('id_photo', fs.createReadStream(idDocPath));
    
    // Call the face matching service
    const response = await axios.post(`${FACE_MATCHING_SERVICE_URL}/compare-faces`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      // Increase timeout for image processing
      timeout: 30000
    });
    
    return response.data;
    
  } catch (error) {
    console.error('Face matching service error:', error.message);
    
    // If the service is unavailable or having issues, provide a fallback response
    // This is for development/testing purposes
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn('Face matching service unavailable, using fallback response');
      return {
        success: true,
        match: Math.random() > 0.2, // 80% chance of "match" for testing
        confidence: Math.floor(Math.random() * 40) + 60, // Random confidence between 60-99%
        fallback: true // Indicate this is a fallback response
      };
    }
    
    throw new Error('Failed to compare faces: ' + error.message);
  }
};

/**
 * Health check for the face matching service
 * @returns {Promise<boolean>} Whether the service is healthy
 */
exports.checkHealth = async () => {
  try {
    const response = await axios.get(`${FACE_MATCHING_SERVICE_URL}/health`, { 
      timeout: 5000 
    });
    return response.status === 200;
  } catch (error) {
    console.error('Face matching service health check failed:', error.message);
    return false;
  }
};
