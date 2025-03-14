import React from 'react';
import Compass from '../../components/Compass.jsx';
import GpsDisplay from '../../components/GpsDisplay.jsx';
import QrScanner from '../../components/QrScanner.jsx';

const HomePage = () => {
    return (
        <div>
            <Compass />
            <GpsDisplay />
            <QrScanner />
        </div>
    );
};

export default HomePage;
