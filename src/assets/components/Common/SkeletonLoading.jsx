// src/assets/components/Common/SkeletonLoading.jsx
import React from 'react';
import styles from './SkeletonLoading.module.css';

const SkeletonLoading = () => {
    return (
        <div className={styles.skeletonContainer}>
            <div className={styles.skeletonCard}>
                {/* Login Page Skeleton */}
                <div className={styles.skeletonLogoSection}></div>
                <div className={styles.skeletonForm}>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonInput}></div>
                    <div className={styles.skeletonInput}></div>
                    <div className={styles.skeletonButton}></div>
                </div>
            </div>
        </div>
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className={styles.dashboardSkeleton}>
            {/* Left Panel Skeleton */}
            <div className={styles.skeletonLeftPanel}></div>
            
            {/* Main Content Skeleton */}
            <div className={styles.skeletonMainContent}>
                <div className={styles.skeletonHeader}></div>
                <div className={styles.skeletonWelcome}></div>
                <div className={styles.skeletonStats}>
                    <div className={styles.skeletonStat}></div>
                    <div className={styles.skeletonStat}></div>
                    <div className={styles.skeletonStat}></div>
                    <div className={styles.skeletonStat}></div>
                </div>
                <div className={styles.skeletonActivity}></div>
            </div>
        </div>
    );
};

export default SkeletonLoading;