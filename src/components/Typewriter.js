import React, { useEffect, useState } from 'react';
import audioManager from '../audioManager';

function Typewriter({ text, words, interval = 2000, className = '' }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setShowCursor(true);

    const type = () => {
      const currentWord = Array.isArray(words) ? words[currentWordIndex] : text;
      if (!currentWord) return; // Guard against undefined text

      if (i <= currentWord.length) {
        setDisplayed(currentWord.slice(0, i));
        if (i === 0) {
          audioManager.playTexting();
        }
        i++;
        setTimeout(type, 35);
      } else if (Array.isArray(words)) {
        // Wait for interval before starting to delete
        setTimeout(() => {
          const deleteText = () => {
            if (i > 0) {
              i--;
              setDisplayed(currentWord.slice(0, i));
              setTimeout(deleteText, 35);
            } else {
              // Move to next word
              setCurrentWordIndex((prev) => (prev + 1) % words.length);
              i = 0;
              setTimeout(type, 500);
            }
          };
          deleteText();
        }, interval);
      }
    };
    
    type();
    const cursorInterval = setInterval(() => setShowCursor(c => !c), 500);
    return () => {
      clearInterval(cursorInterval);
      audioManager.pauseTexting();
    };
  }, [text, words, interval, currentWordIndex]);

  return (
    <span className={className}>
      {displayed}
      <span className="typewriter-cursor" style={{ visibility: showCursor ? 'visible' : 'hidden' }}>|</span>
    </span>
  );
}

export default Typewriter; 