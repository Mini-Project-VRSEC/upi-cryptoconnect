# Face Matching Service for UPI CryptoConnect

This microservice provides face comparison functionality for the KYC verification process.

## Prerequisites

- Python 3.7+
- pip

## Installation

1. Install required Python packages:

```bash
pip install flask face_recognition numpy Werkzeug
```

Note: `face_recognition` requires dlib which has its own dependencies. On some systems, you may need to install:
- CMake
- C++ compiler
- dlib separately

For detailed instructions, visit: https://github.com/ageitgey/face_recognition#installation

## Running the Service

Start the service with:

```bash
python app.py
```

The service will run on port 5005 by default.

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /compare-faces` - Compare two faces in images
  - Expects two files in form-data: 'selfie' and 'id_photo'
  - Returns match result with confidence score
