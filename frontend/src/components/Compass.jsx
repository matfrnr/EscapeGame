import React from 'react';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';

const Compass = () => {
    const heading = useDeviceOrientation();

    return (
        <div>
            <h1>Boussole</h1>
            {heading !== null ? (
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            height: '150px',
                            width: '150px',
                            border: '2px solid black',
                            borderRadius: '50%',
                            position: 'relative',
                            margin: '0 auto',
                            transform: `rotate(${Math.round(heading)}deg)`,
                            transition: 'transform 0.5s ease'
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '0',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                height: '10px',
                                width: '2px',
                                backgroundColor: 'red'
                            }}
                        ></div>
                    </div>
                    <p>Direction: {Math.round(heading)}°</p>
                </div>
            ) : (
                <p>Votre appareil ne supporte pas la boussole ou l'accès a été refusé.</p>
            )}
        </div>
    );
};

export default Compass;
