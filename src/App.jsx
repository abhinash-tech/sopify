import { useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import StudioWorkspace from "./components/StudioWorkspace.jsx";
import LibraryDialog from "./components/LibraryDialog.jsx";
import DashboardDialog from "./components/DashboardDialog.jsx";
import HeroSection from "./components/HeroSection.jsx";
import ValueStrip from "./components/ValueStrip.jsx";
import ManifestoSection from "./components/ManifestoSection.jsx";
import FeaturesSection from "./components/FeaturesSection.jsx";
import ClosingSection from "./components/ClosingSection.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import { buildLocalSop, templates } from "./data/templates.js";
import {
  deleteSopFromBackend,
  duplicateSopOnBackend,
  fetchBackendHealth,
  fetchSopsFromBackend,
  generateSopWithBackend,
  updateSopOnBackend
} from "./services/api.js";
import { buildSopText, downloadFile, formatDate, formatDateTime } from "./utils/formatters.js";
import "./styles.css";

const STORAGE_KEY = "sopify-saved-sops";

function readSavedSops() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function normalizeRemoteSop(sop) {
  const dateValue = sop.updated_at || sop.created_at;
  const date = dateValue && !Number.isNaN(new Date(dateValue).getTime()) ? formatDateTime(new Date(dateValue)) : formatDate();
  return {
    id: `server-${sop.record_id}`,
    remoteRecordId: sop.record_id,
    name: sop.name,
    department: sop.department,
    date,
    content: buildSopText(sop),
    sop,
    remote: true
  };
}

export default function App() {
  const [activeTemplate, setActiveTemplate] = useState("onboarding");
  const [processName, setProcessName] = useState(templates.onboarding.name);
  const [department, setDepartment] = useState(templates.onboarding.department);
  const [objective, setObjective] = useState(templates.onboarding.objective);
  const [description, setDescription] = useState(templates.onboarding.purpose);
  const [industry, setIndustry] = useState(templates.onboarding.industry || "");
  const [audience, setAudience] = useState(templates.onboarding.audience || "");
  const [complexity, setComplexity] = useState(templates.onboarding.complexity || "Medium");
  const [frequency, setFrequency] = useState("Every 6 months");
  const [policies, setPolicies] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const [currentSop, setCurrentSop] = useState(() => structuredClone(templates.onboarding));
  const [savedSops, setSavedSops] = useState(readSavedSops);
  const [backendSops, setBackendSops] = useState([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [generationMode, setGenerationMode] = useState("Connecting to backend…");
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(toastTimeoutRef.current);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSops));
    } catch {
      // Local storage fallback for isolated sessions
    }
  }, [savedSops]);

  // Initial load: sync health and backend records
  useEffect(() => {
    let cancelled = false;
    fetchBackendHealth().then(async (health) => {
      if (cancelled) return;
      if (health?.status === "ok") {
        setGenerationMode(
          health.ai_enabled
            ? `Backend connected · Google Gemini AI (${health.model})`
            : "Backend connected · Deterministic enterprise sample mode"
        );
        const records = await fetchSopsFromBackend();
        if (!cancelled && records) setBackendSops(records);
      } else {
        setGenerationMode("Local interactive mode · Backend offline");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(""), 3000);
  };

  const handleGenerate = async (payload) => {
    setIsGenerating(true);
    const backendSop = await generateSopWithBackend(payload);
    if (backendSop) {
      const readySop = {
        ...backendSop,
        checklistDone: Array.isArray(backendSop.checklistDone)
          ? backendSop.checklistDone
          : (backendSop.checklist || []).map((_, index) => index === 0)
      };
      setCurrentSop(readySop);
      setBackendSops((prev) => [readySop, ...prev.filter((r) => r.record_id !== readySop.record_id)]);
      setGenerationMode(
        backendSop.source === "gemini"
          ? "Generated with Google Gemini AI"
          : "Generated with Enterprise Deterministic Engine"
      );
      setIsGenerating(false);
      showToast(
        backendSop.source === "gemini"
          ? "AI-generated SOP synthesized and saved to database."
          : "Structured SOP created and saved to database."
      );
    } else {
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      const localSop = buildLocalSop(payload);
      setCurrentSop(localSop);
      setGenerationMode("Local interactive mode · Ready to review");
      setIsGenerating(false);
      showToast("Local SOP draft generated.");
    }

    if (window.innerWidth < 850) {
      window.setTimeout(
        () => document.querySelector("#sopDocument")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60
      );
    }
  };

  const saveCurrentSop = async () => {
    const snapshot = structuredClone(currentSop);
    const content = buildSopText(snapshot);
    const item = {
      id: `${Date.now()}`,
      name: snapshot.name || processName,
      department: snapshot.department || department,
      date: formatDate(),
      content,
      sop: snapshot
    };

    // Update local storage representation
    const existingIndex = savedSops.findIndex(
      (saved) => (saved.sop?.record_id && saved.sop.record_id === snapshot.record_id) || saved.name.toLowerCase() === item.name.toLowerCase()
    );
    if (existingIndex >= 0) {
      setSavedSops((prev) => prev.map((s, idx) => (idx === existingIndex ? { ...item, id: s.id } : s)));
    } else {
      setSavedSops((prev) => [item, ...prev]);
    }

    // Persist to backend database
    if (snapshot.record_id) {
      const synced = await updateSopOnBackend(snapshot.record_id, snapshot, snapshot.status || "draft");
      if (synced) {
        setCurrentSop(synced);
        setBackendSops((prev) => [synced, ...prev.filter((r) => r.record_id !== synced.record_id)]);
        showToast("Changes saved to SQLite database.");
        return;
      }
    } else {
      // If was local draft, generate & persist on backend
      const created = await generateSopWithBackend({
        process_name: snapshot.name,
        department: snapshot.department,
        objective: snapshot.objective,
        description: snapshot.purpose,
        template_key: activeTemplate,
        industry: snapshot.industry,
        audience: snapshot.audience,
        complexity: snapshot.complexity || "Medium"
      });
      if (created) {
        setCurrentSop(created);
        setBackendSops((prev) => [created, ...prev.filter((r) => r.record_id !== created.record_id)]);
        showToast("Procedure persisted to SQLite database.");
        return;
      }
    }

    showToast("SOP saved to workspace library.");
  };

  const openSavedSop = (item) => {
    if (item.sop && Array.isArray(item.sop.steps) && Array.isArray(item.sop.checklist)) {
      const restored = structuredClone(item.sop);
      setCurrentSop(restored);
      setProcessName(restored.name || item.name);
      setDepartment(restored.department || item.department);
      setObjective(restored.objective || "");
      setDescription(restored.purpose || "");
      if (restored.industry) setIndustry(restored.industry);
      if (restored.audience) setAudience(restored.audience);
      if (restored.complexity) setComplexity(restored.complexity);

      const templateMatch = Object.entries(templates).find(([, t]) => t.name === restored.name);
      if (templateMatch) setActiveTemplate(templateMatch[0]);

      setLibraryOpen(false);
      showToast(`Loaded “${restored.name}”.`);
      window.setTimeout(() => document.querySelector("#studio")?.scrollIntoView({ behavior: "smooth" }), 80);
    } else {
      setProcessName(item.name);
      setDepartment(item.department);
      setLibraryOpen(false);
      showToast("Older entry loaded. Click Generate to build its full structure.");
      window.setTimeout(() => document.querySelector("#studio")?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  };

  const handleDuplicateSop = async (item) => {
    const recordId = item.remoteRecordId || item.sop?.record_id;
    if (recordId) {
      const dup = await duplicateSopOnBackend(recordId);
      if (dup) {
        setBackendSops((prev) => [dup, ...prev]);
        showToast(`Created duplicate: “${dup.name}”.`);
        return;
      }
    }

    // Local duplication fallback
    const baseSop = item.sop ? structuredClone(item.sop) : structuredClone(currentSop);
    const newName = `${baseSop.name || item.name} (Copy)`;
    baseSop.name = newName;
    baseSop.id = `${baseSop.id || "SOP"}-COPY`;
    const newLocalItem = {
      id: `${Date.now()}`,
      name: newName,
      department: baseSop.department || item.department,
      date: formatDate(),
      content: buildSopText(baseSop),
      sop: baseSop
    };
    setSavedSops((prev) => [newLocalItem, ...prev]);
    showToast(`Created local duplicate: “${newName}”.`);
  };

  const removeSavedSop = async (item) => {
    const recordId = item.remoteRecordId || item.sop?.record_id;
    setSavedSops((prev) =>
      prev.filter((saved) => {
        const isSameLocalItem = saved.id === item.id;
        const isSameServerRecord = Boolean(recordId) && saved.sop?.record_id === recordId;
        return !isSameLocalItem && !isSameServerRecord;
      })
    );

    if (recordId) {
      const removed = await deleteSopFromBackend(recordId);
      if (removed) {
        setBackendSops((prev) => prev.filter((r) => r.record_id !== recordId));
      }
    }
    showToast("SOP removed from library.");
  };

  const handleDownloadSop = (item) => {
    const text = item.content || buildSopText(item.sop || {});
    const filename = `${(item.name || "sop").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    downloadFile(filename, text, "text/plain;charset=utf-8");
    showToast("Text file downloaded.");
  };

  // Combine backend records with local items, eliminating duplicates
  const localRecordIds = new Set(
    savedSops.map((item) => item.sop?.record_id).filter(Boolean).map(String)
  );
  const libraryItems = [
    ...savedSops,
    ...backendSops
      .filter((record) => !localRecordIds.has(String(record.record_id)))
      .map(normalizeRemoteSop)
  ];

  return (
    <>
      <Header
        savedCount={libraryItems.length}
        onOpenLibrary={() => setLibraryOpen(true)}
        onOpenDashboard={() => setDashboardOpen(true)}
      />

      <main id="top">
        <HeroSection />
        <ValueStrip />
        <ManifestoSection />
        <FeaturesSection />
        <StudioWorkspace
          currentSop={currentSop}
          setCurrentSop={setCurrentSop}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          processName={processName}
          setProcessName={setProcessName}
          department={department}
          setDepartment={setDepartment}
          objective={objective}
          setObjective={setObjective}
          description={description}
          setDescription={setDescription}
          industry={industry}
          setIndustry={setIndustry}
          audience={audience}
          setAudience={setAudience}
          complexity={complexity}
          setComplexity={setComplexity}
          frequency={frequency}
          setFrequency={setFrequency}
          policies={policies}
          setPolicies={setPolicies}
          additionalInstructions={additionalInstructions}
          setAdditionalInstructions={setAdditionalInstructions}
          onToast={showToast}
          onSaveSop={saveCurrentSop}
          onGenerateSop={handleGenerate}
          isGenerating={isGenerating}
          generationMode={generationMode}
        />
        <ClosingSection />
      </main>

      <SiteFooter />

      <div
        className={`toast${toastMessage ? " show" : ""}`}
        id="toast"
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>

      <LibraryDialog
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        savedSops={libraryItems}
        onOpenSop={openSavedSop}
        onDeleteSop={removeSavedSop}
        onDuplicateSop={handleDuplicateSop}
        onDownloadSop={handleDownloadSop}
      />

      <DashboardDialog
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        onOpenSopById={(sop) => {
          openSavedSop({ name: sop.name, department: sop.department, sop });
        }}
        onCreateNew={() => {
          document.querySelector("#studio")?.scrollIntoView({ behavior: "smooth" });
        }}
        onOpenLibrary={() => setLibraryOpen(true)}
      />
    </>
  );
}
