import { useEffect, useMemo, useRef, useState } from "react";
import { downloadFile, formatDate, formatDateTime } from "../utils/formatters.js";

export default function LibraryDialog({
  open,
  onClose,
  savedSops,
  onOpenSop,
  onDeleteSop,
  onDuplicateSop,
  onDownloadSop
}) {
  const dialogRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      setConfirmDeleteId(null);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set();
    savedSops.forEach((item) => {
      const dept = item.department || item.sop?.department;
      if (dept) set.add(dept);
    });
    return ["All", ...Array.from(set).sort()];
  }, [savedSops]);

  // Filter items
  const filteredItems = useMemo(() => {
    return savedSops.filter((item) => {
      const title = (item.name || item.sop?.name || "").toLowerCase();
      const dept = (item.department || item.sop?.department || "").toLowerCase();
      const status = (item.sop?.status || item.status || "draft").toLowerCase();

      const matchesSearch =
        !searchTerm.trim() ||
        title.includes(searchTerm.toLowerCase().trim()) ||
        dept.includes(searchTerm.toLowerCase().trim());

      const matchesDept =
        deptFilter === "All" ||
        (item.department || item.sop?.department || "").toLowerCase() === deptFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [savedSops, searchTerm, deptFilter, statusFilter]);

  const handleDownloadJson = (item) => {
    const data = item.sop || item;
    const jsonStr = JSON.stringify(data, null, 2);
    const filename = `${(item.name || "sop").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    downloadFile(filename, jsonStr, "application/json");
  };

  return (
    <dialog
      className="library-dialog"
      id="libraryDialog"
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{ width: "min(680px, calc(100% - 28px))" }}
    >
      <div className="dialog-header">
        <div>
          <span className="eyebrow eyebrow-muted">ENTERPRISE REPOSITORY</span>
          <h2>Saved Procedures</h2>
        </div>
        <button
          className="dialog-close"
          id="closeLibrary"
          type="button"
          aria-label="Close library"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="library-search-row">
        <input
          type="search"
          className="library-search-input"
          placeholder="Search by title, process name, or department…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="library-filter-select"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="All">All Departments</option>
          {departments
            .filter((d) => d !== "All")
            .map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
        </select>
        <select
          className="library-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <div className="library-list" id="libraryList">
        {!savedSops.length ? (
          <div className="library-empty">
            <span className="empty-icon">▤</span>
            <b>Your library is ready when you are.</b>
            <p>Save your first procedure draft to persist it to the SQLite database.</p>
            <button
              className="button button-primary"
              id="emptyLibraryCreate"
              type="button"
              onClick={() => {
                onClose();
                document.querySelector("#studio")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Create an SOP ↗
            </button>
          </div>
        ) : !filteredItems.length ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#8a7e78" }}>
            <p>No procedures found matching your current search and filters.</p>
            <button
              type="button"
              className="button button-small"
              onClick={() => {
                setSearchTerm("");
                setDeptFilter("All");
                setStatusFilter("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const status = item.sop?.status || item.status || "draft";
            const dateStr = item.sop?.updated_at
              ? formatDateTime(item.sop.updated_at)
              : item.date || "Recently";

            return (
              <div className="saved-item" key={item.id} style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div className="saved-item-main">
                    <span className="saved-file-icon">▤</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <b>{item.name}</b>
                        <span className={`badge-status badge-${status}`} style={{ fontSize: "9.5px", padding: "2px 6px" }}>
                          {status}
                        </span>
                      </div>
                      <small>
                        {item.department} · {item.sop?.id || "SOP"} · Updated {dateStr}
                      </small>
                    </div>
                  </div>
                  <div className="saved-item-actions">
                    <button type="button" onClick={() => onOpenSop(item)} title="Open in editor">
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateSop(item)}
                      title="Duplicate this SOP"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadSop(item)}
                      title="Download as TXT"
                    >
                      .TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadJson(item)}
                      title="Download as JSON"
                    >
                      .JSON
                    </button>
                    <button
                      type="button"
                      style={{ color: "#a4343a" }}
                      onClick={() => setConfirmDeleteId(confirmDeleteId === item.id ? null : item.id)}
                      title="Delete SOP"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {confirmDeleteId === item.id && (
                  <div className="confirm-banner">
                    <span>Permanently delete “{item.name}”? This action cannot be undone.</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="confirm-btn-yes"
                        onClick={() => {
                          setConfirmDeleteId(null);
                          onDeleteSop(item);
                        }}
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        className="confirm-btn-no"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </dialog>
  );
}
