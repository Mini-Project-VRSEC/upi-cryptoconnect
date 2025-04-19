const User = require('../models/user.model');
const KYC = require('../models/kyc.model');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Set these flags to control which features to enable
const USE_REAL_OCR = false; // Set to true only if you have Google Vision credentials
const USE_REAL_FACE_MATCHING = false; // Set to true only if you have face matching service

/**
 * Process KYC document upload and verification
 */
exports.uploadDocuments = async (req, res) => {
  try {
    // Check for required files
    if (!req.files || !req.files.idDocument) {
      return res.status(400).json({ message: 'Required document is missing' });
    }

    // Get document type and paths
    const documentType = req.body.documentType;
    const documentPath = req.files.idDocument[0].path;
    const selfiePath = req.files.selfie ? req.files.selfie[0].path : null;
    const videoPath = req.files.videoVerification ? req.files.videoVerification[0].path : null;

    console.log('Files received:', {
      documentType,
      documentPath,
      selfiePath,
      videoPath
    });

    // STEP 1: Validate image quality
    console.log('Starting image quality validation...');
    const imageValidationResult = {
      valid: true,
      warnings: [],
      details: {
        size: fs.statSync(documentPath).size / 1024 // Size in KB
      }
    };

    // STEP 2: Extract information from document using OCR (simulated)
    console.log(`Extracting information from ${documentType} document...`);
    let extractedInfo;
    
    try {
      if (USE_REAL_OCR) {
        // This would be real OCR implementation
        throw new Error("Real OCR not configured");
      } else {
        // Use simulated OCR
        console.log('Using simulated OCR...');
        extractedInfo = simulateOcrExtraction(documentType);
      }
    } catch (error) {
      console.log('OCR error (using simulated data):', error.message);
      extractedInfo = simulateOcrExtraction(documentType);
    }

    // STEP 3: Perform face matching (simulated)
    console.log('Performing face matching...');
    let faceMatchResult;
    
    try {
      if (USE_REAL_FACE_MATCHING && selfiePath) {
        // This would be real face matching implementation
        throw new Error("Real face matching not configured");
      } else {
        // Use simulated face matching
        console.log('Using simulated face matching...');
        faceMatchResult = simulateFaceMatching();
      }
    } catch (error) {
      console.log('Face matching error (using simulated data):', error.message);
      faceMatchResult = simulateFaceMatching();
    }

    // STEP 4: Create KYC record
    console.log('Creating KYC record...');
    const kycData = {
      user: req.user._id,
      idDocumentType: documentType,
      idDocumentPath: documentPath,
      kycStatus: 'pending',
      submissionDate: new Date()
    };

    if (selfiePath) kycData.selfiePath = selfiePath;
    if (videoPath) kycData.videoVerificationPath = videoPath;
    
    // Add extracted info if available
    if (extractedInfo) {
      kycData.extractedInfo = extractedInfo;
    }
    
    // Add face match result if available
    if (faceMatchResult) {
      kycData.faceMatchResult = {
        match: faceMatchResult.match,
        confidence: faceMatchResult.confidence
      };
    }

    // Save to database
    const kyc = new KYC(kycData);
    await kyc.save();

    // STEP 5: Update user's KYC status
    await User.findByIdAndUpdate(req.user._id, { kycStatus: 'pending' });

    // Return success response
    res.status(201).json({
      message: 'KYC verification submitted successfully',
      status: 'pending',
      extractedInfo: extractedInfo,
      faceMatchResult: faceMatchResult
    });

  } catch (error) {
    console.error('KYC upload error:', error);
    res.status(500).json({ message: 'Failed to process KYC documents. Please try again.' });
  }
};

/**
 * Simulate OCR extraction for demo purposes
 */
function simulateOcrExtraction(documentType) {
  if (documentType === 'aadhar') {
    return {
      name: "Test User",
      dob: "15/08/1990",
      gender: "Male",
      aadhaarNumber: "XXXX-XXXX-1234" // Masked for security
    };
  } else {
    return {
      name: "Test User",
      fatherName: "Parent Name",
      dob: "15/08/1990",
      panNumber: "ABCDE1234F"
    };
  }
}

/**
 * Simulate face matching for demo purposes
 */
function simulateFaceMatching() {
  // 80% chance of successful match for demo purposes
  const isMatch = Math.random() < 0.8;
  const confidence = isMatch ? 
    (Math.random() * 30) + 70 : // 70-100% confidence for matches
    (Math.random() * 30) + 30;  // 30-60% confidence for non-matches
  
  return {
    success: true,
    match: isMatch,
    confidence: parseFloat(confidence.toFixed(1)),
    simulated: true
  };
}

/**
 * Get KYC status for a user
 */
exports.getKycStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id }).sort({ submissionDate: -1 });
    
    if (!kyc) {
      return res.status(404).json({ message: 'No KYC records found' });
    }
    
    res.json({
      status: kyc.kycStatus,
      submissionDate: kyc.submissionDate,
      extractedInfo: kyc.extractedInfo
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({ message: 'Failed to retrieve KYC status' });
  }
};
