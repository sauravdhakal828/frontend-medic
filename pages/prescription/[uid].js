import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import AlarmScheduler from "../../components/AlarmScheduler";
import styles from "../../styles/Prescription.module.css";

export default function PrescriptionView() {
  const router = useRouter();
  const { uid, from } = router.query; // ← grab `from` from URL
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alarmsEnabled, setAlarmsEnabled] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.get(`/prescriptions/${uid}/verify`);
      setVerifyResult(res.data);
    } catch {
      setVerifyResult({ verified: false });
    } finally {
      setVerifying(false);
    }
  };

  const handleBack = () => {
    if (from === "pharmacy") router.push("/dashboard");
    else if (from === "consumer") router.push("/consumer");
    else router.back(); // fallback if no `from` param
  };

  useEffect(() => {
    if (!uid) return;
    api.get(`/prescriptions/${uid}`)
      .then((res) => {
        setPrescription(res.data.prescription);
        // Auto-save to consumer account if logged in
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (token && user?.role === "CONSUMER") {
          api.post("/prescriptions/save", { prescriptionUid: uid }).catch(() => {});
        }
      })
      .catch(() => setPrescription(null))
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) return (
    <div className={styles.loadingPage}>
      <p className={styles.loadingText}>Loading prescription...</p>
    </div>
  );

  if (!prescription) return (
    <div className={styles.errorPage}>
      <div className={styles.errorBox}>
        <p className={styles.errorText}>Prescription not found</p>
      </div>
    </div>
  );

  const timeList = prescription.times.split(",").map((t) => t.trim());

  return (
    <div className={styles.page}>
      {alarmsEnabled && (
        <AlarmScheduler
          times={prescription.times}
          medicineName={prescription.medicineName}
          dosage={prescription.dosage}
        />
      )}

      <div className={styles.container}>

        <button className={styles.backBtn} onClick={handleBack}>
          ← Back
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>PharmaChain</h1>
          <p className={styles.headerSub}>Verified Prescription</p>
        </div>

        {/* Main Card */}
        <div className={styles.card}>

          {/* Top — medicine name + patient */}
          <div className={styles.cardTop}>
            <div>
              <h2 className={styles.medicineName}>{prescription.medicineName}</h2>
              <span className={styles.dosageBadge}>{prescription.dosage}</span>
            </div>
            <div className={styles.patientBox}>
              <p className={styles.patientLabel}>Patient</p>
              <p className={styles.patientName}>{prescription.patientName}</p>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Schedule */}
          <p className={styles.sectionLabel}>Schedule</p>
          <p className={styles.frequencyText}>
            Take <strong>{prescription.frequency}x</strong> per day
          </p>
          <div className={styles.timesList}>
            {timeList.map((t) => (
              <span key={t} className={styles.timeBadge}>{t}</span>
            ))}
          </div>

          {/* Instructions */}
          {prescription.instructions && (
            <div className={styles.instructionsBox}>
              <p className={styles.instructionsText}>
                <strong>Instructions:</strong> {prescription.instructions}
              </p>
            </div>
          )}

          {/* Pharmacy */}
          <div className={styles.pharmacyBox}>
            <p className={styles.pharmacyLabel}>Prescribed by</p>
            <p className={styles.pharmacyName}>{prescription.pharmacy?.name}</p>
          </div>

          {/* Blockchain section */}
          {prescription.solanaDataHash && (
            <div className={styles.blockchainBox}>
              <p className={styles.blockchainLabel}>Blockchain Record</p>
              <p className={styles.blockchainHash}>{prescription.solanaDataHash}</p>

              {!verifyResult ? (
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className={styles.verifyBtn}
                >
                  {verifying ? "Verifying on Solana..." : "Verify on Solana"}
                </button>
              ) : verifyResult.verified ? (
                <div className={styles.verifiedBox}>
                  <p className={styles.verifiedText}>Verified on Solana Devnet!</p>
                  <a
                    href={verifyResult.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.explorerLink}
                  >
                    View on Solana Explorer →
                  </a>
                </div>
              ) : (
                <p className={styles.notVerified}>⚠️ Error: 0 Balance left</p>
              )}
            </div>
          )}

        </div>

        {/* Alarm Button */}
        {!alarmsEnabled ? (
          <button
            className={styles.alarmBtn}
            onClick={() => setAlarmsEnabled(true)}
          >
            Enable Medicine Alarms
          </button>
        ) : (
          <div className={styles.alarmActive}>Alarms Active!</div>
        )}

      </div>
    </div>
  );
}