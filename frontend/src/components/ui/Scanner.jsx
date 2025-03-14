import { useState, useEffect } from "react";
import QrReader from "react-qr-scanner";

const Scanner = ({ onSuccess }) => {
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const [canScan, setCanScan] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const checkCameraPermissions = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setError("Accès à la caméra refusé. Veuillez autoriser l'accès.");
    }
  };

  useEffect(() => {
    checkCameraPermissions();
  }, []);

  const handleScan = (data) => {
    if (data && canScan) {
      setQrData(data.text);
      onSuccess(data.text);
      setCanScan(false);
      setIsLoading(true);
      setTimeout(() => {
        setCanScan(true);
        setIsLoading(false);
        setQrData(null);
      }, 500);
    }
  };

  const handleError = (err) => {
    console.error("Erreur de scan :", err);
    setError("Erreur lors du scan du QR Code.");
  };

  const videoConstraints = {
    facingMode: { ideal: "environment" },
  };

  const requestCameraAccess = () => {
    setError(null);
    checkCameraPermissions();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Scanner un QR Code</h2>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          <p>{error}</p>
          <button onClick={requestCameraAccess} style={{ marginTop: "10px" }}>
            Réessayer
          </button>
        </div>
      )}

      {qrData && (
        <p>
          QR Code scanné : <strong>{qrData}</strong>
        </p>
      )}

      {!error && (
        <div
          className="aspect-square rounded-lg overflow-hidden"
        >
          {isLoading ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "#fff",
                fontSize: "20px",
              }}
            >
              Chargement...
            </div>
          ) : (
            canScan && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000", // Assure une transition fluide entre les bords et la caméra
                }}
              >
                <QrReader
                  className="w-full h-full object-cover"
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: "100%", height: "100%" }}
                  constraints={{ video: videoConstraints }}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Scanner;
