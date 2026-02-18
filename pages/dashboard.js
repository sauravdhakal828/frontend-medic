import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Dashboard.module.css";
import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("../components/QRScanner"), { ssr: false });

const EMPTY_FORM = {
  medicineName: "", dosage: "", frequency: 1,
  times: "", instructions: "", patientName: "",
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [editingUid, setEditingUid] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showPatientScanner, setShowPatientScanner] = useState(false);
  const [patientInput, setPatientInput] = useState("");
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState("");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u || u.role !== "PHARMACY") { router.push("/login"); return; }
    setUser(u);
    fetchPrescriptions();

    // Fetch fresh user data to get pharmacyName, licenceUrl etc.
    api.get("/auth/me").then((res) => {
      const freshUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
    }).catch(() => {});
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      setPrescriptions(res.data.prescriptions);
    } catch { toast.error("Failed to load prescriptions"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUid) {
        await api.put(`/prescriptions/${editingUid}`, form);
        toast.success("Prescription updated!");
      } else {
        await api.post("/prescriptions", form);
        toast.success("Prescription created!");
      }
      setForm(EMPTY_FORM);
      setEditingUid(null);
      setShowForm(false);
      fetchPrescriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving prescription");
    } finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setForm({
      medicineName: p.medicineName, dosage: p.dosage, frequency: p.frequency,
      times: p.times, instructions: p.instructions || "", patientName: p.patientName,
    });
    setEditingUid(p.uid);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const extractPatientId = (value) => {
    let result = value.trim();
    if (result.includes("/patient/")) {
      result = result.split("/patient/")[1];
    }
    return result;
  };

  const handlePatientSearch = async (value) => {
    const patientId = extractPatientId(value || patientInput);
    if (!patientId) return;
    setPatientLoading(true);
    setPatientError("");
    try {
      await api.get(`/auth/patient/${patientId}`);
      setShowPatientModal(false);
      setPatientInput("");
      router.push(`/patient/${patientId}`);
    } catch {
      setPatientError("Patient not found. Please check the code and try again.");
    } finally {
      setPatientLoading(false);
    }
  };

  const handlePatientScan = (result) => {
    setShowPatientScanner(false);
    const patientId = extractPatientId(result);
    setPatientInput(patientId);
    toast.success("QR scanned!");
    handlePatientSearch(patientId);
  };

  const handleFrequencyChange = (val) => {
    const freq = parseInt(val);
    const defaultTimes = { 1: "08:00", 2: "08:00,20:00", 3: "08:00,14:00,20:00", 4: "08:00,12:00,16:00,20:00" };
    setForm({ ...form, frequency: freq, times: defaultTimes[freq] || "" });
  };

  // Member since year
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className={styles.page}>
      <Toaster />

      {/* Patient Scanner */}
      {showPatientScanner && (
        <QRScanner
          onScan={handlePatientScan}
          onClose={() => setShowPatientScanner(false)}
        />
      )}

      {/* Navbar */}
      <nav className={styles.navbar}>
        <span className={styles.navLogo}>PharmaChain</span>
        <div className={styles.navRight}>
          <button className={styles.scanPatientBtn} onClick={() => setShowPatientModal(true)}>
            🔍 Find Patient
          </button>
          <span className={styles.navUser}>{user?.name}</span>
          <button className={styles.logoutBtn} onClick={() => { localStorage.clear(); router.push("/login"); }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Layout: sidebar + main */}
      <div className={styles.layout}>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>

          {/* Avatar + name */}
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarHeader}>
</div>
            <p className={styles.sidebarName}>{user?.name || "Pharmacy Owner"}</p>
            <span className={styles.sidebarBadge}>Pharmacy</span>
          </div>

          {/* Account Info */}
          <div className={styles.sidebarSection}>
            <p className={styles.sidebarSectionTitle}>Account Info</p>

            <div className={styles.sidebarRow}>
              <span className={styles.sidebarLabel}>Email</span>
              <span className={styles.sidebarValue}>{user?.email || "—"}</span>
            </div>

            <div className={styles.sidebarRow}>
              <span className={styles.sidebarLabel}>Login</span>
              <span className={styles.sidebarValue}>
                {user?.googleId
                  ? <span className={styles.googleTag}>Google</span>
                  : <span className={styles.emailTag}>Email</span>
                }
              </span>
            </div>

            <div className={styles.sidebarRow}>
              <span className={styles.sidebarLabel}>Member Since</span>
              <span className={styles.sidebarValue}>{memberSince}</span>
            </div>
          </div>

          {/* Pharmacy Info */}
          <div className={styles.sidebarSection}>
            <p className={styles.sidebarSectionTitle}>Pharmacy Info</p>

            <div className={styles.sidebarRow}>
              <span className={styles.sidebarLabel}>Pharmacy Name</span>
              <span className={styles.sidebarValue}>
                {user?.pharmacyName || <span className={styles.notSet}>Not set</span>}
              </span>
            </div>

            <div className={styles.sidebarRow}>
              <span className={styles.sidebarLabel}>Owner</span>
              <span className={styles.sidebarValue}>{user?.name || "—"}</span>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.sidebarSection}>
            <p className={styles.sidebarSectionTitle}>Stats</p>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <p className={styles.statNumber}>{prescriptions.length}</p>
                <p className={styles.statLabel}>Total Prescriptions</p>
              </div>
              <div className={styles.statBox}>
                <p className={styles.statNumber}>
                  {new Set(prescriptions.map((p) => p.patientName)).size}
                </p>
                <p className={styles.statLabel}>Unique Patients</p>
              </div>
            </div>
          </div>

          {/* Licence */}
          {user?.licenceUrl && (
            <div className={styles.sidebarSection}>
              <p className={styles.sidebarSectionTitle}>Licence</p>
              {user.licenceUrl.endsWith(".pdf") ? (
                <a
                  href={user.licenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.licenceLink}
                >
                  View Licence PDF
                </a>
              ) : (
                <div className={styles.licenceImgWrap}>
                  <img
                    src={user.licenceUrl}
                    alt="Pharmacy Licence"
                    className={styles.licenceImg}
                  />
                  <a
                    href={user.licenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.licenceViewBtn}
                  >
                    View Full Image →
                  </a>
                </div>
              )}
            </div>
          )}

          {!user?.licenceUrl && (
            <div className={styles.noLicence}>
              <p className={styles.noLicenceText}>No licence uploaded</p>
            </div>
          )}

        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className={styles.main}>
          <div className={styles.topBar}>
            <h2 className={styles.pageTitle}>Prescriptions</h2>
            <button
              className={styles.newBtn}
              onClick={() => { setShowForm(!showForm); setEditingUid(null); setForm(EMPTY_FORM); }}
            >
              {showForm ? "✕ Cancel" : "+ New Prescription"}
            </button>
          </div>

          {showForm && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>
                {editingUid ? "✏️ Edit Prescription" : "New Prescription"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Patient Name</label>
                    <input className={styles.input} value={form.patientName}
                      onChange={(e) => setForm({ ...form, patientName: e.target.value })} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Medicine Name</label>
                    <input className={styles.input} value={form.medicineName}
                      onChange={(e) => setForm({ ...form, medicineName: e.target.value })} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Dosage (e.g. 500mg)</label>
                    <input className={styles.input} value={form.dosage}
                      onChange={(e) => setForm({ ...form, dosage: e.target.value })} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Frequency</label>
                    <select className={styles.select} value={form.frequency}
                      onChange={(e) => handleFrequencyChange(e.target.value)}>
                      <option value={1}>Once a day</option>
                      <option value={2}>Twice a day</option>
                      <option value={3}>Three times a day</option>
                      <option value={4}>Four times a day</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Times (e.g. 08:00,14:00)</label>
                    <input className={styles.input} value={form.times}
                      onChange={(e) => setForm({ ...form, times: e.target.value })}
                      placeholder="08:00,14:00,20:00" required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Instructions (optional)</label>
                    <input className={styles.input} value={form.instructions}
                      onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                      placeholder="e.g. Take after meals" />
                  </div>
                  <div className={styles.fieldFull}>
                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      {loading ? "Saving..." : editingUid ? "Update Prescription" : "Create & Generate QR"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {prescriptions.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>No prescriptions yet. Create your first one!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {prescriptions.map((p) => (
                <div key={p.uid} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.medicineName}>{p.medicineName}</p>
                      <p className={styles.patientName}>Patient: {p.patientName}</p>
                    </div>
                    <span className={styles.badge}>{p.dosage}</span>
                  </div>
                  <p className={styles.schedule}>{p.frequency}x/day — {p.times.split(",").join(", ")}</p>
                  {p.instructions && <p className={styles.instructions}>{p.instructions}</p>}
                  <div className={styles.cardActions}>
                    <button className={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                    <button className={styles.qrBtn} onClick={() => setSelectedQR(p)}>QR</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Find Patient Modal */}
      {showPatientModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPatientModal(false)}>
          <div className={styles.patientModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.patientModalHeader}>
              <h3 className={styles.patientModalTitle}>🔍 Find Patient</h3>
              <p className={styles.patientModalSubtitle}>
                Scan patient QR, enter their ID, or paste their profile link
              </p>
            </div>

            <button
              className={styles.patientOptionBtn}
              onClick={() => { setShowPatientModal(false); setShowPatientScanner(true); }}
            >
              <div className={styles.patientOptionText}>
                <p className={styles.patientOptionTitle}>Scan Patient QR</p>
                <p className={styles.patientOptionDesc}>Use camera to scan the patient's QR code</p>
              </div>
              <span className={styles.patientOptionArrow}>→</span>
            </button>

            <div className={styles.patientDivider}>
              <div className={styles.patientDividerLine} />
              <span className={styles.patientDividerText}>or</span>
              <div className={styles.patientDividerLine} />
            </div>

            <div className={styles.patientInputSection}>
              <label className={styles.patientInputLabel}>Enter Patient ID or Profile Link</label>
              <input
                className={styles.patientInput}
                placeholder="e.g. 42  or  http://localhost:3000/patient/42"
                value={patientInput}
                onChange={(e) => setPatientInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePatientSearch()}
                autoFocus
              />
              {patientError && <p className={styles.patientError}>{patientError}</p>}
              <button
                className={styles.patientSearchBtn}
                onClick={() => handlePatientSearch()}
                disabled={patientLoading || !patientInput.trim()}
              >
                {patientLoading ? "Searching..." : "Find Patient →"}
              </button>
            </div>

            <button
              className={styles.patientCancelBtn}
              onClick={() => { setShowPatientModal(false); setPatientError(""); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {selectedQR && (
        <div className={styles.modalOverlay} onClick={() => setSelectedQR(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{selectedQR.medicineName}</h3>
            <p className={styles.modalSubtitle}>Patient: {selectedQR.patientName}</p>
            {selectedQR.qrCode && (
              <img src={selectedQR.qrCode} alt="QR Code" className={styles.qrImage} />
            )}
            <p className={styles.modalHint}>Scan QR or share the code below</p>
            <div className={styles.codeBox}>
              <p className={styles.codeLabel}>Prescription Code</p>
              <p className={styles.codeText}>{selectedQR.uid}</p>
              <button
                className={styles.copyBtn}
                onClick={() => { navigator.clipboard.writeText(selectedQR.uid); toast.success("Code copied!"); }}
              >
                Copy Code
              </button>
            </div>
            <button className={styles.closeBtn} onClick={() => setSelectedQR(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}