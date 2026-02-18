import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import toast, { Toaster } from "react-hot-toast";
import styles from "../../styles/Patient.module.css";

const EMPTY_FORM = {
  medicineName: "",
  dosage: "",
  frequency: 1,
  times: "08:00",
  instructions: "",
  patientName: "",
};

export default function PatientProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUid, setEditingUid] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setUserRole(u?.role);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/auth/patient/${id}`);
      setPatient(res.data.patient);

      // Pre-fill patient name in form
      setForm((f) => ({ ...f, patientName: res.data.patient.name || "" }));
    } catch {
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFrequencyChange = (val) => {
    const freq = parseInt(val);
    const defaultTimes = {
      1: "08:00",
      2: "08:00,20:00",
      3: "08:00,14:00,20:00",
      4: "08:00,12:00,16:00,20:00",
    };
    setForm({ ...form, frequency: freq, times: defaultTimes[freq] || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUid) {
        // Update existing prescription
        await api.put(`/prescriptions/${editingUid}`, form);
        toast.success("Prescription updated!");
      } else {
        // Create new prescription for this patient
        await api.post(`/prescriptions/for-patient/${id}`, form);
        toast.success("Prescription added to patient!");
      }
      setShowForm(false);
      setEditingUid(null);
      setForm({ ...EMPTY_FORM, patientName: patient?.name || "" });
      fetchPatient();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    setForm({
      medicineName: p.medicineName,
      dosage: p.dosage,
      frequency: p.frequency,
      times: p.times,
      instructions: p.instructions || "",
      patientName: p.patientName,
    });
    setEditingUid(p.uid);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return (
    <div className={styles.loadingPage}>
      <p className={styles.loadingText}>Loading patient profile...</p>
    </div>
  );

  if (!patient) return (
    <div className={styles.errorPage}>
      <p className={styles.errorText}>❌ Patient not found</p>
    </div>
  );

  const timeList = (times) => times.split(",").map((t) => t.trim());

  return (
    <div className={styles.page}>
      <Toaster />

      {/* Navbar */}
      <nav className={styles.navbar}>
        <span className={styles.navLogo}>PharmaChain</span>
        <button
          className={styles.backBtn}
          onClick={() => {
            if (userRole === "PHARMACY") router.push("/dashboard");
            else router.push("/consumer");
          }}
        >
          ← Back
        </button>
      </nav>

      <div className={styles.layout}>

        {/* ── LEFT — Patient Info ── */}
        <div className={styles.leftCol}>

          <div className={styles.patientHeader}>
            <div className={styles.avatarWrap}>
              {patient.avatar
                ? <img src={patient.avatar} alt="avatar" className={styles.avatarImg} />
                : <span className={styles.avatarInitial}>
                    {patient.name?.[0]?.toUpperCase() || "?"}
                  </span>
              }
            </div>
            <p className={styles.patientName}>{patient.name}</p>
            <p className={styles.patientEmail}>{patient.email}</p>
            <span className={styles.patientBadge}>Patient</span>
          </div>

          {/* Account Details */}
          <div>
            <p className={styles.sectionTitle}>Account Info</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Patient ID</span>
                <span className={styles.detailValueMono}>
                  #{String(patient.id).padStart(6, "0")}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValueMono}>{patient.email}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Prescriptions</span>
                <span className={styles.detailValue}>
                  {patient.prescriptions?.length || 0} prescription(s)
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Member Since</span>
                <span className={styles.detailValue}>
                  {new Date(patient.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric"
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Blockchain note */}
          <div style={{
            background: "#faf5ff",
            border: "1px solid #e9d5ff",
            borderRadius: 12,
            padding: "12px 14px",
            marginTop: "auto"
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 4 }}>
              🔗 Blockchain Protected
            </p>
            <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
              All prescriptions created here are stored on Solana devnet for tamper-proof verification.
            </p>
          </div>

        </div>

        {/* ── RIGHT — Prescriptions ── */}
        <div className={styles.rightCol}>
          <div className={styles.rightHeader}>
            <div>
              <h2 className={styles.rightTitle}>
                {patient.name}'s Prescriptions
              </h2>
              <p className={styles.rightSubtitle}>
                {userRole === "PHARMACY"
                  ? "Add or edit prescriptions for this patient"
                  : "Viewing patient prescriptions"}
              </p>
            </div>
            {userRole === "PHARMACY" && (
              <button
                className={styles.addPrescriptionBtn}
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingUid(null);
                  setForm({ ...EMPTY_FORM, patientName: patient.name || "" });
                }}
              >
                {showForm ? "✕ Cancel" : "+ Add Prescription"}
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm && userRole === "PHARMACY" && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>
                {editingUid ? "Edit Prescription" : " New Prescription"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Patient Name</label>
                    <input
                      className={styles.input}
                      value={form.patientName}
                      onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Medicine Name</label>
                    <input
                      className={styles.input}
                      value={form.medicineName}
                      onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Dosage</label>
                    <input
                      className={styles.input}
                      placeholder="e.g. 500mg"
                      value={form.dosage}
                      onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Frequency</label>
                    <select
                      className={styles.select}
                      value={form.frequency}
                      onChange={(e) => handleFrequencyChange(e.target.value)}
                    >
                      <option value={1}>Once a day</option>
                      <option value={2}>Twice a day</option>
                      <option value={3}>Three times a day</option>
                      <option value={4}>Four times a day</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Times</label>
                    <input
                      className={styles.input}
                      placeholder="e.g. 08:00,14:00"
                      value={form.times}
                      onChange={(e) => setForm({ ...form, times: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Instructions</label>
                    <input
                      className={styles.input}
                      placeholder="e.g. Take after meals"
                      value={form.instructions}
                      onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <div className={styles.formActions}>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={styles.submitBtn}
                      >
                        {submitting ? "Saving..." : editingUid ? "Update" : "Add Prescription"}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => { setShowForm(false); setEditingUid(null); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Prescriptions List */}
          {patient.prescriptions?.length === 0 ? (
            <div className={styles.emptyBox}>
              <p className={styles.emptyText}>
                {userRole === "PHARMACY"
                  ? "No prescriptions yet. Add one above!"
                  : "No prescriptions found for this patient."}
              </p>
            </div>
          ) : (
            <div className={styles.prescriptionGrid}>
              {patient.prescriptions?.map((p) => (
                <div key={p.uid} className={styles.prescriptionCard}>
                  <div className={styles.prescriptionCardTop}>
                    <p className={styles.medicineName}>{p.medicineName}</p>
                    <span className={styles.dosageBadge}>{p.dosage}</span>
                  </div>
                  <p className={styles.prescriptionDetail}>
                    {p.frequency}x per day
                  </p>
                  <div className={styles.prescriptionTimes}>
                    {timeList(p.times).map((t) => (
                      <span key={t} className={styles.timeBadge}>{t}</span>
                    ))}
                  </div>
                  {p.instructions && (
                    <p className={styles.prescriptionDetail}>
                       {p.instructions}
                    </p>
                  )}
                  <p className={styles.pharmacyTag}>
                    {p.pharmacy?.name}
                  </p>
                  {userRole === "PHARMACY" && (
                    <button
                      className={styles.editPrescriptionBtn}
                      onClick={() => handleEdit(p)}
                    >
                      Edit Prescription
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}