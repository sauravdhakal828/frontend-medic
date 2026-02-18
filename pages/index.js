//frontend/pages/index.js

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) {
      router.push("/login");
    } else if (user?.role === "PHARMACY") {
      router.push("/dashboard");
    } else if (user?.role === "CONSUMER") {
      router.push("/consumer");
    } else {
      router.push("/login");
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#94a3b8" }}>Redirecting...</p>
    </div>
  );
}