import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './KYC.css';

const KYC = () => {
  const [formState, setFormState] = useState({
    currentStep: 1,
    loading: false,
    success: '',
    error: '',
    selectedDocType: 'aadhar', // Default selected document type
    aadhar: null,
    panCard: null,
    selfie: null,
    videoVerification: null,
    agreesToTerms: false
  });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormState({
      ...formState,
      [name]: files[0],
      error: ''
    });
  };

  const handleDocTypeChange = (docType) => {
    setFormState({
      ...formState,
      selectedDocType: docType,
      error: ''
    });
  };

  const handleCheckboxChange = (e) => {
    setFormState({
      ...formState,
      agreesToTerms: e.target.checked,
      error: ''
    });
  };

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (formState.currentStep === 1) {
      // Check if at least one document is uploaded based on selection
      const hasAadhar = formState.selectedDocType === 'aadhar' && formState.aadhar;
      const hasPan = formState.selectedDocType === 'pan' && formState.panCard;
      
      if (!hasAadhar && !hasPan) {
        setFormState({
          ...formState,
          error: `Please upload your ${formState.selectedDocType === 'aadhar' ? 'Aadhaar' : 'PAN'} document`
        });
        return;
      }
    }

    setFormState({
      ...formState,
      currentStep: formState.currentStep + 1,
      error: ''
    });
  };

  const handlePrevStep = () => {
    setFormState({
      ...formState,
      currentStep: formState.currentStep - 1,
      error: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formState.currentStep === 2) {
      if ((!formState.selfie && !formState.videoVerification) || !formState.agreesToTerms) {
        setFormState({
          ...formState,
          error: 'Please complete all required fields and agree to the terms'
        });
        return;
      }
    }
    
    setFormState({
      ...formState,
      loading: true,
      error: ''
    });

    try {
      const formData = new FormData();
      
      // Add the selected document
      if (formState.selectedDocType === 'aadhar') {
        formData.append('idDocument', formState.aadhar);
        formData.append('documentType', 'aadhar');
      } else {
        formData.append('idDocument', formState.panCard);
        formData.append('documentType', 'pan');
      }
      
      // Add selfie or video
      if (formState.selfie) {
        formData.append('selfie', formState.selfie);
      } else if (formState.videoVerification) {
        formData.append('videoVerification', formState.videoVerification);
      }
      
      // Add other form data
      formData.append('agreesToTerms', formState.agreesToTerms);
      
      // Get the token
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Send the files to the server
      const response = await fetch('/api/kyc/upload-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit KYC verification');
      }
      
      setFormState({
        ...formState,
        loading: false,
        success: 'Your KYC verification has been submitted successfully. We will review your documents and update you soon.'
      });
    } catch (error) {
      setFormState({
        ...formState,
        loading: false,
        error: error.message || 'Failed to submit KYC verification. Please try again.'
      });
    }
  };

  const renderFilePreview = (file) => {
    if (!file) return null;
    
    return (
      <div className="file-preview">
        <div className="file-name">{file.name}</div>
        <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
      </div>
    );
  };

  return (
    <div className="kyc-page">
      <div className="kyc-container">
        <div className="kyc-card">
          <div className="kyc-header">
            <h1>Complete Your KYC Verification</h1>
            <p>To comply with regulations and ensure security, please complete the verification process</p>
          </div>

          {formState.success ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Verification Submitted</h3>
              <p>{formState.success}</p>
              <Link to="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
            </div>
          ) : (
            <>
              <div className="steps-indicator">
                <div className={`step ${formState.currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Document Upload</div>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${formState.currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Identity Verification</div>
                </div>
              </div>

              {formState.error && <div className="error-message">{formState.error}</div>}

              <form onSubmit={handleSubmit}>
                {formState.currentStep === 1 && (
                  <div className="kyc-step">
                    <h2>Upload Your ID Document</h2>
                    <p className="step-description">
                      Please select and upload either your Aadhaar or PAN card.
                    </p>

                    <div className="document-selection">
                      <div className="option-tabs">
                        <button 
                          type="button" 
                          className={`option-tab ${formState.selectedDocType === 'aadhar' ? 'active' : ''}`}
                          onClick={() => handleDocTypeChange('aadhar')}
                        >
                          Aadhaar Card
                        </button>
                        <button 
                          type="button" 
                          className={`option-tab ${formState.selectedDocType === 'pan' ? 'active' : ''}`}
                          onClick={() => handleDocTypeChange('pan')}
                        >
                          PAN Card
                        </button>
                      </div>
                    </div>

                    {formState.selectedDocType === 'aadhar' ? (
                      <div className="document-section">
                        <h3>Aadhaar Card</h3>
                        <div className="upload-item full-width">
                          <label className="upload-label">
                            <div className="upload-box">
                              <div className="upload-icon">📄</div>
                              <div className="upload-text">
                                <span className="primary-text">Upload Aadhaar Card</span>
                                <span className="secondary-text">Click to browse or drag and drop</span>
                              </div>
                              <input
                                type="file"
                                name="aadhar"
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={handleFileChange}
                                className="file-input"
                              />
                            </div>
                          </label>
                          {renderFilePreview(formState.aadhar)}
                        </div>
                      </div>
                    ) : (
                      <div className="document-section">
                        <h3>PAN Card</h3>
                        <div className="upload-item full-width">
                          <label className="upload-label">
                            <div className="upload-box">
                              <div className="upload-icon">📄</div>
                              <div className="upload-text">
                                <span className="primary-text">Upload PAN Card</span>
                                <span className="secondary-text">Click to browse or drag and drop</span>
                              </div>
                              <input
                                type="file"
                                name="panCard"
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={handleFileChange}
                                className="file-input"
                              />
                            </div>
                          </label>
                          {renderFilePreview(formState.panCard)}
                        </div>
                      </div>
                    )}

                    <div className="document-requirements">
                      <h4>Document Requirements:</h4>
                      <ul>
                        <li>Files must be in JPG, PNG, or PDF format</li>
                        <li>Maximum file size: 5MB per document</li>
                        <li>Document must be valid and not expired</li>
                        <li>All details must be clearly visible without blur</li>
                      </ul>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNextStep}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {formState.currentStep === 2 && (
                  <div className="kyc-step">
                    <h2>Identity Verification</h2>
                    <p className="step-description">
                      Please provide either a selfie or a short video for identity verification.
                    </p>

                    <div className="verification-options">
                      <div className="option-tabs">
                        <button 
                          type="button" 
                          className={`option-tab ${!formState.videoVerification ? 'active' : ''}`}
                          onClick={() => setFormState({
                            ...formState,
                            videoVerification: null
                          })}
                        >
                          Selfie Verification
                        </button>
                        <button 
                          type="button" 
                          className={`option-tab ${formState.videoVerification ? 'active' : ''}`}
                          onClick={() => setFormState({
                            ...formState,
                            selfie: null
                          })}
                        >
                          Video Verification
                        </button>
                      </div>

                      {!formState.videoVerification ? (
                        <div className="selfie-upload">
                          <div className="upload-item centered">
                            <label className="upload-label">
                              <div className="upload-box large">
                                <div className="upload-icon">📸</div>
                                <div className="upload-text">
                                  <span className="primary-text">Upload Selfie</span>
                                  <span className="secondary-text">Take a clear photo of your face</span>
                                </div>
                                <input
                                  type="file"
                                  name="selfie"
                                  accept="image/jpeg,image/png"
                                  onChange={handleFileChange}
                                  className="file-input"
                                />
                              </div>
                            </label>
                            {renderFilePreview(formState.selfie)}
                          </div>
                          
                          <div className="selfie-guidelines">
                            <h4>Selfie Guidelines:</h4>
                            <ul>
                              <li>Ensure your face is clearly visible</li>
                              <li>Look directly at the camera</li>
                              <li>Good lighting conditions (no harsh shadows)</li>
                              <li>No sunglasses or head coverings that obscure your face</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="video-upload">
                          <div className="upload-item centered">
                            <label className="upload-label">
                              <div className="upload-box large">
                                <div className="upload-icon">🎥</div>
                                <div className="upload-text">
                                  <span className="primary-text">Upload Video</span>
                                  <span className="secondary-text">Record a short verification video</span>
                                </div>
                                <input
                                  type="file"
                                  name="videoVerification"
                                  accept="video/mp4,video/quicktime"
                                  onChange={handleFileChange}
                                  className="file-input"
                                />
                              </div>
                            </label>
                            {renderFilePreview(formState.videoVerification)}
                          </div>
                          
                          <div className="video-guidelines">
                            <h4>Video Guidelines:</h4>
                            <ul>
                              <li>Record a 5-10 second video of yourself</li>
                              <li>Say your full name clearly</li>
                              <li>Say "I am verifying my account on UPI CryptoConnect"</li>
                              <li>Ensure good lighting and clear audio</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="terms-agreement">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={formState.agreesToTerms}
                          onChange={handleCheckboxChange}
                        />
                        <span className="checkmark"></span>
                        I confirm that all information and documents provided are authentic and belong to me. 
                        I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
                      </label>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handlePrevStep}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={formState.loading}
                      >
                        {formState.loading ? 'Submitting...' : 'Submit Verification'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYC;
