import { usePomodoro, SESSION_LABELS } from './hooks/usePomodoro';
import TimerDisplay from './components/TimerDisplay.jsx';
import Controls from './components/Controls.jsx';
import SessionSummary from './components/SessionSummary.jsx';
import SettingsForm from './components/SettingsForm.jsx';
import { initAudio } from './utils/sound';

export default function App() {
  const { state, actions } = usePomodoro();

  const {
    status,
    sessionType,
    timeLeft,
    settings,
    completedWorkSessions,
  } = state;

  const handleStart = () => {
    initAudio();
    actions.start();
  };

  return (
    <main className="app">
      <header className="header">
        <h1>Pomodoro Timer</h1>

        <p className="session-badge" data-session={sessionType} role="status">
          {SESSION_LABELS[sessionType]}
        </p>
      </header>

      <TimerDisplay
        timeLeft={timeLeft}
        sessionType={sessionType}
        status={status}
      />

      <Controls
        status={status}
        onStart={handleStart}
        onPause={actions.pause}
        onStop={actions.stop}
        onResetSessions={actions.resetSessions}
      />

      <SessionSummary completedWorkSessions={completedWorkSessions} />

      <SettingsForm
        settings={settings}
        disabled={status !== 'idle'}
        onUpdateSetting={actions.updateSetting}
      />

      <footer className="footer">
        <p>Tip: keep this tab open while the timer is running.</p>
      </footer>
    </main>
  );
}