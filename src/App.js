import React, { useEffect, useState } from 'react';
import audioManager from './audioManager';
import Typewriter from './components/Typewriter';
import AlternatingTypewriter from './components/AlternatingTypewriter';
import NextButton from './components/NextButton';
import { sections, bgColors } from './data/sections';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bgColor, setBgColor] = useState(bgColors[0]);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [removedVideos, setRemovedVideos] = useState(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isContentTransitioning, setIsContentTransitioning] = useState(false);
  const [backgroundVideo, setBackgroundVideo] = useState(null);

  // Scroll reveal effect for visible sections and background color update
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Get the section index from the data attribute
          const sectionIndex = parseInt(entry.target.getAttribute('data-section-index'));
          if (!isNaN(sectionIndex)) {
            setBgColor(bgColors[sectionIndex]);
          }
        }
      });
    }, {
      threshold: 0.5 // Trigger when section is 50% visible
    });

    const sections = document.querySelectorAll('.letter-section, .image-section');
    sections.forEach((section, index) => {
      section.setAttribute('data-section-index', index);
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [currentStep]);

  // Change background color when advancing to the next step
  const handleNext = () => {
    if (isTransitioning) return; // Prevent multiple clicks during transition
    
    setIsTransitioning(true);
    audioManager.pauseTexting();
    audioManager.playNotification();

    if (currentStep < sections.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setBgColor(bgColors[nextStep]);
      
      // Update background video state
      const nextSection = sections[nextStep];
      const currentSection = sections[currentStep];
      if (currentSection.keepVideo) {
        // If current section has keepVideo, maintain it for next sections
        setBackgroundVideo(currentSection);
      } else if (nextSection.youtubeId && !nextSection.keepVideo) {
        setBackgroundVideo(null);
      } else if (nextSection.keepVideo) {
        setBackgroundVideo(nextSection);
      }
      
      setIsTransitioning(false);
    }
  };

  const handlePauseVideo = () => {
    setIsVideoPaused(!isVideoPaused);
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (isVideoPaused) {
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    });
  };

  const handleRemoveVideo = (sectionId) => {
    setRemovedVideos(prev => new Set([...prev, sectionId]));
  };

  const currentSection = sections[currentStep];
  const isVideoStep = currentSection?.videoUrl || currentSection?.youtubeId || currentSection?.backgroundGif;
  const isFirstSection = currentStep === 0;
  const isLastSection = currentStep === sections.length - 1;

  return (
    <div className="App" style={{ 
      background: isVideoStep ? 'transparent' : bgColor, 
      transition: 'background 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
      position: 'relative',
      minHeight: '100vh'
    }}>
      {isVideoStep && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none'
          }}>
            {currentSection.videoUrl ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              >
                <source src={currentSection.videoUrl} type="video/mp4" />
              </video>
            ) : currentSection.backgroundGif ? (
              <img
                src={currentSection.backgroundGif}
                alt="Background"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (backgroundVideo || (!currentSection.foregroundVideo && currentSection.youtubeId)) ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${(backgroundVideo || currentSection).youtubeId}?autoplay=1&controls=0&loop=1&playlist=${(backgroundVideo || currentSection).youtubeId}&rel=0&start=${(backgroundVideo || currentSection).startTime || 0}&enablejsapi=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              ></iframe>
            ) : null}
          </div>
        </>
      )}
      <div className="love-letter" style={{ position: 'relative', zIndex: 1 }}>
        {sections.slice(0, currentStep + 1).map((section, idx) => (
          <React.Fragment key={idx}>
            {section.videoUrl || section.youtubeId || section.backgroundGif ? (
              <>
                <section className="image-section" data-section-index={idx}>
                  <div 
                    style={{
                      width: '100%',
                      height: '400px',
                      position: 'relative',
                      backgroundColor: '#000',
                      overflow: 'hidden'
                    }}
                  >
                    <div className={`section-content ${isContentTransitioning ? 'transitioning' : ''}`} style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative'
                    }}>
                      {section.backgroundGif ? (
                        <img
                          src={section.backgroundGif}
                          alt={section.alt}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 1
                          }}
                        />
                      ) : section.youtubeId && !section.keepVideo && !removedVideos.has(section.id) ? (
                        <div 
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            cursor: 'pointer',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <div style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${section.youtubeId}?autoplay=1&controls=0&loop=1&playlist=${section.youtubeId}&rel=0&start=${section.startTime || 0}&enablejsapi=1`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'fill',
                                pointerEvents: 'none',
                                
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={section.backgroundImage || section.image}
                          alt={section.alt}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            opacity: 0.7,
                            zIndex: 1,
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                      {section.foregroundGif && (
                        <img
                          src={section.foregroundGif}
                          alt="Foreground GIF"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            objectFit: 'fill',
                            pointerEvents: 'none',
                            zIndex: 2
                          }}
                        />
                      )}
                    </div>
                  </div>
                </section>
                <section className={`letter-section video-bg-content ${isContentTransitioning ? 'transitioning' : ''}`} data-section-index={idx}>
                  <div style={{ width: '100%' }}>
                    {section.header && <h1>{section.header}</h1>}
                    <div style={{ width: '100%' }}>
                      {section.useAlternatingTypewriter ? (
                        <AlternatingTypewriter 
                          baseText={section.text}
                          className={section.className}
                        />
                      ) : section.typewriter ? (
                        <Typewriter 
                          words={section.typewriter.words}
                          interval={section.typewriter.interval}
                          className={section.typewriter.className}
                        />
                      ) : (
                        <Typewriter text={section.text} />
                      )}
                      {section.signature && !section.useAlternatingTypewriter && <><br /><Typewriter text={section.signature} className="signature" /></>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {!isLastSection && <NextButton onClick={handleNext} />}
                    {section.youtubeId && !section.keepVideo && !removedVideos.has(section.id) && (
                      <NextButton onClick={() => handleRemoveVideo(section.id)} isPause={true} />
                    )}
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="image-section" data-section-index={idx}>
                  <div 
                    style={{ 
                      position: 'relative',
                      cursor: 'pointer'
                    }} 
                    onClick={!isLastSection ? handleNext : undefined}
                  >
                    <div className={`section-content ${isContentTransitioning ? 'transitioning' : ''}`}>
                      <img
                        src={section.image}
                        alt={section.alt}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      {section.foregroundGif && (
                        <img
                          src={section.foregroundGif}
                          alt="Foreground GIF"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            height: '90%',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            zIndex: 2
                          }}
                        />
                      )}
                    </div>
                  </div>
                </section>
                <section className={`letter-section ${isContentTransitioning ? 'transitioning' : ''}`} data-section-index={idx}>
                  {section.header && <h1>{section.header}</h1>}
                  <div style={{ width: '100%' }}>
                    {section.useAlternatingTypewriter ? (
                      <AlternatingTypewriter 
                        baseText={section.text}
                        className={section.className}
                      />
                    ) : section.typewriter ? (
                      <Typewriter 
                        words={section.typewriter.words}
                        interval={section.typewriter.interval}
                        className={section.typewriter.className}
                      />
                    ) : (
                      <Typewriter text={section.text} />
                    )}
                    {section.signature && !section.useAlternatingTypewriter && <><br /><Typewriter text={section.signature} className="signature" /></>}
                  </div>
                  {!isLastSection && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <NextButton onClick={handleNext} />
                    </div>
                  )}
                </section>
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default App;
