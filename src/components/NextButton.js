import React, { useState } from 'react';
import './NextButton.css';

const NextButton = ({ onClick, isVideo, isPlaying, onStop }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    setIsVisible(false);
    if (isVideo) {
      if (isPlaying) {
        onStop();
      } else {
        onClick();
      }
    } else {
      onClick();
    }
  };

  if (!isVisible) return null;

  return (
    <button 
      className="next-button" 
      onClick={handleClick}
    >
      {isVideo ? (isPlaying ? '■' : '▶') : '▶'}
    </button>
  );
};

export default NextButton; 