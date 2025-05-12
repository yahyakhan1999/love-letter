// src/audioManager.js

const textingAudio = new Audio('/texting.mp3');
textingAudio.volume = 0.2;

const notificationAudio = new Audio('/notification.mp3');
notificationAudio.volume = 0.5; // Adjusted for the Apple message sent sound

const audioManager = {
  playTexting: () => {
    textingAudio.currentTime = 0; // rewind before playing
    textingAudio.play().catch(err => {
      console.log('Texting audio playback prevented:', err);
    });
  },
  pauseTexting: () => {
    textingAudio.pause();
  },
  playNotification: () => {
    notificationAudio.currentTime = 0; // rewind before playing
    notificationAudio.play().catch(err => {
      console.log('Apple message sent sound playback prevented:', err);
    });
  },
  isPlaying: () => !textingAudio.paused,
};

export default audioManager;
