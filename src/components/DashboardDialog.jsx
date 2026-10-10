import { useEffect, useRef, useState } from "react";
import { fetchDashboardStats, getSopFromBackend } from "../services/api.js";
import { formatDate } from "../utils/formatters.js";

export default function DashboardDialog({ open, onClose, onOpenSopById, onCreateNew, onOpenLibrary }) {
  const dialogRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      if (data) {
        setStats(data);
      } else {
        setError("Unable to connect to live backend metrics.");
      }
    } catch {
      setError("Failed to fetch dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      loadStats();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleOpenRecent = async (recordId) => {
    try {
      const sop = await getSopFromBackend(recordId);
      if (sop) {
        onClose();
        onOpenSopById(sop);
      }
    } catch (err) {
      console.error("Failed to open recent SOP:", err);
    }
  };

  const total = stats?.total_sops || 0;
  const departments = stats?.by_department ? Object.entries(stats.by_department) : [];

  return (
    <dialog
      className="dashboard-dialog"
      id="dashboardDialog"
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-header">
        <div>
          <span className="eyebrow eyebrow-muted">ENTERPRISE INTELLIGENCE</span>
          <h2>Workspace Dashboard</h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            className="btn-mini"
            onClick={loadStats}
            title="Refresh statistics"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button
            className="dialog-close"
            id="closeDashboard"
            type="button"
            aria-label="Close dashboard"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#776e69" }}>
          <b>Loading live metrics from database…</b>
        </div>
      ) : error && !stats ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#a4343a" }}>
          <p>{error}</p>
          <button type="button" className="button button-small" onClick={loadStats}>
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          <div className="stats-cards-grid">
            <div className="stat-card stat-primary">
              <span className="stat-card-label">Total Procedures</span>
              <span className="stat-card-value">{stats?.total_sops ?? 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Draft SOPs</span>
              <span className="stat-card-value" style={{ color: "#a4343a" }}>
                {stats?.draft_count ?? 0}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Under Review</span>
              <span className="stat-card-value" style={{ color: "#9a6b18" }}>
                {stats?.review_count ?? 0}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Approved Standards</span>
              <span className="stat-card-value" style={{ color: "#2c683f" }}>
                {stats?.approved_count ?? 0}
              </span>
            </div>
          </div>

          <div className="dashboard-sections-grid">
            <div className="dash-panel">
              <div className="dash-panel-header">
                <h4>Procedures by Department</h4>
                <span style={{ fontSize: "12px", color: "#8a7e78" }}>
                  {departments.length} {departments.length === 1 ? "Dept" : "Depts"}
                </span>
              </div>
              {!departments.length ? (
                <p style={{ fontSize: "13px", color: "#8a7e78", margin: 0 }}>
                  No departmental records found yet.
                </p>
              ) : (
                <div className="dept-bar-list">
                  {departments.map(([dept, count]) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div className="dept-bar-row" key={dept}>
                        <div className="dept-bar-header">
                          <span>{dept}</span>
                          <span>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="dept-bar-track">
                          <div
                            className="dept-bar-fill"
                            style={{ width: `${Math.max(pct, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="dash-panel">
              <div className="dash-panel-header">
                <h4>Recent Activity</h4>
                <span style={{ fontSize: "12px", color: "#8a7e78" }}>Latest updates</span>
              </div>
              {!stats?.recent_activity?.length ? (
                <p style={{ fontSize: "13px", color: "#8a7e78", margin: 0 }}>
                  No recent changes recorded.
                </p>
              ) : (
                <div className="recent-activity-list">
                  {stats.recent_activity.map((item) => (
                    <div className="recent-activity-item" key={item.id}>
                      <div className="recent-activity-info">
                        <span className="recent-activity-title">{item.title}</span>
                        <span className="recent-activity-meta">
                          {item.department} · {formatDate(item.updated_at)}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span
                          className={`badge-status badge-${item.status || "draft"}`}
                          style={{ fontSize: "9.5px", padding: "2px 5px" }}
                        >
                          {item.status || "draft"}
                        </span>
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() => handleOpenRecent(item.id)}
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dash-actions-row">
            <button
              type="button"
              className="button button-primary"
              style={{ minHeight: "40px", fontSize: "13px", padding: "0 16px" }}
              onClick={() => {
                onClose();
                onCreateNew();
              }}
            >
              Create New SOP ↗
            </button>
            <button
              type="button"
              className="button"
              style={{
                minHeight: "40px",
                fontSize: "13px",
                padding: "0 16px",
                background: "#fff",
                border: "1px solid #dcd4ce",
                color: "#473d39"
              }}
              onClick={() => {
                onClose();
                onOpenLibrary();
              }}
            >
              View Full Library ▤
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
