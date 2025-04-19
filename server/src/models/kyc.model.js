const mongoose = require('mongoose');

/**
 * KYC Schema for storing user verification documents and results
 */
const kycSchema = new mongoose.Schema({
  // Reference to the user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Document information
  idDocumentType: {
    type: String,
    enum: ['aadhar', 'pan'],
    required: true
  },
  idDocumentPath: {
    type: String,
    required: true
  },
  selfiePath: {
    type: String
  },
  videoVerificationPath: {
    type: String
  },
  
  // Extracted information from OCR
  extractedInfo: {
    name: String,
    dob: String,
    gender: String,
    aadhaarNumber: String,
    panNumber: String,
    fatherName: String
  },
  
  // Image validation results
  imageValidation: {
    valid: Boolean,
    warnings: [String],
    details: {
      dimensions: String,
      format: String,
      size: Number,
      blurScore: Number
    }
  },
  
  // Face matching results
  faceMatchResult: {
    match: Boolean,
    confidence: Number,
    simulated: Boolean
  },
  
  // KYC status
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    required: true
  },
  
  // Rejection reason if applicable
  rejectionReason: String,
  
  // Admin who verified/rejected
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  submissionDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  processedDate: Date
  
}, { timestamps: true });

// Create indexes for efficient queries
kycSchema.index({ user: 1 });
kycSchema.index({ kycStatus: 1 });
kycSchema.index({ submissionDate: -1 });

const KYC = mongoose.model('KYC', kycSchema);

module.exports = KYC;
