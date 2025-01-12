import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const playSuccessSound = () => {
    console.log('Attempting to play success sound...');
    const audio = new Audio('/success-sound.mp3');
    audio.volume = 0.7; // Augmentation légère du volume
    audio.play().catch(error => {
      console.error('Error playing sound:', error);
    }).then(() => {
      console.log('Sound played successfully');
    });
  };

  const triggerConfetti = () => {
    console.log('Triggering confetti animation...');
    const duration = 2000;
    const end = Date.now() + duration;

    // Utilisation de couleurs jaunes vives
    const colors = ['#fbbf24', '#fcd34d', '#fde68a'];

    (function frame() {
      confetti({
        particleCount: 5, // Plus de particules
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    playSuccessSound();
  };

  return { triggerConfetti };
};