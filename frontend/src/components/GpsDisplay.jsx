import React from 'react';
import { useGeoLocation } from '../hooks/useGeoLocation';

const GpsDisplay = () => {
    const position = useGeoLocation();

    return (
        <div>
            <h1>GPS Position</h1>
            <button onClick={position.getLocation}>Obtenir la position GPS</button>
            {position.latitude && (
                <div>
                    <p>Latitude: {position.latitude}</p>
                    <p>Longitude: {position.longitude}</p>
                </div>
            )}
        </div>
    );
};

export default GpsDisplay;
