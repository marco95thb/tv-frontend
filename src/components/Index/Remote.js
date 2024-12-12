import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import RemoteNavbar from "src/components/Navbars/RemoteNavbar";
import SimpleFooter from 'src/components/Footers/SimpleFooter';

// Importing sound files
import beep1 from './beep.mp3';
import beep2 from './beep.mp3';
import beep3 from './beep.mp3';
import beep4 from './beep.mp3';
import beep5 from './beep.mp3';
import beep6 from './beep.mp3';
import beep7 from './beep.mp3';
import beep8 from './beep.mp3';
import beep9 from './beep.mp3';

const Remote = () => {
  const beepSounds = [beep1, beep2, beep3, beep4, beep5, beep6, beep7, beep8, beep9];

  const playBeep = (index) => {
    const audio = new Audio(beepSounds[index]);
    audio.play();
  };

  const buttonStyle = {
    width: '100%',
    height: '100px',
    fontSize: '1.5em',
  };

  return (
    <>
      <RemoteNavbar />
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
            <Container className="shape-container d-flex align-items-center py-lg">
              <div className="col px-0">
                <Row className="align-items-center justify-content-center">
                  <Col className="text-center" lg="6">
                    <div className="btn-wrapper mt-5">
                      <Container>
                        {Array.from({ length: 3 }, (_, rowIndex) => (
                          <Row key={rowIndex} className="mb-3">
                            {Array.from({ length: 3 }, (_, colIndex) => {
                              const buttonNumber = rowIndex * 3 + colIndex;
                              return (
                                <Col key={colIndex} xs="4">
                                  <Button
                                    color="github"
                                    style={buttonStyle}
                                    onClick={() => playBeep(buttonNumber)}
                                  >
                                    {buttonNumber + 1}
                                  </Button>
                                </Col>
                              );
                            })}
                          </Row>
                        ))}
                      </Container>
                    </div>
                  </Col>
                </Row>
              </div>
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
}

export default Remote;
