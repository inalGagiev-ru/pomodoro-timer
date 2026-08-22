export default function SettingsForm({
  settings,
  disabled,
  onUpdateSetting,
}) {
  const handleChange = (event) => {
    onUpdateSetting(event.target.name, event.target.value);
  };

  return (
    <form
      className="card settings"
      onSubmit={(event) => event.preventDefault()}
      aria-describedby="settings-note"
    >
      <h2>Settings</h2>

      <p id="settings-note" className="note">
        Settings can be changed when the timer is stopped.
      </p>

      <div className="settings-grid">
        <label>
          Work minutes
          <input
            type="number"
            name="workDuration"
            value={settings.workDuration}
            min="1"
            max="120"
            step="1"
            onChange={handleChange}
            disabled={disabled}
            required
          />
        </label>

        <label>
          Short break minutes
          <input
            type="number"
            name="shortBreakDuration"
            value={settings.shortBreakDuration}
            min="1"
            max="60"
            step="1"
            onChange={handleChange}
            disabled={disabled}
            required
          />
        </label>

        <label>
          Long break minutes
          <input
            type="number"
            name="longBreakDuration"
            value={settings.longBreakDuration}
            min="1"
            max="90"
            step="1"
            onChange={handleChange}
            disabled={disabled}
            required
          />
        </label>

        <label>
          Work sessions before long break
          <input
            type="number"
            name="sessionsBeforeLongBreak"
            value={settings.sessionsBeforeLongBreak}
            min="1"
            max="12"
            step="1"
            onChange={handleChange}
            disabled={disabled}
            required
          />
        </label>
      </div>
    </form>
  );
}