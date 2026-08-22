export default function Controls({
  status,
  onStart,
  onPause,
  onStop,
  onResetSessions,
}) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  return (
    <div className="controls" role="group" aria-label="Timer controls">
      <button
        type="button"
        className="btn primary"
        onClick={onStart}
        disabled={isRunning}
        aria-label={isPaused ? 'Resume timer' : 'Start timer'}
      >
        {isPaused ? 'Resume' : 'Start'}
      </button>

      <button
        type="button"
        className="btn"
        onClick={onPause}
        disabled={!isRunning}
        aria-label="Pause timer"
      >
        Pause
      </button>

      <button
        type="button"
        className="btn danger"
        onClick={onStop}
        aria-label="Stop and reset current session"
      >
        Stop
      </button>

      <button
        type="button"
        className="btn subtle"
        onClick={onResetSessions}
        aria-label="Reset completed work sessions"
      >
        Reset Count
      </button>
    </div>
  );
}