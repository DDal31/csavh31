import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const playSuccessSound = () => {
    const audio = new Audio('/success-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.log('Error playing sound:', error);
    });
  };

  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#9333ea', '#a855f7', '#c084fc'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
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