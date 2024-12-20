import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import { Container, Row, Col } from 'reactstrap';
import SignupNavbar from '../Navbars/SignupNavbar';
import SimpleFooter from '../Footers/SimpleFooter';

const Remote = () => {
  const { t } = useTranslation(); // Initialize translation function

  return (
    <>
      <SignupNavbar />
      <main>
        {/* Hero Section */}
        <div className="position-relative">
          <section className="section section-hero section-shaped">
            <div className="shape shape-style-1 shape-default">
              <span className="span-150" />
              <span className="span-50" />
              <span className="span-50" />
              <span className="span-75" />
              <span className="span-100" />
              <span className="span-75" />
              <span className="span-50" />
              <span className="span-100" />
              <span className="span-50" />
              <span className="span-100" />
            </div>

            {/* Policy Content */}
            <Container className="py-5 privacy-policy" style={{ color: 'black' }}>
              <Row>
                <Col>
                  <h1 className="text-center">{t('privacyPolicy')}</h1>
                  <p>
                    <strong>{t('effectiveDate')}:</strong> 20th December, 2024
                  </p>
                  <p>
                    <strong>{t('introduction')}</strong>
                  </p>
                  <p>{t('privacyPolicyIntro')}</p>
                  <p>
                    <strong>{t('informationWeCollect')}</strong>
                  </p>
                  <p>{t('googleSignInDescription')}</p>
                  <ul>
                    <li>
                      <strong>{t('emailAddress')}:</strong> {t('emailPurpose')}
                    </li>
                    <li>
                      <strong>{t('fullName')}:</strong> {t('namePurpose')}
                    </li>
                  </ul>
                  <p>{t('sensitiveInfo')}</p>
                  <p>
                    <strong>{t('howWeUseInformation')}</strong>
                  </p>
                  <ul>
                    <li>{t('provideMaintainFunctionality')}</li>
                    <li>{t('personalizeExperience')}</li>
                    <li>{t('communicateUpdates')}</li>
                  </ul>
                  <p>
                    <strong>{t('sharingOfInformation')}</strong>
                  </p>
                  <p>{t('notSellingInfo')}</p>
                  <ul>
                    <li>{t('legalRequirement')}</li>
                    <li>{t('protectRights')}</li>
                  </ul>
                  <p>
                    <strong>{t('dataStorageSecurity')}</strong>
                  </p>
                  <p>{t('securityMeasures')}</p>
                  <p>
                    <strong>{t('yourChoices')}</strong>
                  </p>
                  <ul>
                    <li>
                      <strong>{t('accessUpdateInfo')}:</strong>{' '}
                      {t('viewUpdateAccountSettings')}
                    </li>
                    <li>
                      <strong>{t('deleteYourAccount')}:</strong>{' '}
                      {t('contactUsToDeleteAccount')}
                    </li>
                  </ul>
                  <p>
                    <strong>{t('thirdPartyServices')}</strong>
                  </p>
                  <p>
                    {t('googleSignInPolicy')}{' '}
                    <a
                      href="https://policies.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'white', textDecoration: 'underline' }}
                    >
                      {t('googlePrivacyPolicyLink')}
                    </a>
                  </p>
                  <p>
                    <strong>{t('changesToPolicy')}</strong>
                  </p>
                  <p>{t('policyUpdates')}</p>
                  <p>
                    <strong>{t('contactUs')}</strong>
                  </p>
                  <p>{t('contactUsDescription')}</p>
                  <p>
                    Attiva TV
                    <br />
                    <a
                      href="mailto:support@attivatv.it"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'white', textDecoration: 'underline' }}
                    >
                      support@attivatv.it
                    </a>
                  </p>
                </Col>
              </Row>
            </Container>

            <div className="separator separator-bottom separator-skew zindex-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                version="1.1"
                viewBox="0 0 2560 100"
                x="0"
                y="0"
              >
                <polygon className="fill-white" points="2560 0 2560 100 0 100" />
              </svg>
            </div>
          </section>
        </div>
      </main>
      <SimpleFooter />
    </>
  );
};

export default Remote;
