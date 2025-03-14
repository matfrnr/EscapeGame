import { createContext, useState, useContext, useEffect } from 'react';

const LobbyContext = createContext();

export const LobbyProvider = ({ children }) => {
    const [isInLobby, setIsInLobby] = useState(() => {
        const savedState = localStorage.getItem('isInLobby');
        return savedState ? JSON.parse(savedState) : false;
    });

    const [groupCode, setGroupCode] = useState(() => {
        const savedCode = localStorage.getItem('groupCode');
        return savedCode ? JSON.parse(savedCode) : '';
    });

    const [groupMembers, setGroupMembers] = useState(() => {
        const savedMembers = localStorage.getItem('groupMembers');
        if (!savedMembers) return [];

        // Filtrer plus strictement les membres invalides
        return JSON.parse(savedMembers).filter(member =>
            member.id &&
            member.username &&
            member.socketId &&
            member.profil_picture !== undefined
        );
    });

    const [groupName, setGroupName] = useState(() => {
        const savedName = localStorage.getItem('groupName');
        return savedName ? JSON.parse(savedName) : '';
    });

    // Save `isInLobby` to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('isInLobby', JSON.stringify(isInLobby));
    }, [isInLobby]);

    // Save `groupCode` to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('groupCode', JSON.stringify(groupCode));
    }, [groupCode]);

    // Save `groupMembers` to localStorage whenever it changes
    useEffect(() => {
        const filteredMembers = groupMembers.filter(member =>
            member &&
            member.id &&
            member.username &&
            member.socketId &&
            member.profil_picture !== undefined
        );

        if (filteredMembers.length > 0) {
            localStorage.setItem('groupMembers', JSON.stringify(filteredMembers));
        } else {
            localStorage.removeItem('groupMembers');
        }
    }, [groupMembers]);

    const addGroupMember = (newMember) => {
        setGroupMembers(prevMembers => {
            // Vérifier que le nouveau membre a toutes les propriétés requises
            if (!newMember.id || !newMember.username || !newMember.socketId) {
                return prevMembers;
            }

            // Vérifier les doublons
            if (prevMembers.some(member =>
                member.id === newMember.id ||
                member.socketId === newMember.socketId
            )) {
                return prevMembers;
            }

            // Limiter à 3 membres
            if (prevMembers.length >= 3) {
                return prevMembers;
            }

            return [...prevMembers, newMember];
        });
    };

    return (
        <LobbyContext.Provider
            value={{
                isInLobby,
                setIsInLobby,
                groupCode,
                setGroupCode,
                groupMembers,
                setGroupMembers,
                addGroupMember,
                groupName,
                setGroupName,
            }}
        >
            {children}
        </LobbyContext.Provider>
    );
};

export const useLobby = () => useContext(LobbyContext);