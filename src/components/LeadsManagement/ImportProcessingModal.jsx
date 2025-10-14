import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiClock, FiDatabase, FiFileText } from 'react-icons/fi';
import styles from './ImportProcessingModal.module.css';

const ImportProcessingModal = ({ isOpen, onClose, processingStats }) => {
  const [currentStage, setCurrentStage] = useState('preparing');
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [displayStats, setDisplayStats] = useState(null);

  const stages = {
    preparing: { name: 'Preparing Import', icon: FiFileText },
    parsing: { name: 'Parsing CSV File', icon: FiDatabase },
    validating: { name: 'Validating Data', icon: FiAlertCircle },
    inserting: { name: 'Inserting Records', icon: FiDatabase },
    completed: { name: 'Import Completed', icon: FiCheckCircle }
  };

  useEffect(() => {
    if (isOpen && processingStats) {
      console.log('📊 Processing Stats Received:', processingStats); // Debug log
      updateProgress(processingStats);
    }
  }, [isOpen, processingStats]);

  const updateProgress = (stats) => {
    if (!stats) return;

    // Set display stats
    setDisplayStats(stats);

    // Determine current stage
    if (stats.stage) {
      setCurrentStage(stats.stage);
    } else if (stats.status === 'completed') {
      setCurrentStage('completed');
    } else {
      setCurrentStage('inserting');
    }

    // Calculate progress based on actual data
    let overallProgress = 0;
    let stageProgressValue = 0;

    // Use the progress percentage from backend if available
    if (stats.progressPercentage !== undefined) {
      overallProgress = stats.progressPercentage;
      stageProgressValue = stats.progressPercentage;
    } 
    // Otherwise calculate based on chunks processed
    else if (stats.totalChunks && stats.processedChunks !== undefined) {
      overallProgress = Math.round((stats.processedChunks / stats.totalChunks) * 100);
      stageProgressValue = overallProgress;
    }
    // Fallback calculation
    else if (stats.totalRows && stats.insertedRows !== undefined) {
      overallProgress = Math.round((stats.insertedRows / stats.totalRows) * 100);
      stageProgressValue = overallProgress;
    }

    // Cap progress at 100%
    overallProgress = Math.min(100, overallProgress);
    stageProgressValue = Math.min(100, stageProgressValue);

    setProgress(overallProgress);
    setStageProgress(stageProgressValue);

    console.log('🔄 Progress Updated:', {
      overallProgress,
      stageProgressValue,
      stage: stats.stage || stats.status,
      processedChunks: stats.processedChunks,
      totalChunks: stats.totalChunks,
      insertedRows: stats.insertedRows,
      totalRows: stats.totalRows
    });
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

          {/* Statistics - Updated to handle actual data structure */}
          {displayStats && (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Rows:</span>
                <span className={styles.statValue}>
                  {displayStats.totalRows || displayStats.totalProspects || 0}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Valid Rows:</span>
                <span className={styles.statValue}>
                  {displayStats.validRows || (displayStats.totalProspects - (displayStats.failedImports || 0)) || 0}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Inserted:</span>
                <span className={styles.statValue}>
                  {displayStats.insertedRows || displayStats.successfulImports || 0}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Errors:</span>
                <span className={`${styles.statValue} ${styles.error}`}>
                  {displayStats.errorCount || displayStats.failedImports || 0}
                </span>
              </div>
              {/* Additional debug info */}
              {(displayStats.processedChunks !== undefined && displayStats.totalChunks !== undefined) && (
                <>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Chunks Processed:</span>
                    <span className={styles.statValue}>
                      {displayStats.processedChunks} / {displayStats.totalChunks}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Real-time Logs */}
          <div className={styles.logsSection}>
            <h4>Processing Logs</h4>
            <div className={styles.logsContainer}>
              {displayStats?.logs?.map((log, index) => (
                <div key={index} className={`${styles.logEntry} ${styles[log.type]}`}>
                  <span className={styles.logTime}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '--:--:--'}
                  </span>
                  <span className={styles.logMessage}>{log.message}</span>
                </div>
              )) || (
                <div className={styles.noLogs}>
                  {displayStats ? 'Waiting for logs...' : 'No logs available'}
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {displayStats?.errors && displayStats.errors.length > 0 && (
            <div className={styles.errorsSection}>
              <h4>
                <FiAlertCircle className={styles.errorIcon} />
                Errors ({displayStats.errors.length})
              </h4>
              <div className={styles.errorsContainer}>
                {displayStats.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className={styles.errorEntry}>
                    {typeof error === 'object' ? JSON.stringify(error) : error}
                  </div>
                ))}
                {displayStats.errors.length > 10 && (
                  <div className={styles.moreErrors}>
                    ... and {displayStats.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Animation - Only show when not completed */}
          {currentStage !== 'completed' && (
            <div className={styles.processingAnimation}>
              <div className={styles.spinner}></div>
              <span>Processing your data, please wait...</span>
            </div>
          )}

          {/* Success Message */}
          {currentStage === 'completed' && (
            <div className={styles.successSection}>
              <FiCheckCircle className={styles.successIcon} size={32} />
              <h3>Import Completed Successfully!</h3>
              <p>
                Successfully imported {displayStats?.insertedRows || 0} prospects.
                {displayStats?.errorCount > 0 && 
                  ` ${displayStats.errorCount} rows had errors and were skipped.`
                }
              </p>
            </div>
          )}
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