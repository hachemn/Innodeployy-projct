import { useEffect, useState } from "react";
import { getBackendMonitoring } from "../../services/monitoring.service";
import type { BackendMonitoring } from "../../services/monitoring.service";
import "./Monitoring.css";

function Monitoring() {
  const [monitoring, setMonitoring] = useState<BackendMonitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMonitoring = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBackendMonitoring();
      setMonitoring(data);
    } catch (err) {
      console.error("Failed to load monitoring data:", err);
      setError("Unable to load monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoring();
  }, []);

  if (loading) {
    return (
      <div className="monitoring-page">
        <h1>Monitoring</h1>
        <p className="monitoring-message">Loading monitoring data...</p>
      </div>
    );
  }

  if (error || !monitoring) {
    return (
      <div className="monitoring-page">
        <h1>Monitoring</h1>

        <div className="monitoring-error">
          <p>{error || "Monitoring data is unavailable."}</p>
          <button onClick={loadMonitoring}>Retry</button>
        </div>
      </div>
    );
  }

  const isHealthy = monitoring.status === "healthy";

  return (
    <div className="monitoring-page">
      <div className="monitoring-header">
        <div>
          <h1>Monitoring</h1>
          <p>Monitor your application health and resources.</p>
        </div>

        <button
          className="refresh-button"
          onClick={loadMonitoring}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="monitoring-grid">
        <div className="monitoring-card">
          <h2>Backend Status</h2>

          <div className={`status ${isHealthy ? "healthy" : "unhealthy"}`}>
            <span className="status-dot"></span>
            {isHealthy ? "Healthy" : "Unhealthy"}
          </div>

          <div className="card-detail">
            <span>Pod</span>
            <strong>{monitoring.pod}</strong>
          </div>
        </div>

        <div className="monitoring-card">
          <h2>CPU Usage</h2>

          <div className="metric-value">
            {monitoring.cpuPercent}%
          </div>

          <p className="metric-label">Backend CPU usage</p>
        </div>

        <div className="monitoring-card">
          <h2>Memory Usage</h2>

          <div className="metric-value">
            {monitoring.memoryMb} MB
          </div>

          <p className="metric-label">Backend memory usage</p>
        </div>
      </div>

      <div className="monitoring-card alerts-card">
        <div className="alerts-header">
          <div>
            <h2>Alerts</h2>
            <p>Current alerts detected by InnoDeployy.</p>
          </div>

          <span className="alert-count">
            {monitoring.alerts.length}
          </span>
        </div>

        {monitoring.alerts.length === 0 ? (
          <div className="no-alerts">
            <span>✓</span>

            <div>
              <strong>No active alerts</strong>
              <p>Your backend is operating normally.</p>
            </div>
          </div>
        ) : (
          <div className="alerts-list">
            {monitoring.alerts.map((alert) => (
              <div
                className="alert-item"
                key={`${alert.name}-${alert.startsAt}`}
              >
                <div>
                  <strong>{alert.summary || alert.name}</strong>
                  <p>{alert.description}</p>
                </div>

                <span className="alert-severity">
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Monitoring;