import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

const TransitionModal = ({ isOpen, message, type }) => {
  // Synchroniser directement avec la prop isOpen
  useEffect(() => {
    if (!isOpen) {
      // Reset du timer si la modal est fermée
      return;
    }

    const timer = setTimeout(() => {
      // Pas besoin de setState ici car on utilise directement isOpen
    }, 3000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const getModalStyle = (type) => {
    const baseStyle = {
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000
      },
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '2rem',
        borderRadius: '0.5rem',
        textAlign: 'center',
        minWidth: '300px'
      }
    };

    if (type === 'success') {
      baseStyle.content.backgroundColor = '#22c55e';
      baseStyle.content.color = 'white';
      baseStyle.content.border = 'none';
    } else if (type === 'error') {
      baseStyle.content.backgroundColor = '#ef4444';
      baseStyle.content.color = 'white';
      baseStyle.content.border = 'none';
    }

    return baseStyle;
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => { }}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      style={getModalStyle(type)}
      contentLabel={type === 'success' ? "Success Message" : "Error Message"}
    >
      <h2 className="text-xl font-bold">
        {message || (type === 'success' ? 'Succès ! Réunissinez-vous avec votre équipe pour continuer' : 'Erreur !')} 
      </h2>
    </Modal>
  );
};
export default TransitionModal;