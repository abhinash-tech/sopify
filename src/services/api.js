const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      if (err.detail) message = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
    } catch {
      const text = await response.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function generateSopWithBackend(input) {
  try {
    return await request("/sops/generate", {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (err) {
    console.warn("Backend SOP generation failed, will fall back if appropriate:", err);
    return null;
  }
}

export async function updateSopOnBackend(recordId, sop, status = null) {
  if (!recordId) return null;
  try {
    return await request(`/sops/${recordId}`, {
      method: "PUT",
      body: JSON.stringify({
        sop,
        status: status || sop.status || "draft"
      })
    });
  } catch (err) {
    console.error("Failed to update SOP on backend:", err);
    return null;
  }
}

export async function fetchBackendHealth() {
  try {
    return await request("/health");
  } catch {
    return { status: "offline", service: "sopify-api", database: "disconnected", ai_enabled: false, model: "none" };
  }
}

export async function fetchSopsFromBackend(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.department && filters.department !== "All") params.set("department", filters.department);
    if (filters.status && filters.status !== "All") params.set("status", filters.status);
    if (filters.limit) params.set("limit", filters.limit);
    if (filters.offset) params.set("offset", filters.offset);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await request(`/sops${queryString}`);
  } catch (err) {
    console.error("Failed to fetch SOPs from backend:", err);
    return null;
  }
}

export async function getSopFromBackend(recordId) {
  if (!recordId) return null;
  try {
    return await request(`/sops/${recordId}`);
  } catch (err) {
    console.error("Failed to get SOP from backend:", err);
    return null;
  }
}

export async function duplicateSopOnBackend(recordId) {
  if (!recordId) return null;
  try {
    return await request(`/sops/${recordId}/duplicate`, {
      method: "POST"
    });
  } catch (err) {
    console.error("Failed to duplicate SOP on backend:", err);
    return null;
  }
}

export async function deleteSopFromBackend(recordId) {
  if (!recordId) return false;
  try {
    await request(`/sops/${recordId}`, { method: "DELETE" });
    return true;
  } catch (err) {
    console.error("Failed to delete SOP from backend:", err);
    return false;
  }
}

export async function fetchDashboardStats() {
  try {
    return await request("/dashboard/stats");
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    return null;
  }
}
