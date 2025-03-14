import { useState, useEffect } from 'react';

export const useDeviceOrientation = () => {
    const [heading, setHeading] = useState(null);

    useEffect(() => {
        const handleOrientation = (event) => {
            if (event.alpha !== null) {
                setHeading(event.alpha);
            }
        };

        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then((permissionState) => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    return heading;
};
