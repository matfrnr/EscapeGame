import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const KeyContext = createContext();

export const KeyProvider = ({ children }) => {
    const [fullKey, setFullKey] = useState('ABCDEFGHIJKL'); // Clé complète utilisée plus tard
    const [revealedKey, setRevealedKey] = useState('');

    // useEffect(() => {
    //     const fetchKey = async () => {
    //         try {
    //             const response = await axios.get('/api/key');
    //             setFullKey(response.data.key);
    //         } catch (error) {
    //             console.error('Error fetching key:', error);
    //         }
    //     };
    //
    //     fetchKey();
    // }, []);
    //
    // const revealKey = (step) => {
    //     const newRevealedKey = fullKey.slice(0, step);
    //     setRevealedKey(newRevealedKey);
    // };


    return (
        <KeyContext.Provider value={{ revealedKey }}>
            {children}
        </KeyContext.Provider>
    );
};

export const useKey = () => useContext(KeyContext);