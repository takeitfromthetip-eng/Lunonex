import React from 'react';
import './Compliance2257.css';

const Compliance2257 = () => {
  return (
    <div className="compliance-page">
      <div className="compliance-container">
        <h1>18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement</h1>

        <div className="compliance-section">
          <h2>Age Verification Statement</h2>
          <p>
            All models, actors, actresses and other persons that appear in any visual depiction of 
            actual sexually explicit conduct appearing or otherwise contained in this website were 
            over the age of eighteen (18) years at the time of the creation of such depictions.
          </p>
        </div>

        <div className="compliance-section">
          <h2>Record-Keeping Requirements</h2>
          <p>
            The records required by 18 U.S.C. § 2257 and 28 C.F.R. § 75 for materials contained in 
            this website are kept by the designated Custodian of Records listed below.
          </p>
        </div>

        <div className="custodian-info">
          <h2>Custodian of Records</h2>
          <div className="info-box">
            <p><strong>Name:</strong> ForTheWeebs LLC</p>
            <p><strong>Attention:</strong> Custodian of Records - 2257 Compliance</p>
            <p><strong>Address:</strong> {process.env.CUSTODIAN_ADDRESS_LINE1 || '[Add CUSTODIAN_ADDRESS_LINE1 to .env]'}</p>
            {process.env.CUSTODIAN_ADDRESS_LINE2 && <p><strong>Suite/Unit:</strong> {process.env.CUSTODIAN_ADDRESS_LINE2}</p>}
            <p><strong>City, State, ZIP:</strong> {process.env.CUSTODIAN_CITY || '[CITY]'}, {process.env.CUSTODIAN_STATE || '[STATE]'} {process.env.CUSTODIAN_ZIP || '[ZIP]'}</p>
            <p><strong>Country:</strong> United States</p>
            <p><strong>Phone:</strong> {process.env.CUSTODIAN_PHONE || '[Add CUSTODIAN_PHONE to .env]'}</p>
            <p><strong>Email:</strong> {process.env.CUSTODIAN_EMAIL || 'custodian@fortheweebs.com'}</p>
          </div>
          <p className="note">
            <strong>⚙️ Setup Required:</strong> Add custodian information to your .env file.
            Must be a physical address (P.O. Box not allowed). See .env.example for template.
          </p>
        </div>

        <div className="compliance-section">
          <h2>Platform Structure: Primary vs. Secondary Producers</h2>
          
          <h3>ForTheWeebs as Primary Producer</h3>
          <p>
            For content produced directly by ForTheWeebs (platform-created materials, promotional content, 
            tutorials), ForTheWeebs maintains all required records in accordance with 18 U.S.C. § 2257.
          </p>

          <h3>Content Creators as Secondary Producers</h3>
          <p>
            ForTheWeebs operates as a hosting and distribution platform for user-generated content. 
            Individual content creators ("Secondary Producers") who upload sexually explicit content to 
            this platform are independently responsible for:
          </p>
          <ul>
            <li>Verifying the age of all performers appearing in their content</li>
            <li>Maintaining records as required by 18 U.S.C. § 2257</li>
            <li>Designating their own Custodian of Records</li>
            <li>Making records available for inspection upon lawful request</li>
            <li>Displaying their own 2257 compliance statement on their content</li>
          </ul>
        </div>

        <div className="compliance-section">
          <h2>Creator Requirements</h2>
          <p>
            All creators who post adult content on ForTheWeebs must comply with the following:
          </p>
          
          <div className="requirements-list">
            <div className="requirement-item">
              <h4>1. Age Verification</h4>
              <p>Creators must verify their own age (18+) through government-issued photo ID.</p>
            </div>

            <div className="requirement-item">
              <h4>2. Performer Verification</h4>
              <p>
                Creators must obtain and maintain copies of government-issued photo identification for 
                all performers appearing in sexually explicit content.
              </p>
            </div>

            <div className="requirement-item">
              <h4>3. Record Retention</h4>
              <p>
                Records must be maintained for a minimum of seven (7) years after the content is no 
                longer available on the platform.
              </p>
            </div>

            <div className="requirement-item">
              <h4>4. Record Contents</h4>
              <p>Records must include:</p>
              <ul>
                <li>Performer's legal name and any stage names used</li>
                <li>Date of birth</li>
                <li>Copy of valid government-issued photo ID</li>
                <li>Date of production for each piece of content</li>
                <li>URLs or identifiers for all content featuring each performer</li>
              </ul>
            </div>

            <div className="requirement-item">
              <h4>5. Inspection Rights</h4>
              <p>
                Records must be made available for inspection by the Attorney General or their designee 
                upon request within twenty (20) business days.
              </p>
            </div>

            <div className="requirement-item">
              <h4>6. Compliance Statement</h4>
              <p>
                Creators must display their own 2257 compliance statement including their designated 
                Custodian of Records information on all content pages.
              </p>
            </div>
          </div>
        </div>

        <div className="compliance-section">
          <h2>Prohibited Content</h2>
          <p>The following content is strictly prohibited on ForTheWeebs:</p>
          <ul>
            <li><strong>Child Sexual Abuse Material (CSAM):</strong> Any content depicting minors in sexual situations</li>
            <li><strong>Non-Consensual Content:</strong> Revenge porn, hidden camera footage, or any content uploaded without performer consent</li>
            <li><strong>Content Depicting Minors:</strong> Any content featuring or appearing to feature individuals under 18 years of age</li>
            <li><strong>Bestiality:</strong> Sexual content involving animals</li>
            <li><strong>Incest:</strong> Content depicting sexual relations between family members</li>
            <li><strong>Extreme Violence:</strong> Content depicting rape, torture, or non-consensual violence</li>
          </ul>
        </div>

        <div className="compliance-section">
          <h2>Platform Responsibilities</h2>
          <p>ForTheWeebs takes the following measures to ensure compliance:</p>
          <ul>
            <li>Age verification for all users accessing adult content</li>
            <li>Age verification for all creators posting adult content</li>
            <li>AI-powered content moderation to detect prohibited content</li>
            <li>Automated CSAM detection and reporting to NCMEC</li>
            <li>Review and approval process for adult content creators</li>
            <li>Random audits of adult content for compliance</li>
            <li>Immediate removal of content upon violation detection</li>
            <li>Cooperation with law enforcement investigations</li>
          </ul>
        </div>

        <div className="compliance-section">
          <h2>Reporting Violations</h2>
          <p>
            If you believe any content on this platform violates 18 U.S.C. § 2257 or features 
            underage performers, report it immediately:
          </p>
          <div className="info-box">
            <p><strong>Email:</strong> compliance@fortheweebs.com</p>
            <p><strong>CSAM Reports:</strong> reports@fortheweebs.com</p>
            <p><strong>NCMEC CyberTipline:</strong> https://report.cybertip.org/</p>
            <p><strong>FBI:</strong> tips.fbi.gov</p>
          </div>
        </div>

        <div className="compliance-section">
          <h2>Legal References</h2>
          <ul>
            <li>18 U.S.C. § 2257 - Record keeping requirements</li>
            <li>18 U.S.C. § 2257A - Record keeping requirements for simulated sexual conduct</li>
            <li>28 C.F.R. § 75 - Regulations implementing 18 U.S.C. § 2257</li>
            <li>18 U.S.C. § 2258A - Reporting requirements for electronic communication service providers and remote computing service providers</li>
          </ul>
        </div>

        <div className="compliance-section">
          <h2>Questions or Concerns</h2>
          <p>
            For questions regarding 2257 compliance, record-keeping requirements, or to request 
            inspection of records, contact:
          </p>
          <div className="info-box">
            <p><strong>Custodian of Records</strong></p>
            <p>Email: custodian@fortheweebs.com</p>
            <p>Phone: [YOUR PHONE NUMBER]</p>
          </div>
        </div>

        <div className="last-updated">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
};

export default Compliance2257;
