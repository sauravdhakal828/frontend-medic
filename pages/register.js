import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Register.module.css";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("CONSUMER");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Pharmacy-specific fields
  const [pharmacyName, setPharmacyName] = useState("");
  const [licenceFile, setLicenceFile] = useState(null);
  const [licencePreview, setLicencePreview] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setUser(u);
  }, []);

  const handleLicenceChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG or PDF files are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setLicenceFile(file);

    // Show preview only for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setLicencePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      // PDF — show a placeholder
      setLicencePreview("pdf");
    }
  };

  const handleRemoveLicence = () => {
    setLicenceFile(null);
    setLicencePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (role === "PHARMACY" && !pharmacyName.trim()) {
      toast.error("Please enter your pharmacy name");
      return;
    }

    setLoading(true);
    try {
      // Use FormData so we can send the image file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("role", role);
      if (role === "PHARMACY") {
        formData.append("pharmacyName", pharmacyName);
        if (licenceFile) {
          formData.append("licence", licenceFile);
        }
      }

      const res = await api.post("/auth/complete-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Profile complete!");
      setTimeout(() => {
        if (role === "PHARMACY") router.push("/dashboard");
        else router.push("/");
      }, 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Toaster />
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <h1 className={styles.logo}>💊 PharmaChain</h1>
        </div>

        <h2 className={styles.title}>Complete your profile</h2>
        <p className={styles.subtitle}>Just a few more details to get started</p>

        {user?.avatar && (
          <img src={user.avatar} alt="avatar" className={styles.avatar} />
        )}
        {user?.email && (
          <span className={styles.emailBadge}>📧 {user.email}</span>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Full Name */}
          <div className={styles.field}>
            <label className={styles.label}>Your Full Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Role Selector */}
          <div className={styles.field}>
            <label className={styles.label}>I am a...</label>
            <div className={styles.roleGrid}>
              <div
                className={`${styles.roleCard} ${role === "CONSUMER" ? styles.roleCardActive : ""}`}
                onClick={() => setRole("CONSUMER")}
              >
                <p className={styles.roleIcon}>🧑‍⚕️</p>
                <p className={styles.roleTitle}>Consumer</p>
                <p className={styles.roleDesc}>View my prescriptions</p>
              </div>
              <div
                className={`${styles.roleCard} ${role === "PHARMACY" ? styles.roleCardActive : ""}`}
                onClick={() => setRole("PHARMACY")}
              >
                <p className={styles.roleIcon}>🏥</p>
                <p className={styles.roleTitle}>Pharmacy</p>
                <p className={styles.roleDesc}>Manage prescriptions</p>
              </div>
            </div>
          </div>

          {/* Pharmacy-only fields — shown only when PHARMACY is selected */}
          {role === "PHARMACY" && (
            <div className={styles.pharmacySection}>
              <div className={styles.pharmacySectionHeader}>
                <span className={styles.pharmacySectionIcon}>🏥</span>
                <p className={styles.pharmacySectionTitle}>Pharmacy Details</p>
              </div>

              {/* Pharmacy Name */}
              <div className={styles.field}>
                <label className={styles.label}>Pharmacy Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. City Medical Pharmacy"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  required
                />
              </div>

              {/* Licence Upload */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Pharmacy Licence <span className={styles.optional}>(optional)</span>
                </label>

                {!licencePreview ? (
                  <label className={styles.uploadArea} htmlFor="licenceInput">
                    <span className={styles.uploadIcon}>📄</span>
                    <p className={styles.uploadTitle}>Upload Licence Image</p>
                    <p className={styles.uploadDesc}>JPG, PNG or PDF — max 5MB</p>
                    <span className={styles.uploadBtn}>Choose File</span>
                    <input
                      id="licenceInput"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleLicenceChange}
                      className={styles.hiddenInput}
                    />
                  </label>
                ) : (
                  <div className={styles.licencePreviewBox}>
                    {licencePreview === "pdf" ? (
                      <div className={styles.pdfPreview}>
                        <span className={styles.pdfIcon}>📑</span>
                        <p className={styles.pdfName}>{licenceFile?.name}</p>
                      </div>
                    ) : (
                      <img
                        src={licencePreview}
                        alt="Licence preview"
                        className={styles.licencePreviewImg}
                      />
                    )}
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={handleRemoveLicence}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Saving..." : "Get Started →"}
          </button>
        </form>
      </div>
    </div>
  );
}