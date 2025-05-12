import React, { useEffect, useState, useRef } from 'react';
import audioManager from '../audioManager';

function AlternatingTypewriter({ className = '' }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef(null);
  const cursorIntervalRef = useRef(null);
  const textIndexRef = useRef(0);
  const texts = [
    { base: "<さ よ な ら  / ", word: " L o v e ..." },
    { base: "<よ り  / ", word: " F r o m ..." }
  ];

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setShowCursor(true);
    textIndexRef.current = 0;

    const type = () => {
      const currentText = texts[textIndexRef.current];
      const fullText = currentText.base + currentText.word;
      
      if (i <= fullText.length) {
        // Typing
        setDisplayed(fullText.slice(0, i));
        if (i === 0) {
          audioManager.playTexting();
        }
        i++;
        timeoutRef.current = setTimeout(type, 50);
      } else {
        // Finished typing, wait and start over with next text
        timeoutRef.current = setTimeout(() => {
          textIndexRef.current = (textIndexRef.current + 1) % texts.length;
          i = 0;
          type();
        }, 2000);
      }
    };
    
    type();
    cursorIntervalRef.current = setInterval(() => setShowCursor(c => !c), 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
      audioManager.pauseTexting();
    };
  }, []);

  return (
    <span className={className}>
      {displayed}
      <span className="typewriter-cursor" style={{ visibility: showCursor ? 'visible' : 'hidden' }}>|</span>
    </span>
  );
}

export default AlternatingTypewriter; 