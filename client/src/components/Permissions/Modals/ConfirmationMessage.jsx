//src/components/Permissions/Modals/ConfirmationMessage.jsx
import React, { useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './Modals.module.css';

const ConfirmationMessage = ({ message, show, onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className={styles.confirmationMessage}>
      <FiCheck size={20} />
      <span>{message}</span>
    </div>
  );
};

export default ConfirmationMessage;