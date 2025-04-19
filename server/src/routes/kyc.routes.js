const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');
const kycController = require('../controllers/kyc.controller');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/kyc');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExtension = path.extname(file.originalname) || '.jpg';
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  }
});

// Configure upload settings
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Accept images and PDF
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images, videos and PDF files are allowed'), false);
    }
  }
}).fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
  { name: 'videoVerification', maxCount: 1 }
]);

// Custom middleware to handle multer errors
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ message: `Server error: ${err.message}` });
    }
    // Everything went fine
    next();
  });
};

// Protect all routes
router.use(protect);

// KYC document upload route - with custom error handling
router.post('/upload-documents', handleUpload, kycController.uploadDocuments);

// Get KYC status
router.get('/status', kycController.getKycStatus);

module.exports = router;
