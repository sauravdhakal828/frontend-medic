import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Landing.module.css";

export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (token && user) {
      if (user.role === "PHARMACY") router.push("/dashboard");
      else router.push("/consumer");
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          Pharma<span className={styles.navLogoAccent}>Chain</span>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLoginBtn}>Sign In</Link>
          <Link href="/login" className={styles.navSignupBtn}>Get Started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Powered by Solana Blockchain
        </div>

        <h1 className={styles.heroTitle}>
          Prescription Management
          <span className={styles.heroTitleAccent}>Reimagined.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Secure, tamper-proof prescriptions stored on the blockchain.
          Pharmacies create, patients verify — with real-time medicine reminders built in.
        </p>

        <div className={styles.heroActions}>
          <Link href="/login" className={styles.heroPrimaryBtn}>
            🏥 I'm a Pharmacy
          </Link>
          <Link href="/login" className={styles.heroSecondaryBtn}>
            👤 I'm a Patient
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>Tamper-proof</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>Solana</span>
            <span className={styles.statLabel}>Blockchain</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>QR</span>
            <span className={styles.statLabel}>Instant Access</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>⏰</span>
            <span className={styles.statLabel}>Smart Alarms</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <p className={styles.sectionLabel}>Features</p>
        <h2 className={styles.sectionTitle}>Everything you need</h2>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔗</span>
            <h3 className={styles.featureTitle}>Blockchain Verified</h3>
            <p className={styles.featureDesc}>
              Every prescription is hashed and stored on Solana devnet. Patients can verify their prescription hasn't been tampered with — ever.
            </p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📱</span>
            <h3 className={styles.featureTitle}>QR Code Access</h3>
            <p className={styles.featureDesc}>
              Pharmacies generate a QR code for each prescription. Patients scan it to instantly view their full medicine schedule on any device.
            </p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⏰</span>
            <h3 className={styles.featureTitle}>Medicine Alarms</h3>
            <p className={styles.featureDesc}>
              Never miss a dose. Enable smart browser notifications that alert you exactly when it's time to take your medicine.
            </p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🏥</span>
            <h3 className={styles.featureTitle}>Pharmacy Dashboard</h3>
            <p className={styles.featureDesc}>
              Pharmacies get a full dashboard to create, manage and update prescriptions. Scan patient QR codes to instantly access their profile.
            </p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>👤</span>
            <h3 className={styles.featureTitle}>Patient Profiles</h3>
            <p className={styles.featureDesc}>
              Patients have a personal profile with their full medical history, prescription records, and a unique QR code for pharmacies to scan.
            </p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔐</span>
            <h3 className={styles.featureTitle}>Secure Login</h3>
            <p className={styles.featureDesc}>
              Sign in with Google or email. Two account types — pharmacy and consumer — with role-based access control throughout the app.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <p className={styles.sectionLabel}>How it works</p>
        <h2 className={styles.sectionTitle}>Simple. Secure. Fast.</h2>

        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Pharmacy Creates</h3>
            <p className={styles.stepDesc}>
              Pharmacy logs in and creates a prescription with medicine, dosage and schedule.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Stored on Chain</h3>
            <p className={styles.stepDesc}>
              A hash of the prescription is stored on Solana blockchain for permanent verification.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>QR Generated</h3>
            <p className={styles.stepDesc}>
              A unique QR code is generated and shared with the patient instantly.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>Patient Verifies</h3>
            <p className={styles.stepDesc}>
              Patient scans QR, views prescription, verifies on Solana and sets medicine alarms.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>
            Ready to get started?
          </h2>
          <p className={styles.ctaSubtitle}>
            Join pharmacies and patients already using PharmaChain for secure, blockchain-verified prescriptions.
          </p>
          <div className={styles.heroActions}>
            <Link href="/login" className={styles.heroPrimaryBtn}>
              Get Started Free →
            </Link>
            <Link href="/login" className={styles.heroSecondaryBtn}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>PharmaChain</div>
        <p className={styles.footerText}>
          Built on Solana · Secure by design
        </p>
      </footer>
    </div>
  );
}