import { useEffect, useRef } from "react";

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    let scanner;

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      scanner = new Html5Qrcode("qr-reader");
      instanceRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop();
          },
          () => {} // ignore errors during scanning
        );
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startScanner();

    return () => {
      if (instanceRef.current) {
        instanceRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ textAlign: "center", marginBottom: 16, color: "#1e293b", fontWeight: 700 }}>
          📷 Scan QR Code
        </h3>
        <div id="qr-reader" style={{ width: "100%" }} ref={scannerRef} />
        <button onClick={onClose} style={closeBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 200,
  padding: 20,
};

const modal = {
  background: "white",
  borderRadius: 20,
  padding: 24,
  width: "100%",
  maxWidth: 400,
};

const closeBtn = {
  width: "100%",
  marginTop: 16,
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};