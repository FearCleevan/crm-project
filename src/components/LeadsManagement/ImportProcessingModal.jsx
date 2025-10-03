import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiClock, FiDatabase, FiFileText } from 'react-icons/fi';
import styles from './ImportProcessingModal.module.css';

const ImportProcessingModal = ({ isOpen, onClose, processingStats }) => {
  const [currentStage, setCurrentStage] = useState('preparing');
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  const stages = {
    preparing: { name: 'Preparing Import', icon: FiFileText },
    parsing: { name: 'Parsing CSV File', icon: FiDatabase },
    validating: { name: 'Validating Data', icon: FiAlertCircle },
    inserting: { name: 'Inserting Records', icon: FiDatabase },
    completed: { name: 'Import Completed', icon: FiCheckCircle }
  };

  useEffect(() => {
    if (isOpen && processingStats) {
      updateProgress(processingStats);
    }
  }, [isOpen, processingStats]);

  const updateProgress = (stats) => {
    if (stats.stage) {
      setCurrentStage(stats.stage);
    }
    
    // Calculate overall progress
    let overallProgress = 0;
    let stageProgressValue = 0;

    switch (stats.stage) {
      case 'parsing':
        overallProgress = 10;
        stageProgressValue = stats.parsedRows && stats.totalRows ? 
          (stats.parsedRows / stats.totalRows) * 30 : 0;
        break;
      case 'validating':
        overallProgress = 40;
        stageProgressValue = stats.validatedRows && stats.totalRows ? 
          (stats.validatedRows / stats.totalRows) * 30 : 0;
        break;
      case 'inserting':
        overallProgress = 70;
        stageProgressValue = stats.insertedRows && stats.totalValidRows ? 
          (stats.insertedRows / stats.totalValidRows) * 30 : 0;
        break;
      case 'completed':
        overallProgress = 100;
        stageProgressValue = 100;
        break;
      default:
        overallProgress = 0;
        stageProgressValue = 0;
    }

    setProgress(overallProgress);
    setStageProgress(stageProgressValue);
  };

  if (!isOpen) return null;

  const CurrentStageIcon = stages[currentStage]?.icon || FiClock;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Importing Prospects</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Progress Overview */}
          <div className={styles.progressSection}>
            <div className={styles.overallProgress}>
              <div className={styles.progressHeader}>
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Current Stage */}
          <div className={styles.currentStage}>
            <div className={styles.stageIcon}>
              <CurrentStageIcon size={24} />
            </div>
            <div className={styles.stageInfo}>
              <h3>{stages[currentStage]?.name || 'Processing...'}</h3>
              <div className={styles.stageProgress}>
                <div className={styles.stageProgressBar}>
                  <div 
                    className={styles.stageProgressFill} 
                    style={{ width: `${stageProgress}%` }}
                  ></div>
                </div>
                <span>{Math.round(stageProgress)}%</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {processingStats && (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Rows:</span>
                <span className={styles.statValue}>{processingStats.totalRows || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Valid Rows:</span>
                <span className={styles.statValue}>{processingStats.validRows || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Inserted:</span>
                <span className={styles.statValue}>{processingStats.insertedRows || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Errors:</span>
                <span className={`${styles.statValue} ${styles.error}`}>
                  {processingStats.errorCount || 0}
                </span>
              </div>
            </div>
          )}

          {/* Real-time Logs */}
          <div className={styles.logsSection}>
            <h4>Processing Logs</h4>
            <div className={styles.logsContainer}>
              {processingStats?.logs?.map((log, index) => (
                <div key={index} className={`${styles.logEntry} ${styles[log.type]}`}>
                  <span className={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={styles.logMessage}>{log.message}</span>
                </div>
              )) || (
                <div className={styles.noLogs}>No logs available</div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {processingStats?.errors && processingStats.errors.length > 0 && (
            <div className={styles.errorsSection}>
              <h4>
                <FiAlertCircle className={styles.errorIcon} />
                Errors ({processingStats.errors.length})
              </h4>
              <div className={styles.errorsContainer}>
                {processingStats.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className={styles.errorEntry}>
                    {error}
                  </div>
                ))}
                {processingStats.errors.length > 10 && (
                  <div className={styles.moreErrors}>
                    ... and {processingStats.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Animation */}
          <div className={styles.processingAnimation}>
            <div className={styles.spinner}></div>
            <span>Processing your data, please wait...</span>
          </div>
        </div>

        <div className={styles.modalFooter}>
          {currentStage === 'completed' ? (
            <button className={styles.completeButton} onClick={onClose}>
              <FiCheckCircle size={16} />
              Complete
            </button>
          ) : (
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel Import
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportProcessingModal;