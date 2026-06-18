export const demoPatients = [
  {
    id: "PAT-2026-001",
    name: "Rahul Verma",
    age: 42,
    status: "Monitoring",
    condition: "Chest scan follow-up",
  },
  {
    id: "PAT-2026-002",
    name: "Anika Sharma",
    age: 29,
    status: "Stable",
    condition: "Brain MRI review",
  },
  {
    id: "PAT-2026-003",
    name: "Imran Khan",
    age: 55,
    status: "Needs attention",
    condition: "Lung opacity suspicion",
  },
];

export const demoReports = [
  {
    id: "scan-101",
    patientId: "PAT-2026-001",
    disease: "Possible pneumonia pattern",
    confidence: 78,
    summary: "Lower lobe opacity appears consistent with a mild infection pattern.",
    notes: "Recommend clinical correlation and repeat imaging if symptoms worsen.",
    diagnosis: "Likely pneumonia",
    createdAt: new Date().toISOString(),
  },
  {
    id: "scan-102",
    patientId: "PAT-2026-002",
    disease: "No strong abnormality detected",
    confidence: 64,
    summary: "No obvious lesion is visible in the mock review.",
    notes: "Keep monitoring headache pattern.",
    diagnosis: "Reassuring follow-up",
    createdAt: new Date().toISOString(),
  },
];

export const demoReminders = [
  { id: "rem-1", title: "Take morning medicine", time: "08:00", status: "active" },
  { id: "rem-2", title: "Drink water and rest", time: "14:00", status: "active" },
];

export const demoScanGallery = [
  "/samples/scan-01.svg",
  "/samples/scan-02.svg",
  "/samples/scan-03.svg",
];
