from flask import Flask, request, jsonify
import os
import logging
from werkzeug.utils import secure_filename
import numpy as np
import cv2
import face_recognition

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/compare-faces', methods=['POST'])
def compare_faces():
    try:
        if 'selfie' not in request.files or 'id_photo' not in request.files:
            return jsonify({
                "success": False,
                "error": "Missing required files"
            }), 400
        
        # Get the uploaded files
        selfie_file = request.files['selfie']
        id_photo_file = request.files['id_photo']
        
        # Define paths to save temporarily
        selfie_path = os.path.join(UPLOAD_FOLDER, secure_filename(selfie_file.filename))
        id_photo_path = os.path.join(UPLOAD_FOLDER, secure_filename(id_photo_file.filename))
        
        # Save the files temporarily
        selfie_file.save(selfie_path)
        id_photo_file.save(id_photo_path)
        
        logger.info(f"Processing face comparison between {selfie_path} and {id_photo_path}")
        
        # Load the images
        try:
            selfie_image = face_recognition.load_image_file(selfie_path)
            id_image = face_recognition.load_image_file(id_photo_path)
            
            # Get face encodings
            selfie_face_encodings = face_recognition.face_encodings(selfie_image)
            id_face_encodings = face_recognition.face_encodings(id_image)
            
            # Check if faces were detected
            if len(selfie_face_encodings) == 0:
                return jsonify({
                    "success": False,
                    "match": False,
                    "error": "No face detected in selfie"
                }), 400
                
            if len(id_face_encodings) == 0:
                return jsonify({
                    "success": False,
                    "match": False,
                    "error": "No face detected in ID document"
                }), 400
                
            # Compare faces with a lower threshold (0.5 instead of default 0.6)
            # Lower value means more permissive matching (more likely to match)
            face_distances = face_recognition.face_distance([id_face_encodings[0]], selfie_face_encodings[0])
            match = face_distances[0] <= 0.5
            confidence = 1 - float(face_distances[0])
            confidence_percentage = round(confidence * 100, 2)
            
            return jsonify({
                "success": True,
                "match": bool(match),
                "confidence": confidence_percentage,
                "threshold": 0.5
            })
            
        except Exception as e:
            logger.error(f"Error processing images: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Error processing images: {str(e)}"
            }), 500
        
        finally:
            # Clean up temporary files
            if os.path.exists(selfie_path):
                os.remove(selfie_path)
            if os.path.exists(id_photo_path):
                os.remove(id_photo_path)
    
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
