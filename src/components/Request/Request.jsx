// src/components/Request/Request.jsx
import React from 'react';
import styles from './Request.module.css';

const Request = () => {
    return (
        <div className={styles.request}>
            <h3>Request Management</h3>
            <p>This is where you can manage permission requests. Backend integration will be implemented here.</p>
            {/* Request content will be added here */}
        </div>
    );
};

export default Request;