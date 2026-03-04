export default function AlertList({ alerts }) {
  return (
    <section className="panel">
      <h3>Alerts</h3>
      {alerts?.length ? (
        <ul className="alerts">
          {alerts.map((alert, i) => (
            <li key={`${alert}-${i}`}>{alert}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No active alerts.</p>
      )}
    </section>
  );
}
