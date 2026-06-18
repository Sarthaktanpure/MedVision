import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { api, apiFile } from "./lib/api";
import { fileToDataUrl } from "./lib/dataUrl";
import { demoPatients, demoReports, demoReminders, demoScanGallery } from "./data/demo";
import { Badge, Button, Card, CardDescription, CardTitle, Divider, Input, SectionLabel } from "./components/ui";
import { useLocalStorage } from "./hooks/useLocalStorage";

function SvgIcon({ children, className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

const Brain = (props) => <SvgIcon {...props}><path d="M8 5a4 4 0 0 0-4 4v1a3 3 0 0 0 0 6v1a4 4 0 0 0 4 4h1" /><path d="M16 5a4 4 0 0 1 4 4v1a3 3 0 0 1 0 6v1a4 4 0 0 1-4 4h-1" /><path d="M9 7v10" /><path d="M15 7v10" /><path d="M12 5v14" /></SvgIcon>;
const CloudOff = (props) => <SvgIcon {...props}><path d="M17.5 19H6a4 4 0 1 1 .4-7.98A5 5 0 0 1 16.9 9H17a4 4 0 0 1 .5 8" /><path d="M3 3l18 18" /></SvgIcon>;
const ChevronRight = (props) => <SvgIcon {...props}><path d="M9 18l6-6-6-6" /></SvgIcon>;
const LogOut = (props) => <SvgIcon {...props}><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 3v18" /></SvgIcon>;
const Menu = (props) => <SvgIcon {...props}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></SvgIcon>;
const MoonStar = (props) => <SvgIcon {...props}><path d="M12 3a6 6 0 1 0 9 9 9 9 0 1 1-9-9z" /><path d="M18 2l.6 1.8L20 4.4l-1.4.6L18 7l-.6-2-1.4-.6 1.4-.6L18 2z" /></SvgIcon>;
const Plus = (props) => <SvgIcon {...props}><path d="M12 5v14" /><path d="M5 12h14" /></SvgIcon>;
const ScanSearch = (props) => <SvgIcon {...props}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /><path d="M8 11h6" /><path d="M11 8v6" /></SvgIcon>;
const Shield = (props) => <SvgIcon {...props}><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z" /></SvgIcon>;
const SunMedium = (props) => <SvgIcon {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.9 4.9l1.4 1.4" /><path d="M17.7 17.7l1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M4.9 19.1l1.4-1.4" /><path d="M17.7 6.3l1.4-1.4" /></SvgIcon>;
const Upload = (props) => <SvgIcon {...props}><path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 15v4h14v-4" /></SvgIcon>;

const doctorQuickLogin = { email: "doctor@medivision.ai", password: "doctor123" };
const patientQuickLogin = { email: "patient@medivision.ai", password: "patient123" };

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function App() {
  const { user, loading, login, register, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage("medivision_theme", "dark");
  const [offlineMode, setOfflineMode] = useLocalStorage("medivision_offline_mode", false);
  const [activeView, setActiveView] = useState("overview");
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [analysis, setAnalysis] = useLocalStorage("medivision_last_analysis", null);
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reminders, setReminders] = useState(demoReminders);
  const [scanIndex, setScanIndex] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState("PAT-2026-001");
  const [uploadState, setUploadState] = useState({
    patientId: "PAT-2026-001",
    notes: "Lung opacity in the lower right lobe.",
    diagnosis: "Needs physician review",
    modality: "xray",
  });
  const [newReminder, setNewReminder] = useState({ title: "", time: "09:00" });
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("sample-scan.png");
  const [previewSrc, setPreviewSrc] = useState(demoScanGallery[0]);
  const [seriesFrames] = useState(demoScanGallery);
  const [seriesFrameIndex, setSeriesFrameIndex] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!user) return;
    const boot = async () => {
      try {
        const [reportsRes, patientRes, reminderRes] = await Promise.all([
          api.get("/reports"),
          user.role === "doctor" ? api.get("/patients") : Promise.resolve({ patients: [] }),
          user.role === "patient"
            ? api.get(`/reminders/${user.patientId || "PAT-2026-001"}`)
            : Promise.resolve({ reminders: demoReminders }),
        ]);
        setReports(reportsRes.reports || []);
        setPatients(patientRes.patients || []);
        setReminders(reminderRes.reminders || []);
      } catch (_error) {
        setReports(demoReports);
        setPatients(demoPatients);
        setReminders(demoReminders);
      }
    };
    boot();
  }, [user]);

  useEffect(() => {
    if (user?.role === "patient") {
      setSelectedPatientId(user.patientId || "PAT-2026-001");
    }
  }, [user]);

  const visibleReports = useMemo(() => {
    const currentPatient = user?.role === "patient" ? user.patientId : selectedPatientId;
    return (reports.length ? reports : demoReports).filter((report) => !currentPatient || report.patientId === currentPatient);
  }, [reports, selectedPatientId, user]);

  const summary = useMemo(() => {
    const total = reports.length || demoReports.length;
    const reviewed = visibleReports.length;
    const confidence = visibleReports.reduce((sum, item) => sum + (item.confidence || 0), 0) / Math.max(reviewed, 1);
    return [
      { label: "Scans Reviewed", value: total, note: "AI-assisted workflow" },
      { label: "Active Patients", value: patients.length || demoPatients.length, note: "Doctor panel" },
      { label: "Avg Confidence", value: formatPercent(confidence || 72), note: "Current batch" },
      { label: "Reminders", value: reminders.length, note: "Patient portal" },
    ];
  }, [patients.length, reminders.length, reports.length, visibleReports]);

  async function handleLoginQuick(role) {
    setAuthError("");
    try {
      await login(role === "doctor" ? doctorQuickLogin.email : patientQuickLogin.email, role === "doctor" ? doctorQuickLogin.password : patientQuickLogin.password);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setAuthError("");
    try {
      if (authMode === "login") {
        await login(payload.email, payload.password);
      } else {
        await register({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          age: Number(payload.age || 0),
          patientId: payload.patientId || "",
          specialization: payload.specialization || "",
          phone: payload.phone || "",
        });
      }
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    const file = event.currentTarget.scan.files?.[0];
    if (!file) return;
    setLoadingAnalysis(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const response = await apiFile("/uploads/analyze", {
        patientId: uploadState.patientId,
        fileName: file.name,
        fileData: dataUrl,
        mimeType: file.type,
        modality: uploadState.modality,
        notes: uploadState.notes,
        diagnosis: uploadState.diagnosis,
      });
      const nextReport = {
        id: response.scan?._id || `scan-${Date.now()}`,
        patientId: uploadState.patientId,
        fileName: file.name,
        disease: response.report?.disease || response.aiResult?.prediction || "Unknown",
        confidence: response.report?.confidence || response.aiResult?.confidence || 0,
        summary: response.report?.summary || response.aiResult?.summary || "",
        notes: uploadState.notes,
        diagnosis: uploadState.diagnosis,
        createdAt: new Date().toISOString(),
      };
      setAnalysis({
        ...response.report,
        enhanced_image: response.aiResult?.enhanced_image || null,
        heatmap: response.aiResult?.heatmap || null,
        original: dataUrl,
        fileName: file.name,
      });
      setReports((prev) => [nextReport, ...prev]);
      setSelectedPatientId(uploadState.patientId);
    } catch (error) {
      const fallback = {
        disease: "Demo analysis active",
        confidence: 72,
        summary: "The local demo model could not reach the AI service, so a mock result is shown.",
        original: previewSrc,
        enhanced_image: previewSrc,
        heatmap: previewSrc,
        fileName: file.name,
        patientId: uploadState.patientId,
      };
      setAnalysis(fallback);
      setReports((prev) => [
        {
          id: `local-${Date.now()}`,
          patientId: uploadState.patientId,
          fileName: file.name,
          disease: fallback.disease,
          confidence: fallback.confidence,
          summary: fallback.summary,
          notes: uploadState.notes,
          diagnosis: uploadState.diagnosis,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setOfflineMode(true);
      setAuthError(error.message);
    } finally {
      setLoadingAnalysis(false);
    }
  }

  async function handleCreateReminder(event) {
    event.preventDefault();
    if (!newReminder.title) return;
    try {
      const payload = {
        patientId: user?.patientId || selectedPatientId,
        title: newReminder.title,
        time: newReminder.time,
      };
      const response = await api.post("/reminders", payload);
      setReminders((prev) => [response.reminder, ...prev]);
      setNewReminder({ title: "", time: "09:00" });
    } catch {
      setReminders((prev) => [
        { id: `local-${Date.now()}`, title: newReminder.title, time: newReminder.time, status: "active" },
        ...prev,
      ]);
      setNewReminder({ title: "", time: "09:00" });
    }
  }

  function useSampleScan(index) {
    setPreviewSrc(demoScanGallery[index]);
    setSelectedFileName(`demo-scan-${index + 1}.svg`);
    setScanIndex(index);
    setSeriesFrameIndex(index);
  }

  if (loading) {
    return <BootScreen />;
  }

  if (!user) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authError={authError}
        onSubmit={handleAuthSubmit}
        onQuickDoctor={() => handleLoginQuick("doctor")}
        onQuickPatient={() => handleLoginQuick("patient")}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-4 p-4 lg:p-6">
        <aside className={`glass fixed inset-y-4 left-4 z-40 w-[290px] rounded-[28px] p-4 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"}`}>
          <Sidebar
            user={user}
            offlineMode={offlineMode}
            activeView={activeView}
            setActiveView={setActiveView}
            theme={theme}
            setTheme={setTheme}
            onLogout={logout}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <Header
            user={user}
            setSidebarOpen={setSidebarOpen}
            offlineMode={offlineMode}
            setOfflineMode={setOfflineMode}
            theme={theme}
            setTheme={setTheme}
            onLogout={logout}
          />

          {offlineMode && (
            <Card className="border-amber-400/20 bg-amber-400/10">
              <div className="flex items-center gap-3">
                <CloudOff className="h-5 w-5 text-amber-300" />
                <div>
                  <CardTitle>Offline Mode Enabled</CardTitle>
                  <CardDescription>Recent uploads and demo data are cached locally so the dashboard remains usable.</CardDescription>
                </div>
              </div>
            </Card>
          )}

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4">
              <HeroPanel user={user} summary={summary} />
              <div className="grid gap-4 lg:grid-cols-2">
                {summary.map((item) => (
                  <StatCard key={item.label} {...item} />
                ))}
              </div>
              {user.role === "doctor" ? (
                <DoctorWorkspace
                  uploadState={uploadState}
                  setUploadState={setUploadState}
                  handleUpload={handleUpload}
                  loadingAnalysis={loadingAnalysis}
                  previewSrc={previewSrc}
                  setPreviewSrc={setPreviewSrc}
                  selectedFileName={selectedFileName}
                  analysis={analysis}
                  patients={patients.length ? patients : demoPatients}
                  selectedPatientId={selectedPatientId}
                  setSelectedPatientId={setSelectedPatientId}
                  seriesFrames={seriesFrames}
                  seriesFrameIndex={seriesFrameIndex}
                  setSeriesFrameIndex={setSeriesFrameIndex}
                  useSampleScan={useSampleScan}
                  scanIndex={scanIndex}
                />
              ) : (
                <PatientWorkspace
                  reports={visibleReports}
                  reminders={reminders}
                  newReminder={newReminder}
                  setNewReminder={setNewReminder}
                  handleCreateReminder={handleCreateReminder}
                  user={user}
                />
              )}
            </div>

            <div className="grid gap-4">
              <ReportPanel reports={visibleReports.length ? visibleReports : demoReports} selectedPatientId={selectedPatientId} />
              <InsightsPanel user={user} reportCount={visibleReports.length || demoReports.length} />
              <VisualTimeline reports={visibleReports.length ? visibleReports : demoReports} />
            </div>
          </section>
        </main>
      </div>

      <button
        className="fixed bottom-5 right-5 z-50 rounded-full border border-white/10 bg-slate-950/80 p-4 text-slate-100 shadow-2xl backdrop-blur lg:hidden"
        onClick={() => setSidebarOpen((value) => !value)}
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}

function BootScreen() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <Card className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/15">
          <Brain className="h-8 w-8 text-cyan-300" />
        </div>
        <CardTitle>Loading MediVision AI</CardTitle>
        <CardDescription>Preparing secure medical imaging workspace...</CardDescription>
      </Card>
    </div>
  );
}

function AuthScreen({ authMode, setAuthMode, authError, onSubmit, onQuickDoctor, onQuickPatient }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="relative overflow-hidden px-6 py-10 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(104,214,255,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(134,239,172,0.14),transparent_26%)]" />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15">
              <Shield className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">MediVision AI</p>
              <h1 className="text-2xl font-semibold text-white">Doctor-first imaging intelligence</h1>
            </div>
          </div>

          <div className="max-w-2xl space-y-6">
            <Badge tone="accent">Free and open-source stack</Badge>
            <h2 className="text-5xl font-semibold leading-tight text-white md:text-7xl">Diagnose faster, explain better, follow up smarter.</h2>
            <p className="max-w-xl text-base text-slate-300 md:text-lg">
              Secure scan uploads, AI enhancement, Grad-CAM style heatmaps, structured reports, and a lightweight patient portal in one responsive SaaS dashboard.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <FeatureChip title="Image pipeline" text="OpenCV enhancement + heatmaps" />
              <FeatureChip title="Role-based auth" text="Doctor and patient modules" />
              <FeatureChip title="Offline ready" text="Local cache for rural workflows" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <QuickStat title="Support" value="DICOM + image uploads" />
            <QuickStat title="Mode" value="MongoDB or demo-memory fallback" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-10">
        <Card className="w-full max-w-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>{authMode === "login" ? "Sign in" : "Create account"}</CardTitle>
              <CardDescription>Use the doctor or patient demo login, or register your own account.</CardDescription>
            </div>
            <div className="rounded-full bg-white/5 p-1">
              <button onClick={() => setAuthMode("login")} className={`rounded-full px-3 py-2 text-sm ${authMode === "login" ? "bg-cyan-400 text-slate-950" : "text-slate-300"}`}>
                Login
              </button>
              <button onClick={() => setAuthMode("register")} className={`rounded-full px-3 py-2 text-sm ${authMode === "register" ? "bg-cyan-400 text-slate-950" : "text-slate-300"}`}>
                Register
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={onQuickDoctor}>
              Doctor demo login
            </Button>
            <Button variant="secondary" onClick={onQuickPatient}>
              Patient demo login
            </Button>
          </div>

          <Divider />

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {authMode === "register" && <Input name="name" placeholder="Full name" required />}
            <Input name="email" type="email" placeholder="Email address" required />
            <Input name="password" type="password" placeholder="Password" required />
            {authMode === "register" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <select name="role" defaultValue="doctor" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100">
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </select>
                <Input name="patientId" placeholder="Patient ID (optional)" />
                <Input name="age" type="number" placeholder="Age (optional)" />
                <Input name="specialization" placeholder="Specialization (doctor)" />
                <Input name="phone" placeholder="Phone (optional)" />
              </div>
            )}

            {authError && <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{authError}</p>}

            <Button className="w-full" type="submit">
              {authMode === "login" ? "Enter dashboard" : "Create account"}
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}

function Sidebar({ user, offlineMode, activeView, setActiveView, theme, setTheme, onLogout }) {
  const nav = user.role === "doctor"
    ? [
        ["overview", "Overview"],
        ["workspace", "Scan Workspace"],
        ["patients", "Patients"],
        ["reports", "Reports"],
        ["analytics", "Analytics"],
      ]
    : [
        ["overview", "Overview"],
        ["reports", "Reports"],
        ["reminders", "Reminders"],
        ["profile", "Profile"],
      ];

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15">
          <ScanSearch className="h-6 w-6 text-cyan-300" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">MediVision AI</p>
          <p className="text-sm text-slate-300">{user.role === "doctor" ? "Doctor dashboard" : "Patient portal"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">{user.name}</p>
        <p className="text-xs text-slate-400">{user.email}</p>
        <div className="mt-3 flex items-center justify-between">
          <Badge tone={user.role === "doctor" ? "accent" : "success"}>{user.role}</Badge>
          {offlineMode && <Badge tone="warn">Offline</Badge>}
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {nav.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
              activeView === key ? "bg-cyan-400/15 text-cyan-200" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <span>{label}</span>
            <ChevronRight className="h-4 w-4 opacity-60" />
          </button>
        ))}
      </nav>

      <div className="space-y-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
        >
          <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
          <MoonStar className="h-4 w-4" />
        </button>
        <Button variant="secondary" className="w-full" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

function Header({ user, setSidebarOpen, offlineMode, setOfflineMode, theme, setTheme, onLogout }) {
  return (
    <div className="glass flex items-center justify-between rounded-[28px] px-4 py-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">MediVision AI</p>
          <h2 className="text-lg font-semibold text-white">Welcome back, {user.name.split(" ")[0]}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => setOfflineMode(!offlineMode)}>
          {offlineMode ? "Disable offline" : "Simulate rural mode"}
        </Button>
        <Button variant="secondary" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
        <Button variant="danger" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function HeroPanel({ user, summary }) {
  return (
    <Card className="card-raise overflow-hidden border-cyan-400/15 bg-[linear-gradient(135deg,rgba(104,214,255,0.15),rgba(13,23,40,0.95)_60%)]">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <SectionLabel>{user.role === "doctor" ? "Doctor control center" : "Patient summary"}</SectionLabel>
          <h1 className="mt-2 text-4xl font-semibold text-white md:text-5xl">
            {user.role === "doctor"
              ? "Review scans, generate heatmaps, and save structured reports."
              : "Read your reports in simple language and manage reminders."}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            The workspace combines medical image enhancement, AI inference, local fallback caching, and secure role-based access in one flow.
          </p>
        </div>

        <div className="grid gap-3">
          {summary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
              <p className="mt-1 text-sm text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function StatCard({ label, value, note }) {
  return (
    <Card className="card-raise">
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold text-white">{value}</p>
        <Badge tone="accent">Live</Badge>
      </div>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </Card>
  );
}

function DoctorWorkspace({
  uploadState,
  setUploadState,
  handleUpload,
  loadingAnalysis,
  previewSrc,
  selectedFileName,
  analysis,
  patients,
  selectedPatientId,
  setSelectedPatientId,
  seriesFrames,
  seriesFrameIndex,
  setSeriesFrameIndex,
  useSampleScan,
  scanIndex,
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="card-raise">
        <CardTitle>AI Image Processing</CardTitle>
        <CardDescription>Upload a scan, then view the original image, enhanced image, and AI heatmap overlay.</CardDescription>
        <form onSubmit={handleUpload} className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={uploadState.patientId}
              onChange={(event) => {
                const nextPatientId = event.target.value;
                setUploadState((current) => ({ ...current, patientId: nextPatientId }));
                setSelectedPatientId(nextPatientId);
              }}
              className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
            >
              {patients.map((patient) => (
                <option key={patient.id || patient.patientId} value={patient.patientId || patient.id}>
                  {patient.name || patient.patientId}
                </option>
              ))}
            </select>
            <select
              value={uploadState.modality}
              onChange={(event) => setUploadState((current) => ({ ...current, modality: event.target.value }))}
              className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
            >
              <option value="xray">X-Ray</option>
              <option value="ct">CT</option>
              <option value="mri">MRI</option>
            </select>
          </div>

          <Input
            name="scan"
            type="file"
            accept="image/*,.dcm"
            className="file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={uploadState.diagnosis}
              onChange={(event) => setUploadState((current) => ({ ...current, diagnosis: event.target.value }))}
              placeholder="Diagnosis"
            />
            <Input
              value={uploadState.notes}
              onChange={(event) => setUploadState((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Clinical notes"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {seriesFrames.map((frame, index) => (
              <button
                key={frame}
                type="button"
                onClick={() => useSampleScan(index)}
                className={`rounded-full px-3 py-2 text-xs font-semibold ${
                  scanIndex === index ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-slate-300"
                }`}
              >
                Slice {index + 1}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-3">
            <img src={previewSrc} alt="scan preview" className="h-64 w-full rounded-2xl object-cover" />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{selectedFileName}</span>
              <span>Slice {seriesFrameIndex + 1} of {seriesFrames.length}</span>
            </div>
            <input
              type="range"
              min="0"
              max={seriesFrames.length - 1}
              value={seriesFrameIndex}
              onChange={(event) => {
                const index = Number(event.target.value);
                setSeriesFrameIndex(index);
                useSampleScan(index);
              }}
              className="mt-3 w-full"
            />
          </div>

          <Button className="w-full" type="submit" disabled={loadingAnalysis}>
            <Upload className="h-4 w-4" />
            {loadingAnalysis ? "Analyzing scan..." : "Upload and analyze"}
          </Button>
        </form>
      </Card>

      <Card className="card-raise">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Structured Report</CardTitle>
            <CardDescription>Original image, enhanced image, heatmap overlay, notes, and diagnosis.</CardDescription>
          </div>
          <Badge tone={analysis ? "success" : "neutral"}>{analysis ? "Ready" : "Waiting"}</Badge>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <ResultBlock title="Prediction" value={analysis?.disease || "No scan analyzed yet"} />
            <ResultBlock title="Confidence" value={analysis ? formatPercent(analysis.confidence || 0) : "0%"} />
            <ResultBlock title="Summary" value={analysis?.summary || "Upload a scan to generate the AI summary."} />
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
            <div className="flex gap-2 text-xs font-semibold">
              <Badge tone="accent">Original</Badge>
              <Badge tone="success">Enhanced</Badge>
              <Badge tone="warn">Heatmap</Badge>
            </div>
            <div className="mt-4 space-y-3">
              <img src={analysis?.original || previewSrc} alt="original" className="h-32 w-full rounded-2xl object-cover" />
              <img src={analysis?.enhanced_image || previewSrc} alt="enhanced" className="h-32 w-full rounded-2xl object-cover" />
              <img src={analysis?.heatmap || previewSrc} alt="heatmap" className="h-32 w-full rounded-2xl object-cover" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ResultBlock({ title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function PatientWorkspace({ reports, reminders, newReminder, setNewReminder, handleCreateReminder, user }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="card-raise">
        <CardTitle>Your Reports</CardTitle>
        <CardDescription>Simple explanations translated for patients.</CardDescription>
        <div className="mt-4 space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{report.disease}</p>
                <Badge tone="accent">{formatPercent(report.confidence || 0)}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-300">{report.summary || report.explanation}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-500">Basic explanation</p>
              <p className="mt-1 text-sm text-slate-400">{simpleExplain(report.disease)}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className="card-raise">
          <CardTitle>Medicine Reminders</CardTitle>
          <CardDescription>Quick CRUD for daily follow-up routines.</CardDescription>
          <form onSubmit={handleCreateReminder} className="mt-4 space-y-3">
            <Input
              value={newReminder.title}
              onChange={(event) => setNewReminder((current) => ({ ...current, title: event.target.value }))}
              placeholder="Reminder title"
            />
            <div className="flex gap-3">
              <Input
                type="time"
                value={newReminder.time}
                onChange={(event) => setNewReminder((current) => ({ ...current, time: event.target.value }))}
              />
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder._id || reminder.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{reminder.title}</p>
                  <p className="text-xs text-slate-400">{reminder.time}</p>
                </div>
                <Badge tone={reminder.status === "active" ? "success" : "neutral"}>{reminder.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="card-raise">
          <CardTitle>Profile</CardTitle>
          <CardDescription>Patient summary and portal details.</CardDescription>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <ProfileRow label="Name" value={user.name} />
            <ProfileRow label="Patient ID" value={user.patientId || "N/A"} />
            <ProfileRow label="Email" value={user.email} />
            <ProfileRow label="Support" value="Contact your doctor for medical questions" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <span className="text-right text-sm text-slate-200">{value}</span>
    </div>
  );
}

function ReportPanel({ reports, selectedPatientId }) {
  return (
    <Card className="card-raise">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>Reports Table</CardTitle>
          <CardDescription>Saved scans with notes, diagnosis, and confidence.</CardDescription>
        </div>
        <Badge tone="accent">{selectedPatientId || "All patients"}</Badge>
      </div>
      <div className="mt-4 overflow-auto scrollbar">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.22em] text-slate-500">
            <tr>
              <th className="py-3 pr-4">Patient</th>
              <th className="py-3 pr-4">Disease</th>
              <th className="py-3 pr-4">Confidence</th>
              <th className="py-3 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 6).map((report) => (
              <tr key={report.id} className="border-t border-white/10">
                <td className="py-3 pr-4 text-slate-200">{report.patientId}</td>
                <td className="py-3 pr-4 text-slate-300">{report.disease}</td>
                <td className="py-3 pr-4 text-slate-300">{formatPercent(report.confidence || 0)}</td>
                <td className="py-3 pr-4">
                  <Badge tone={(report.confidence || 0) > 75 ? "success" : "warn"}>{(report.confidence || 0) > 75 ? "Stable" : "Review"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InsightsPanel({ user, reportCount }) {
  return (
    <Card className="card-raise">
      <CardTitle>AI Insights</CardTitle>
      <CardDescription>Operational snapshot for the current session.</CardDescription>
      <div className="mt-4 space-y-3">
        <InsightBar label="Workflow completion" value={Math.min(100, 58 + reportCount * 7)} />
        <InsightBar label="Patient engagement" value={user.role === "patient" ? 82 : 68} />
        <InsightBar label="Heatmap quality" value={74} />
      </div>
    </Card>
  );
}

function InsightBar({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function VisualTimeline({ reports }) {
  const points = reports.slice(0, 5).map((report, index) => ({
    label: `R${index + 1}`,
    value: report.confidence || 60,
  }));

  return (
    <Card className="card-raise">
      <CardTitle>Confidence Trend</CardTitle>
      <CardDescription>Simple chart for quick clinic review.</CardDescription>
      <div className="mt-4 flex h-44 items-end gap-3">
        {points.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-end justify-center">
              <div className="w-full rounded-t-2xl bg-gradient-to-t from-cyan-400 to-emerald-300" style={{ height: `${Math.max(22, point.value * 1.4)}px` }} />
            </div>
            <span className="text-xs text-slate-500">{point.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FeatureChip({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function QuickStat({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm text-slate-200">{value}</p>
    </div>
  );
}

function simpleExplain(text) {
  const lower = String(text || "").toLowerCase();
  if (lower.includes("pneumonia")) return "This means there may be a chest infection, so a doctor should review your symptoms.";
  if (lower.includes("tumor")) return "This means the scan needs a specialist review because a growth pattern may be present.";
  if (lower.includes("abnormal")) return "The AI found something unusual and is asking for a clinician to double-check it.";
  return "The scan looks mostly reassuring, but your doctor should still interpret it with the full context.";
}

export default App;
