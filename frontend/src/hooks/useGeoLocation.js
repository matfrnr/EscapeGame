import { useState } from 'react';

export const useGeoLocation = () => {
    const [position, setPosition] = useState({ latitude: null, longitude: null });

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPosition({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => console.error(error),
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        } else {
            alert('La géolocalisation n\'est pas prise en charge par ce navigateur.');
        }
    };

    return { ...position, getLocation };
};
