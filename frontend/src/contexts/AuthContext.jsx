import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState({
        id: null,
        username: '',
        profil_picture: '',
    }); // Regrouper toutes les informations utilisateur

    useEffect(() => {
        const storedAuthStatus = localStorage.getItem('isAuthenticated');
        const storedUserInfo = JSON.parse(localStorage.getItem('userInfo')); // Récupérer l'objet complet des infos utilisateur
        if (storedAuthStatus === 'true' && storedUserInfo) {
            setIsAuthenticated(true);
            setUserInfo(storedUserInfo); // Restaurer l'objet complet
        }
    }, []);

    const handleSetIsAuthenticated = (status, userData = null) => {
        setIsAuthenticated(status);
        if (status && userData) {
            setUserInfo(userData); // Mettre à jour toutes les infos utilisateur
            localStorage.setItem('userInfo', JSON.stringify(userData)); // Sauvegarder dans le localStorage
        } else {
            setUserInfo({ id: null, username: '', email: '' }); // Réinitialiser l'objet utilisateur
            localStorage.removeItem('userInfo'); // Supprimer les infos utilisateur du localStorage
        }
        localStorage.setItem('isAuthenticated', status); // Sauvegarder l'état d'authentification
    };
    const handleUpdateUserInfo = (updatedInfo) => {
        setUserInfo((prev) => {
            const newUserInfo = { ...prev, ...updatedInfo };
            localStorage.setItem("userInfo", JSON.stringify(newUserInfo)); // Sauvegarder dans le localStorage
            return newUserInfo;
        });
    };


            return (
        <AuthContext.Provider value={{ isAuthenticated, userInfo, setIsAuthenticated: handleSetIsAuthenticated, setUserInfo,
            updateUserInfo: handleUpdateUserInfo}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
