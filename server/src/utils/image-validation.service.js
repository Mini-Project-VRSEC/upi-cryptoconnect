const sharp = require('sharp');
const fs = require('fs');

/**
 * Validates an image for KYC requirements
 * @param {string} imagePath Path to the image file
 * @param {string} documentType Type of document ('aadhar' or 'pan')
 * @returns {Promise<Object>} Validation results
 */
exports.validateKycImage = async (imagePath, documentType) => {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return {
        valid: false,
        reasons: ['File not found']
      };
    }

    // Get image metadata using Sharp
    const metadata = await sharp(imagePath).metadata();
    const { width, height, format } = metadata;
    
    const validationResults = {
      valid: true,
      warnings: [],
      reasons: [],
      details: {
        dimensions: `${width}x${height}`,
        format: format,
        aspectRatio: (width / height).toFixed(2),
        fileSize: fs.statSync(imagePath).size / 1024 // KB
      }
    };

    // Check 1: Image size
    if (width < 800 || height < 600) {
      validationResults.warnings.push('Image resolution is low');
    }
    
    if (fs.statSync(imagePath).size > 5 * 1024 * 1024) {
      validationResults.warnings.push('File size exceeds 5MB');
    }
    
    // Check 2: Blur detection
    try {
      const blurScore = await detectBlur(imagePath);
      validationResults.details.blurScore = blurScore;
      
      if (blurScore < 50) {
        validationResults.warnings.push('Image appears to be blurry');
      }
    } catch (blurError) {
      validationResults.warnings.push('Could not analyze image blur');
    }
    
    // Check 3: ID layout validation
    const layoutCheck = await validateIdLayout(imagePath, documentType);
    if (!layoutCheck.valid) {
      validationResults.warnings.push(...layoutCheck.reasons);
    }
    
    // Final validation decision
    // For demo purposes, we'll only reject if there are major issues
    if (validationResults.warnings.length > 2 || layoutCheck.critical) {
      validationResults.valid = false;
      validationResults.reasons = [...validationResults.warnings];
    }
    
    return validationResults;
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      valid: false,
      reasons: ['Failed to validate image', error.message]
    };
  }
};

/**
 * Detects blur in an image using Laplacian variance
 * @param {string} imagePath Path to the image
 * @returns {Promise<number>} Blur score (higher is sharper)
 */
async function detectBlur(imagePath) {
  try {
    // For a real implementation, we'd use a library like Sharp with
    // its convolve method to apply a Laplacian filter, or use a ML-based approach
    
    // For demo purposes, we'll simulate blur detection
    // In a real app, you'd implement proper image processing algorithms
    
    // Simulate analyzing the image - using file size as a proxy (not accurate)
    const fileSize = fs.statSync(imagePath).size;
    
    // Generate a number between 0-100 weighted by file size
    // (this is just a simulation, not a real blur detection)
    const simulatedBlurScore = Math.min(100, Math.max(0, 
      50 + (fileSize % 100000) / 2000));
      
    return simulatedBlurScore;
  } catch (error) {
    console.error('Blur detection error:', error);
    return 50; // Default middle value
  }
}

/**
 * Validates the layout of an ID document
 * @param {string} imagePath Path to the image
 * @param {string} documentType Type of document ('aadhar' or 'pan')
 * @returns {Promise<Object>} Validation results
 */
async function validateIdLayout(imagePath, documentType) {
  try {
    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;
    
    // This is a simulated ID layout validation
    // In a real implementation, you would:
    // 1. Use template matching or ML-based object detection
    // 2. Check for specific features of Aadhaar/PAN (logos, field positions)
    // 3. Verify expected colors/patterns
    
    const result = {
      valid: true,
      reasons: [],
      critical: false
    };
    
    // Basic aspect ratio check
    // Aadhaar is typically around 1.58:1, PAN is around 1.6:1
    const aspectRatio = width / height;
    
    if (documentType === 'aadhar') {
      if (aspectRatio < 1.4 || aspectRatio > 1.75) {
        result.valid = false;
        result.reasons.push('Aspect ratio does not match Aadhaar card standards');
      }
      
      // Extract a small sample to check for the Aadhaar blue color
      // In a real implementation, we'd use more sophisticated methods
      const hasExpectedColors = await simulateColorCheck(imagePath, 'aadhar');
      if (!hasExpectedColors) {
        result.reasons.push('Document colors do not match Aadhaar standards');
      }
    } 
    else if (documentType === 'pan') {
      if (aspectRatio < 1.5 || aspectRatio > 1.7) {
        result.valid = false;
        result.reasons.push('Aspect ratio does not match PAN card standards');
      }
      
      const hasExpectedColors = await simulateColorCheck(imagePath, 'pan');
      if (!hasExpectedColors) {
        result.reasons.push('Document colors do not match PAN card standards');
      }
    }
    
    // If there are multiple issues, mark it as potentially fraudulent
    if (result.reasons.length >= 2) {
      result.critical = true;
    }
    
    return result;
  } catch (error) {
    console.error('ID layout validation error:', error);
    return {
      valid: false,
      reasons: ['Failed to validate ID layout'],
      critical: false
    };
  }
}

/**
 * Simulates checking for expected colors in ID documents
 * @param {string} imagePath Path to the image
 * @param {string} documentType Type of document
 * @returns {Promise<boolean>} Whether the colors match expectations
 */
async function simulateColorCheck(imagePath, documentType) {
  // In a real implementation, we would analyze the color distribution
  // For the demo, we'll use the file's last modified time as a random seed
  const lastModified = fs.statSync(imagePath).mtimeMs;
  const randomValue = lastModified % 100;
  
  // 85% chance of returning true (most uploads should pass)
  return randomValue < 85;
}
