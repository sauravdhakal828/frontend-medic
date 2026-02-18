import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Consumer.module.css";
import dynamic from "next/dynamic";
import QRCode from "qrcode";

const QRScanner = dynamic(() => import("../components/QRScanner"), { ssr: false });

export default function Consumer() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [patientQR, setPatientQR] = useState(null);

  // Extra patient details (stored in localStorage)
  const [showEditModal, setShowEditModal] = useState(false);
  const [extraDetails, setExtraDetails] = useState({
    phone: "",
    age: "",
    bloodGroup: "",
    allergies: "",
    address: "",
  });
  const [editForm, setEditForm] = useState({ ...extraDetails });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !u) { router.push("/login"); return; }
    if (u.role === "PHARMACY") { router.push("/dashboard"); return; }

    // Fetch fresh user data
    api.get("/auth/me").then((res) => {
  const freshUser = res.data.user;
  localStorage.setItem("user", JSON.stringify(freshUser));
  setUser(freshUser);
  // Generate patient QR after we have the user id
  generatePatientQR(freshUser.id);
}).catch(() => {
  setUser(u);
  if (u?.id) generatePatientQR(u.id);
});

    // Load extra details from localStorage
    const saved = JSON.parse(localStorage.getItem("patientDetails") || "{}");
    setExtraDetails(saved);
    setEditForm(saved);

    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      const res = await api.get("/prescriptions/saved");
      setSavedPrescriptions(res.data.prescriptions);
    } catch {
      setSavedPrescriptions([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleSaveDetails = () => {
    localStorage.setItem("patientDetails", JSON.stringify(editForm));
    setExtraDetails(editForm);
    setShowEditModal(false);
    toast.success("Details saved!");
  };

  const extractUid = (value) => {
    let result = value.trim();
    if (result.includes("/prescription/")) {
      result = result.split("/prescription/")[1];
    }
    return result;
  };

  const handleSearch = async (value) => {
    const prescriptionUid = extractUid(value || uid);
    if (!prescriptionUid) return;
    setLoading(true);
    setError("");
    try {
      await api.get(`/prescriptions/${prescriptionUid}`);
      router.push(`/prescription/${prescriptionUid}`);
    } catch {
      setError("Prescription not found. Please check the code and try again.");
      setLoading(false);
    }
  };

  const generatePatientQR = async (userId) => {
  try {
    const url = `${window.location.origin}/patient/${userId}`;
    const qr = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: "#1a56db", light: "#ffffff" },
    });
    setPatientQR(qr);
  } catch (err) {
    console.error("QR generation error:", err);
  }
};

const handleDownloadQR = () => {
  if (!patientQR) return;
  const link = document.createElement("a");
  link.href = patientQR;
  link.download = `patient-card-${user?.name || "qr"}.png`;
  link.click();
};

  const handleScan = (result) => {
    setShowScanner(false);
    const prescriptionUid = extractUid(result);
    setUid(prescriptionUid);
    toast.success("QR scanned!");
    handleSearch(prescriptionUid);
  };

  const getLoginMethod = () => {
    if (!user) return "";
    if (user.googleId) return "Google";
    return "Email";
  };

  return (
    <div className={styles.page}>
      <Toaster />

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Edit Details Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>✏️ Edit Patient Details</h3>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Phone Number</label>
              <input
                className={styles.modalInput}
                placeholder="e.g. +977 9800000000"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Age</label>
              <input
                className={styles.modalInput}
                placeholder="e.g. 28"
                value={editForm.age || ""}
                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Blood Group</label>
              <input
                className={styles.modalInput}
                placeholder="e.g. A+"
                value={editForm.bloodGroup || ""}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Known Allergies</label>
              <input
                className={styles.modalInput}
                placeholder="e.g. Penicillin, Aspirin"
                value={editForm.allergies || ""}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Address</label>
              <input
                className={styles.modalInput}
                placeholder="e.g. Kathmandu, Nepal"
                value={editForm.address || ""}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className={styles.modalSave} onClick={handleSaveDetails}>
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={styles.navbar}>
        <span className={styles.navLogo}>PharmaChain</span>
        <div className={styles.navRight}>
          <span className={styles.navUser}>{user?.name}</span>
          <button
            className={styles.logoutBtn}
            onClick={() => { localStorage.clear(); router.push("/login"); }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* 3-Column Layout */}
      <div className={styles.layout}>

        {/* ── LEFT COLUMN — Patient Details ── */}
        <div className={styles.leftCol}>

          {/* Avatar + Name */}
          <div className={styles.patientHeader}>
            <div className={styles.patientAvatarWrap}>
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className={styles.patientAvatarImg} />
                : <span className={styles.patientAvatarInitial}>
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
              }
            </div>
            <p className={styles.patientName}>{user?.name || "Patient"}</p>
            <span className={styles.patientBadge}>Consumer</span>
          </div>

          {/* Account Info */}
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Account Info</p>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Login Method</span>
              <span className={styles.detailValue}>
                {user?.googleId
                  ? <span className={styles.googleTag}> Google Account</span>
                  : <span className={styles.emailTag}> Email Account</span>
                }
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValueMono}>{user?.email || "—"}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Patient ID</span>
              <span className={styles.detailValueMono}>
                #{String(user?.id || "—").padStart(6, "0")}
              </span>
            </div>
          </div>

          {/* Extra Patient Details */}
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Patient Details</p>

            {extraDetails.phone && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}>{extraDetails.phone}</span>
              </div>
            )}
            {extraDetails.age && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Age</span>
                <span className={styles.detailValue}>{extraDetails.age} years</span>
              </div>
            )}
            {extraDetails.bloodGroup && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Blood Group</span>
                <span className={styles.detailValue}>{extraDetails.bloodGroup}</span>
              </div>
            )}
            {extraDetails.allergies && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Allergies</span>
                <span className={styles.detailValue}>{extraDetails.allergies}</span>
              </div>
            )}
            {extraDetails.address && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Address</span>
                <span className={styles.detailValue}>{extraDetails.address}</span>
              </div>
            )}

            {!extraDetails.phone && !extraDetails.age && !extraDetails.bloodGroup && (
              <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>
                No details added yet
              </p>
            )}
          </div>

          {/* Add Details Button */}
          <button
            className={styles.addDetailsBtn}
            onClick={() => { setEditForm({ ...extraDetails }); setShowEditModal(true); }}
          >
             {extraDetails.phone ? "Edit Details" : "Add Patient Details"}
          </button>

          {patientQR && (
  <div className={styles.patientQrSection}>
    <p className={styles.patientQrTitle}>Patient QR</p>
    <img src={patientQR} alt="Patient QR" className={styles.patientQrImage} />
    
    {/* ADD THIS — shows the ID as text */}
    <div className={styles.patientIdBox}>
      <p className={styles.patientIdLabel}>Patient ID</p>
      <p className={styles.patientIdValue}>#{user?.id}</p>
      <button
        className={styles.patientIdCopy}
        onClick={() => {
          navigator.clipboard.writeText(String(user?.id));
          toast.success("Patient ID copied!");
        }}
      >
        Copy ID
      </button>
    </div>

    <p className={styles.patientQrHint}>
      Show this QR or share your ID with your pharmacy
    </p>
    <button className={styles.patientQrDownload} onClick={handleDownloadQR}>
      Download QR
    </button>
  </div>
)}

        </div>

        {/* ── CENTER COLUMN — Main Actions ── */}
        <div className={styles.centerCol}>
          <h2 className={styles.centerTitle}>
            Welcome back, {user?.name?.split(" ")[0] || "there"} 
          </h2>
          <p className={styles.centerSubtitle}>
            Scan a QR code or enter a prescription code to view your medicine schedule
          </p>

          {/* Scan QR */}
          <button className={styles.scanQrBtn} onClick={() => setShowScanner(true)}>
            <div>
              <p className={styles.scanQrTitle}>Scan QR Code</p>
              <p className={styles.scanQrDesc}>Use your camera to scan the pharmacy QR</p>
            </div>
          </button>

          {/* Divider */}
          <div className={styles.orDivider}>
            <div className={styles.orLine} />
            <span className={styles.orText}>or enter code manually</span>
            <div className={styles.orLine} />
          </div>

          {/* Manual Entry */}
          <div className={styles.scanCard}>
            <h3 className={styles.scanTitle}>Enter Prescription Code</h3>
            <p className={styles.scanDesc}>
              Enter the code or URL given by your pharmacy
            </p>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                placeholder="Paste code or URL here..."
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className={styles.searchBtn}
                onClick={() => handleSearch()}
                disabled={loading || !uid.trim()}
              >
                {loading ? "..." : "View →"}
              </button>
            </div>
            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>

          {/* Info */}
          <div className={styles.infoCard}>
            <div>
              <p className={styles.infoTitle}>How it works</p>
              <p className={styles.infoText}>
                Your pharmacy will give you a QR code or a short code when they create your prescription. Scan it or type it above to view your full medicine schedule and enable reminders.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — My Prescriptions ── */}
        <div className={styles.rightCol}>
          <div className={styles.rightTitle}>
            <span> My Prescriptions</span>
            {savedPrescriptions.length > 0 && (
              <span className={styles.prescriptionCount}>
                {savedPrescriptions.length}
              </span>
            )}
          </div>

          {loadingSaved ? (
            <p className={styles.loadingText}>Loading...</p>
          ) : savedPrescriptions.length === 0 ? (
            <div className={styles.emptyBox}>
              <p className={styles.emptyText}>
                No prescriptions yet. Scan a QR code to get started!
              </p>
            </div>
          ) : (
            <div className={styles.prescriptionList}>
              {savedPrescriptions.map((p) => (
                <div
                  key={p.uid}
                  className={styles.prescriptionCard}
                  onClick={() => router.push(`/prescription/${p.uid}`)}
                >
                  <div className={styles.prescriptionCardTop}>
                    <p className={styles.prescriptionMedicine}>{p.medicineName}</p>
                    <span className={styles.prescriptionDosage}>{p.dosage}</span>
                  </div>
                  <p className={styles.prescriptionPharmacy}>
                    {p.pharmacy?.name}
                  </p>
                  <p className={styles.prescriptionSchedule}>
                    {p.frequency}x/day — {p.times.split(",").join(", ")}
                  </p>
                  <p className={styles.prescriptionArrow}>Tap to view →</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}