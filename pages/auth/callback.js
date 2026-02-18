import { useEffect } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { token, isProfileComplete } = router.query;
    if (!token) return;

    // Save token first
    localStorage.setItem("token", token);

    // Fetch full user info using the token
    api.get("/auth/me").then((res) => {
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (isProfileComplete === "false") {
        router.push("/register");
      } else if (res.data.user.role === "PHARMACY") {
        router.push("/dashboard");
      } else {
        router.push("/consumer");
      }
    }).catch(() => {
      router.push("/login");
    });
  }, [router.query]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
      <p style={{ color: "#94a3b8", fontSize: 18 }}>Signing you in...</p>
    </div>
  );
}