export default function SessionSummary({ completedWorkSessions }) {
  return (
    <section className="card summary" aria-live="polite">
      <h2>Progress</h2>
      <p>
        Completed work sessions: <strong>{completedWorkSessions}</strong>
      </p>
    </section>
  );
}