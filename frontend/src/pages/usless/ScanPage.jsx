import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';

const ScanPage = () => {
    const [qrData, setQrData] = useState(null);

    const handleScan = (data) => {
        if (data) {
            setQrData(data);
        }
    };

    const handleError = (err) => {
        console.error('Erreur de scanner QR : ', err);
    };

    const previewStyle = {
        height: 240,
        width: 320,
        margin: '0 auto',
        border: '1px solid #000',
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
            <div className="mb-4">
                <QrScanner
                    delay={300}
                    style={previewStyle}
                    onError={handleError}
                    onScan={handleScan}
                />
            </div>
            {qrData ? (
                <p className="text-green-600 font-semibold">
                    QR Code scanné : {qrData}
                </p>
            ) : (
                <p className="text-gray-500">Scannez un QR code pour commencer.</p>
            )}
        </div>
    );
};

export default ScanPage;