const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');

// Create a client for Google Cloud Vision API
// Note: You'll need to set up Google Cloud credentials in your environment
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS_PATH || path.join(__dirname, '../../config/google-vision-credentials.json')
});

/**
 * Extract information from an Aadhaar card image
 * @param {string} imagePath Path to the image file
 * @returns {Promise<Object>} Extracted information
 */
exports.extractAadhaarInfo = async (imagePath) => {
  try {
    // Read the image file
    const imageContent = fs.readFileSync(imagePath);
    
    // Perform text detection on the image
    const [result] = await client.textDetection({
      image: { content: imageContent }
    });
    
    const detections = result.textAnnotations;
    const fullText = detections.length > 0 ? detections[0].description : '';
    
    // Parse the extracted text to find Aadhaar details
    const aadhaarDetails = parseAadhaarText(fullText);
    
    return {
      success: true,
      data: aadhaarDetails
    };
  } catch (error) {
    console.error('Error extracting Aadhaar info:', error);
    return {
      success: false,
      error: 'Failed to extract information from Aadhaar card'
    };
  }
};

/**
 * Parse text to extract Aadhaar card information
 * @param {string} text The OCR extracted text
 * @returns {Object} Extracted Aadhaar details
 */
function parseAadhaarText(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Initialize the extracted data object
  const extractedData = {
    name: null,
    dob: null,
    gender: null,
    aadhaarNumber: null
  };
  
  // Find name (usually appears after "Name:")
  const namePattern = /(?:Name|नाम)\s*:\s*([\p{L}\s.]+)(?:\n|$)/u;
  const nameMatch = text.match(namePattern);
  if (nameMatch) {
    extractedData.name = nameMatch[1].trim();
  }
  
  // Find DOB (Date of Birth) - format could be DD/MM/YYYY or other variations
  const dobPattern = /(?:Date of Birth|DOB|जन्म तिथि|जन्मतिथि)\s*:\s*([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4})/i;
  const dobMatch = text.match(dobPattern);
  if (dobMatch) {
    extractedData.dob = dobMatch[1].trim();
  }
  
  // Find gender (Male/Female/Other)
  const genderPattern = /(?:MALE|FEMALE|पुरुष|महिला|MALE:)/i;
  const genderMatch = text.match(genderPattern);
  if (genderMatch) {
    extractedData.gender = genderMatch[0].trim().toUpperCase() === 'MALE' || 
                           genderMatch[0].trim().toUpperCase() === 'पुरुष' ? 'Male' : 'Female';
  }
  
  // Find Aadhaar number (12 digits, often with spaces or divided into groups)
  const aadhaarPattern = /\b(\d{4}\s?\d{4}\s?\d{4})\b/;
  const aadhaarMatch = text.match(aadhaarPattern);
  if (aadhaarMatch) {
    // Remove spaces from Aadhaar number
    extractedData.aadhaarNumber = aadhaarMatch[1].replace(/\s/g, '');
  }
  
  return extractedData;
}

/**
 * Extract information from a PAN card image
 * @param {string} imagePath Path to the image file
 * @returns {Promise<Object>} Extracted information
 */
exports.extractPANInfo = async (imagePath) => {
  try {
    // Implementation similar to Aadhaar extraction but for PAN card format
    // This is a placeholder for now
    return {
      success: true,
      data: {
        name: null,
        panNumber: null,
        dob: null
      }
    };
  } catch (error) {
    console.error('Error extracting PAN info:', error);
    return {
      success: false,
      error: 'Failed to extract information from PAN card'
    };
  }
};
