import { useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Login.module.css";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState("main"); // main | email-entry | password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleEmailContinue = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/check-email", { email });
      if (res.data.exists && res.data.hasPassword) {
        setStep("password");
      } else if (!res.data.exists) {
        // New user — register with email, then complete profile
        setStep("set-password");
      } else {
        setError("This account uses Google login.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (!res.data.user.isProfileComplete) {
        router.push("/register");
      } else if (res.data.user.role === "PHARMACY") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEmail = async () => {
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register-email", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/register");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <p className={styles.tagline}>Secure. Verified. Blockchain-powered.</p>
        </div>

        {/* Main step */}
        {step === "main" && (
          <>
            <button className={styles.googleBtn} onClick={handleGoogle}>
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>or</span>
              <div className={styles.dividerLine} />
            </div>

            <button className={styles.continueBtn} onClick={() => setStep("email-entry")}>
              Continue with Email
            </button>
          </>
        )}

        {/* Email entry step */}
        {step === "email-entry" && (
          <div className={styles.emailSection}>
            <div>
              <label className={styles.label}>Email address</label>
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
                autoFocus
              />
            </div>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <button className={styles.continueBtn} onClick={handleEmailContinue} disabled={loading || !email}>
              {loading ? "Checking..." : "Continue"}
            </button>
            <button className={styles.backBtn} onClick={() => { setStep("main"); setError(""); setEmail(""); }}>
              ← Back
            </button>
          </div>
        )}

        {/* Password step — existing user */}
        {step === "password" && (
          <div className={styles.emailSection}>
            <p style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
              Signing in as <strong>{email}</strong>
            </p>
            <div>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <button className={styles.continueBtn} onClick={handleLogin} disabled={loading || !password}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <button className={styles.backBtn} onClick={() => { setStep("email-entry"); setError(""); setPassword(""); }}>
              ← Back
            </button>
          </div>
        )}

        {/* Set password step — new user */}
        {step === "set-password" && (
          <div className={styles.emailSection}>
            <p style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
              Create a password for <strong>{email}</strong>
            </p>
            <div>
              <label className={styles.label}>Set a Password</label>
              <input
                type="password"
                className={styles.input}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegisterEmail()}
                autoFocus
              />
            </div>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <button className={styles.continueBtn} onClick={handleRegisterEmail} disabled={loading || !password}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <button className={styles.backBtn} onClick={() => { setStep("email-entry"); setError(""); setPassword(""); }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}