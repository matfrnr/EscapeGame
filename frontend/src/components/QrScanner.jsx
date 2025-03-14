import { useState } from 'react';
import { QrReader } from 'react-qr-reader'; // Remplacez avec cette bibliothèque

const Scanner = () => {
    const [result, setResult] = useState('No result'); // Pour afficher le résultat du scan
    const [error, setError] = useState(null);          // Pour afficher les erreurs

    const handleScan = (data) => {
        if (data) {
            setResult(data); // Enregistre le texte du QR code scanné
        }
    };

    const handleError = (err) => {
        setError(err.message || 'Erreur inconnue');
        console.error(err);
    };

    return (
      <div>
          <h2>QR Code Scanner</h2>

          {/* Scanner QR Code */}
          <QrReader
            delay={300} // Délai entre chaque scan
            onResult={(result, error) => {
                if (result) {
                    handleScan(result?.text);
                }
                if (error) {
                    handleError(error);
                }
            }}
            constraints={{ facingMode: "environment" }} // Utilise la caméra arrière
            style={{ width: '100%' }} // Style du scanner
          />

          {/* Affiche le résultat ou l'erreur */}
          <p>Résultat du scan : {result}</p>
          {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}
      </div>
    );
};

export default Scanner;