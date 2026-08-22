import { formatTime } from '../utils/time';
import { SESSION_LABELS } from '../hooks/usePomodoro';

export default function TimerDisplay({ timeLeft, sessionType, status }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <section
      className="timer-display"
      data-session={sessionType}
      aria-label={`${SESSION_LABELS[sessionType]} timer`}
    >
      <p className="status" data-status={status}>
        {status === 'running'
          ? 'Running'
          : status === 'paused'
          ? 'Paused'
          : 'Ready'}
      </p>

      <div
        className="time"
        role="timer"
        aria-label={`${minutes} minutes ${seconds} seconds remaining`}
      >
        {formatTime(timeLeft)}
      </div>
    </section>
  );
}