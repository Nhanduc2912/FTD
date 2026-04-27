import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'],
    disableForReducedMotion: true, // respects a11y preferences
  });
};
