import { createContext, useState, useContext } from 'react';

const CountdownContext = createContext();

export const CountdownProvider = ({ children }) => {
    // État indiquant si le compte à rebours est terminé
    const [isCountdownFinished, setIsCountdownFinished] = useState(false);

    return (
        <CountdownContext.Provider value={{ isCountdownFinished, setIsCountdownFinished }}>
            {children}
        </CountdownContext.Provider>
    );
};

export const useCountdown = () => {
    // Récupère le contexte
    const context = useContext(CountdownContext);

    // Si le contexte est utilisé en dehors du fournisseur, une erreur est levée
    if (!context) {
        throw new Error("useCountdown must be used within a CountdownProvider");
    }

    return context;
};

export default CountdownContext;