import React, { useState, useEffect } from 'react';
import styles from './IPManagement.module.css';
import useAuth from '../../hooks/useAuth';

const IPManagement = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({ ip_control_mode: 'open' });
  const [whitelist, setWhitelist] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newIp, setNewIp] = useState({ ip_address: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [settingsRes, whitelistRes, blacklistRes] = await Promise.all([
        fetch('http://localhost:5001/api/ip-management/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5001/api/ip-management/whitelist', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5001/api/ip-management/blacklist', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!settingsRes.ok || !whitelistRes.ok || !blacklistRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const settingsData = await settingsRes.json();
      const whitelistData = await whitelistRes.json();
      const blacklistData = await blacklistRes.json();

      setSettings(settingsData.settings);
      setWhitelist(whitelistData.whitelist);
      setBlacklist(blacklistData.blacklist);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMode = async (mode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/ip-management/settings/mode', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mode })
      });

      if (!response.ok) {
        throw new Error('Failed to update mode');
      }

      setSettings({ ...settings, ip_control_mode: mode });
      setSuccess(`IP control mode updated to ${mode}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const addToWhitelist = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/ip-management/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newIp)
      });

      if (!response.ok) {
        throw new Error('Failed to add IP to whitelist');
      }

      setNewIp({ ip_address: '', description: '' });
      setSuccess('IP added to whitelist');
      setTimeout(() => setSuccess(''), 3000);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const addToBlacklist = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/ip-management/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newIp)
      });

      if (!response.ok) {
        throw new Error('Failed to add IP to blacklist');
      }

      setNewIp({ ip_address: '', description: '' });
      setSuccess('IP added to blacklist');
      setTimeout(() => setSuccess(''), 3000);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const updateListEntry = async (listType, id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/ip-management/${listType}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${listType} entry`);
      }

      setEditingId(null);
      setEditData({});
      setSuccess(`${listType} entry updated`);
      setTimeout(() => setSuccess(''), 3000);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div className={styles.loading}>Loading IP settings...</div>;
  if (user.role !== 'IT Admin') return <div className={styles.error}>Admin privileges required to access IP management</div>;

  return (
    <div className={styles.container}>
      <h2>IP Access Control</h2>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      <div className={styles.section}>
        <h3>Access Mode</h3>
        <div className={styles.modeSelector}>
          <button 
            className={settings.ip_control_mode === 'open' ? styles.activeMode : styles.modeButton}
            onClick={() => updateMode('open')}
          >
            Open Access
          </button>
          <button 
            className={settings.ip_control_mode === 'whitelist' ? styles.activeMode : styles.modeButton}
            onClick={() => updateMode('whitelist')}
          >
            Whitelist Only
          </button>
        </div>
        <p className={styles.modeDescription}>
          {settings.ip_control_mode === 'open' 
            ? 'All IP addresses can access the system, except those explicitly blacklisted.' 
            : 'Only whitelisted IP addresses can access the system.'}
        </p>
      </div>
      
      <div className={styles.section}>
        <h3>Whitelisted IPs</h3>
        <form onSubmit={addToWhitelist} className={styles.addForm}>
          <input
            type="text"
            placeholder="IP Address (e.g., 192.168.1.100)"
            value={newIp.ip_address}
            onChange={(e) => setNewIp({ ...newIp, ip_address: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newIp.description}
            onChange={(e) => setNewIp({ ...newIp, description: e.target.value })}
          />
          <button type="submit">Add to Whitelist</button>
        </form>
        
        <div className={styles.list}>
          {whitelist.map(item => (
            <div key={item.id} className={styles.listItem}>
              {editingId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editData.ip_address || item.ip_address}
                    onChange={(e) => setEditData({ ...editData, ip_address: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editData.description || item.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                  <button onClick={() => updateListEntry('whitelist', item.id, editData)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className={styles.ipAddress}>{item.ip_address}</span>
                  <span className={styles.description}>{item.description}</span>
                  <span className={styles.status}>{item.is_active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => {
                    setEditingId(item.id);
                    setEditData({ ip_address: item.ip_address, description: item.description });
                  }}>Edit</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.section}>
        <h3>Blacklisted IPs</h3>
        <form onSubmit={addToBlacklist} className={styles.addForm}>
          <input
            type="text"
            placeholder="IP Address (e.g., 192.168.1.200)"
            value={newIp.ip_address}
            onChange={(e) => setNewIp({ ...newIp, ip_address: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newIp.description}
            onChange={(e) => setNewIp({ ...newIp, description: e.target.value })}
          />
          <button type="submit">Add to Blacklist</button>
        </form>
        
        <div className={styles.list}>
          {blacklist.map(item => (
            <div key={item.id} className={styles.listItem}>
              {editingId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editData.ip_address || item.ip_address}
                    onChange={(e) => setEditData({ ...editData, ip_address: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editData.description || item.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                  <button onClick={() => updateListEntry('blacklist', item.id, editData)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className={styles.ipAddress}>{item.ip_address}</span>
                  <span className={styles.description}>{item.description}</span>
                  <span className={styles.status}>{item.is_active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => {
                    setEditingId(item.id);
                    setEditData({ ip_address: item.ip_address, description: item.description });
                  }}>Edit</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IPManagement;