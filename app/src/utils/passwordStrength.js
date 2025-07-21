// passwordStrength.js
export const evaluatePasswordStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[\W_]/.test(password)) score++;

  if (score === 5) return { level: 'Strong 💪', color: '#4caf50' };
  if (score >= 3) return { level: 'Fair ⚠️', color: '#ff9800' };
  return { level: 'Weak 🔓', color: '#f44336' };
};
