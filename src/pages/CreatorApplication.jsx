/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatorApplication.css';

const CreatorApplication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    stageName: '',
    contentType: '',
    contentCategory: 'general', // 'general' or 'adult'
    socialLinks: {
      youtube: '',
      twitch: '',
      twitter: '',
      instagram: '',
      tiktok: '',
      other: ''
    },
    currentFollowers: '',
    contentDescription: '',
    whyJoin: '',
    monthlyContentVolume: '',
    hasAdultContent: false,
    agreeToTerms: false,
    agree2257: false, // For adult content creators
    idDocument: null // For adult content ID upload
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [idFile, setIdFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('social_')) {
      const platform = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleIDUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid ID document (JPG, PNG, or PDF)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setIdFile(file);
      setFormData(prev => ({ ...prev, idDocument: file.name }));
    }
  };

  const handleSubmit = withBugReporting(async (e) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    // Additional validation for adult content creators
    if (formData.contentCategory === 'adult') {
      if (!formData.agree2257) {
        alert('Adult content creators must agree to 2257 compliance requirements');
        return;
      }
      if (!idFile) {
        alert('Adult content creators must upload a government-issued ID');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // If adult content, upload ID first
      let idUploadUrl = null;
      if (formData.contentCategory === 'adult' && idFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('idDocument', idFile);
        formDataUpload.append('email', formData.email);

        console.log('📤 Uploading ID document...');
        const uploadResponse = await fetch('/api/creator-applications/upload-id', {
          method: 'POST',
          body: formDataUpload
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          idUploadUrl = uploadData.fileUrl;
          console.log('✅ ID uploaded:', idUploadUrl);
        } else {
          // Report ID upload failure to bug fixer
          await reportBugToFixer(
            new Error(`ID upload failed: ${uploadData.error || 'Unknown error'}`),
            {
              system: MONITORED_SYSTEMS.ID_UPLOAD,
              severity: SEVERITY.HIGH,
              component: 'CreatorApplication',
              userAction: 'submit_application_with_id',
              formData: { ...formData, idDocument: 'REDACTED' },
              responseStatus: uploadResponse.status,
              responseData: uploadData,
            }
          );
          throw new Error(uploadData.error || 'ID upload failed');
        }
      }

      // Submit application
      console.log('📤 Submitting creator application...');
      const response = await fetch('/api/creator-applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          idDocumentUrl: idUploadUrl,
          submittedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Application submitted successfully');
        setSubmitStatus('success');
        setTimeout(() => {
          navigate('/application-success');
        }, 2000);
      } else {
        // Report application submission failure to bug fixer
        await reportBugToFixer(
          new Error(`Application submission failed: ${data.error || 'Unknown error'}`),
          {
            system: MONITORED_SYSTEMS.CREATOR_APPLICATION,
            severity: SEVERITY.HIGH,
            component: 'CreatorApplication',
            userAction: 'submit_application',
            formData: { ...formData, idDocument: 'REDACTED' },
            responseStatus: response.status,
            responseData: data,
          }
        );
        setSubmitStatus('error');
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application submission error:', error);

      // Report unexpected errors to bug fixer
      await reportBugToFixer(error, {
        system: MONITORED_SYSTEMS.CREATOR_APPLICATION,
        severity: SEVERITY.CRITICAL,
        component: 'CreatorApplication',
        userAction: 'submit_application_error',
        formData: { ...formData, idDocument: 'REDACTED' },
      });

      setSubmitStatus('error');
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, {
    system: MONITORED_SYSTEMS.CREATOR_APPLICATION,
    severity: SEVERITY.HIGH,
    component: 'CreatorApplication',
  });

  // Initialize bug monitoring on mount
  useEffect(() => {
    console.log('🔍 Creator Application: Bug monitoring active');

    // Validate encryption on load (for adult content)
    const checkEncryption = async () => {
      try {
        const response = await fetch('/health');
        if (!response.ok) {
          await reportBugToFixer(
            new Error('Health check failed on Creator Application page'),
            {
              system: MONITORED_SYSTEMS.CREATOR_APPLICATION,
              severity: SEVERITY.MEDIUM,
              component: 'CreatorApplication',
              userAction: 'page_load',
            }
          );
        }
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    checkEncryption();
  }, []);

  return (
    <div className="creator-application">
      <div className="application-container">
        <div className="application-header">
          <h1>Creator Application</h1>
          <p>Join ForTheWeebs and build your community with full creator control</p>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          {/* Personal Information */}
          <section className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stageName">Stage/Creator Name *</label>
              <input
                type="text"
                id="stageName"
                name="stageName"
                value={formData.stageName}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* Content Information */}
          <section className="form-section">
            <h2>Content Information</h2>

            {/* Content Category Selection */}
            <div className="form-group">
              <label htmlFor="contentCategory">Content Category *</label>
              <select
                id="contentCategory"
                name="contentCategory"
                value={formData.contentCategory}
                onChange={handleChange}
                required
                className="important-select"
              >
                <option value="general">General Content (PG-13/Mature)</option>
                <option value="adult">Adult Content (18+ Explicit)</option>
              </select>
              <p className="input-hint">
                {formData.contentCategory === 'general'
                  ? 'Gaming, art, music, cosplay (non-explicit). Uses Stripe (2.9% fees).'
                  : 'Sexually explicit content. Requires ID verification. Uses CCBill (10-15% fees).'}
              </p>
            </div>

            {/* Adult Content Warning */}
            {formData.contentCategory === 'adult' && (
              <div className="adult-content-notice">
                <h3>⚠️ Adult Content Creator Requirements</h3>
                <ul>
                  <li><strong>Must be 18+ years old</strong></li>
                  <li><strong>Government-issued ID required</strong> (uploaded below)</li>
                  <li><strong>2257 compliance required</strong> - Must verify all performers are 18+</li>
                  <li><strong>Higher payment processing fees</strong> (10-15% vs 2.9%)</li>
                  <li><strong>Enhanced moderation</strong> - Random content audits</li>
                  <li><strong>Maintain performer records</strong> for 7 years</li>
                </ul>
                <a href="/compliance-2257" target="_blank" className="compliance-link">
                  → Read full 2257 compliance requirements
                </a>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="contentType">Primary Content Type *</label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                required
              >
                <option value="">Select content type...</option>
                <option value="gaming">Gaming</option>
                <option value="art">Art/Illustration</option>
                <option value="music">Music</option>
                <option value="vtuber">VTuber</option>
                <option value="cosplay">Cosplay</option>
                <option value="education">Educational</option>
                <option value="entertainment">Entertainment</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="adult">Adult Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="contentDescription">Describe Your Content *</label>
              <textarea
                id="contentDescription"
                name="contentDescription"
                value={formData.contentDescription}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about the content you create..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="monthlyContentVolume">Monthly Content Volume *</label>
              <select
                id="monthlyContentVolume"
                name="monthlyContentVolume"
                value={formData.monthlyContentVolume}
                onChange={handleChange}
                required
              >
                <option value="">Select frequency...</option>
                <option value="daily">Daily (20+ posts/month)</option>
                <option value="frequent">Frequent (10-20 posts/month)</option>
                <option value="regular">Regular (5-10 posts/month)</option>
                <option value="occasional">Occasional (1-5 posts/month)</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hasAdultContent"
                  checked={formData.hasAdultContent}
                  onChange={handleChange}
                />
                <span>I will be posting adult content (18+)</span>
              </label>
            </div>
          </section>

          {/* Social Media Presence */}
          <section className="form-section">
            <h2>Social Media Presence</h2>
            <p className="section-description">Provide links to your existing platforms (at least one required)</p>

            <div className="form-group">
              <label htmlFor="social_youtube">YouTube</label>
              <input
                type="url"
                id="social_youtube"
                name="social_youtube"
                value={formData.socialLinks.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_twitch">Twitch</label>
              <input
                type="url"
                id="social_twitch"
                name="social_twitch"
                value={formData.socialLinks.twitch}
                onChange={handleChange}
                placeholder="https://twitch.tv/yourname"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_twitter">Twitter/X</label>
              <input
                type="url"
                id="social_twitter"
                name="social_twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/yourname"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_instagram">Instagram</label>
              <input
                type="url"
                id="social_instagram"
                name="social_instagram"
                value={formData.socialLinks.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourname"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_tiktok">TikTok</label>
              <input
                type="url"
                id="social_tiktok"
                name="social_tiktok"
                value={formData.socialLinks.tiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@yourname"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_other">Other Platform</label>
              <input
                type="url"
                id="social_other"
                name="social_other"
                value={formData.socialLinks.other}
                onChange={handleChange}
                placeholder="Any other relevant link"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentFollowers">Total Follower Count (Approximate) *</label>
              <input
                type="text"
                id="currentFollowers"
                name="currentFollowers"
                value={formData.currentFollowers}
                onChange={handleChange}
                placeholder="e.g., 10,000"
                required
              />
            </div>
          </section>

          {/* Why Join */}
          <section className="form-section">
            <h2>Tell Us More</h2>

            <div className="form-group">
              <label htmlFor="whyJoin">Why do you want to join ForTheWeebs? *</label>
              <textarea
                id="whyJoin"
                name="whyJoin"
                value={formData.whyJoin}
                onChange={handleChange}
                rows="5"
                placeholder="What makes ForTheWeebs the right platform for you?"
                required
              />
            </div>
          </section>

          {/* Adult Content ID Verification */}
          {formData.contentCategory === 'adult' && (
            <section className="form-section adult-verification-section">
              <h2>🔞 Adult Content Creator Verification</h2>

              <div className="form-group">
                <label htmlFor="idUpload">Government-Issued ID Upload *</label>
                <p className="input-hint">
                  Upload a clear photo or scan of your government-issued ID (Driver's License, Passport, State ID).
                  This is required by law (18 U.S.C. § 2257) for all adult content creators.
                </p>
                <input
                  type="file"
                  id="idUpload"
                  name="idUpload"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleIDUpload}
                  required={formData.contentCategory === 'adult'}
                  className="file-input"
                />
                {idFile && (
                  <div className="file-uploaded">
                    ✅ File uploaded: {idFile.name} ({(idFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
                <p className="security-note">
                  🔒 <strong>Security:</strong> Your ID is encrypted and stored securely. Only authorized compliance staff can access it.
                </p>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="agree2257"
                    checked={formData.agree2257}
                    onChange={handleChange}
                    required={formData.contentCategory === 'adult'}
                  />
                  <span>
                    <strong>I agree to comply with 18 U.S.C. § 2257 record-keeping requirements *</strong>
                    <br />
                    I understand that I must:
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      <li>Verify the age of ALL performers in my content with government-issued ID</li>
                      <li>Maintain records for 7 years after content is removed</li>
                      <li>Designate a Custodian of Records and display 2257 statement</li>
                      <li>Make records available for inspection upon lawful request</li>
                      <li>Ensure all performers consent to filming and distribution</li>
                    </ul>
                    Failure to comply may result in immediate account termination and reporting to federal authorities.
                  </span>
                </label>
              </div>

              <div className="warning-box">
                <strong>⚠️ Important:</strong> Uploading content featuring minors or non-consenting individuals
                is a federal crime. ForTheWeebs employs AI detection and reports violations to NCMEC and law enforcement.
              </div>
            </section>
          )}

          {/* Terms and Conditions */}
          <section className="form-section">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                <span>I agree to the ForTheWeebs Terms of Service and Creator Guidelines *</span>
              </label>
            </div>
          </section>

          {/* Submit */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          {submitStatus === 'success' && (
            <div className="status-message success">
              Application submitted successfully! You'll receive a response via email within 3-5 business days.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="status-message error">
              Failed to submit application. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatorApplication;
