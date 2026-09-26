import PropTypes from 'prop-types';
import './Avatar.css';

const GRADIENTS = [
  ['#08d7f3', '#5398ff'],
  ['#bf97ff', '#526eff'],
  ['#ff48b6', '#ff8a35'],
  ['#14e1d5', '#03c722'],
  ['#ffc93d', '#ff832a'],
  ['#9b90fe', '#6746ec'],
];

function getInitials(name) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);

  if (!words.length) return '#';

  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getGradient(seed) {
  const index = (seed ?? '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return GRADIENTS[index % GRADIENTS.length];
}

export function Avatar({ name, size = 'medium' }) {
  const [from, to] = getGradient(name);

  return (
    <span
      className={`avatar avatar-${size}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

Avatar.propTypes = {
  name: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};
