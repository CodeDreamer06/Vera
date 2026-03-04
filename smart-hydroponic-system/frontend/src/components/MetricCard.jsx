export default function MetricCard({ label, value, unit, warning }) {
  return (
    <div className={`metric-card ${warning ? "warning" : ""}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">
        {value}
        <span>{unit}</span>
      </p>
    </div>
  );
}
