import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const t = setTimeout(onClose, duration);
      return () => clearTimeout(t);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`toast toast--${type}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast__message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="toast__dismiss"
          onClick={onClose}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
