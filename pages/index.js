import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Landing from "./landing";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (token && user) {
      setIsLoggedIn(true);
      if (user.role === "PHARMACY") router.push("/dashboard");
      else router.push("/consumer");
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) return null;

  return <Landing />;
}