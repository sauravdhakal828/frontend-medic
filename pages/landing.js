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
      {/* Background elements */}
      <div className={styles.gridBg} />
      <div className={styles.accentLine1} />
      <div className={styles.accentLine2} />

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          Pharma<span className={styles.navLogoAccent}>Chain</span>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLoginBtn}>Sign In</Link>
          <Link href="/login" className={styles.navSignupBtn}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgePulse} />
          Powered by Solana Blockchain
        </div>

        <h1 className={styles.heroTitle}>
          Prescription Management
          <br />
          <span className={styles.heroTitleAccent}>Reimagined.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Secure, tamper-proof prescriptions stored on the blockchain.
          Pharmacies create, patients verify — with real-time medicine reminders built in.
        </p>

        <div className={styles.heroActions}>
          <Link href="/login" className={styles.heroPrimaryBtn}>
            I&apos;m a Pharmacist
          </Link>
          <Link href="/login" className={styles.heroSecondaryBtn}>
            I&apos;m a Patient
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>Tamper-proof</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>Solana</span>
            <span className={styles.statLabel}>Blockchain</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>QR</span>
            <span className={styles.statLabel}>Instant Access</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>Smart</span>
            <span className={styles.statLabel}>Alarms</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Features</span>
          <h2 className={styles.sectionTitle}>Everything you need</h2>
          <p className={styles.sectionDesc}>Built for modern healthcare workflows</p>
        </div>

        <div className={styles.featureGrid}>
          {[
            {
              icon: "chain",
              title: "Blockchain Verified",
              desc: "Every prescription is hashed and stored on Solana devnet. Patients can verify their prescription hasn't been tampered with — ever.",
            },
            {
              icon: "qr",
              title: "QR Code Access",
              desc: "Pharmacies generate a QR code for each prescription. Patients scan it to instantly view their full medicine schedule on any device.",
            },
            {
              icon: "alarm",
              title: "Medicine Alarms",
              desc: "Never miss a dose. Enable smart browser notifications that alert you exactly when it's time to take your medicine.",
            },
            {
              icon: "dashboard",
              title: "Pharmacy Dashboard",
              desc: "Pharmacies get a full dashboard to create, manage and update prescriptions. Scan patient QR codes to instantly access their profile.",
            },
            {
              icon: "profile",
              title: "Patient Profiles",
              desc: "Patients have a personal profile with their full medical history, prescription records, and a unique QR code for pharmacies to scan.",
            },
            {
              icon: "lock",
              title: "Secure Login",
              desc: "Sign in with Google or email. Two account types — pharmacy and consumer — with role-based access control throughout the app.",
            },
          ].map((f, i) => (
            <div className={styles.featureCard} key={i}>
              <div className={styles.featureIconWrap}>
                <FeatureIcon type={f.icon} />
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>How it works</span>
          <h2 className={styles.sectionTitle}>Simple. Secure. Fast.</h2>
        </div>

        <div className={styles.stepsGrid}>
          {[
            {
              n: "01",
              title: "Pharmacy Creates",
              desc: "Pharmacy logs in and creates a prescription with medicine, dosage and schedule.",
            },
            {
              n: "02",
              title: "Stored on Chain",
              desc: "A hash of the prescription is stored on Solana blockchain for permanent verification.",
            },
            {
              n: "03",
              title: "QR Generated",
              desc: "A unique QR code is generated and shared with the patient instantly.",
            },
            {
              n: "04",
              title: "Patient Verifies",
              desc: "Patient scans QR, views prescription, verifies on Solana and sets medicine alarms.",
            },
          ].map((s, i) => (
            <div className={styles.step} key={i}>
              <div className={styles.stepNumber}>{s.n}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <span className={styles.sectionLabel}>Get started today</span>
          <h2 className={styles.ctaTitle}>Ready to modernize prescriptions?</h2>
          <p className={styles.ctaSubtitle}>
            Join pharmacies and patients already using PharmaChain for secure,
            blockchain-verified prescriptions.
          </p>
          <div className={styles.heroActions}>
            <Link href="/login" className={styles.heroPrimaryBtn}>
              Get Started Free
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
        <p className={styles.footerText}>Built on Solana · Secure by design</p>
      </footer>
    </div>
  );
}

function FeatureIcon({ type }) {
  const icons = {
    chain: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    qr: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
      </svg>
    ),
    alarm: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" />
        <path d="M5 3 2 6M22 6l-3-3" />
      </svg>
    ),
    dashboard: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
    profile: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    lock: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  };
  return icons[type] || null;
}