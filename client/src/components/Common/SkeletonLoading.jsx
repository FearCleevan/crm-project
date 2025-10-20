// src/assets/components/Common/SkeletonLoading.jsx
import React from 'react';
import styles from './SkeletonLoading.module.css';

const SkeletonLoading = () => {
    return (
        <div className={styles.skeletonContainer}>
            <div className={styles.skeletonWrapper}>
                {/* Left: Login Form Skeleton */}
                <div className={styles.skeletonFormContainer}>
                    <div className={styles.skeletonCard}>
                        <div className={styles.skeletonLogoSection}>
                            <div className={styles.skeletonLogoText}></div>
                            <div className={styles.skeletonTagline}></div>
                        </div>

                        <div className={styles.skeletonForm}>
                            <div className={styles.skeletonFormTitle}></div>
                            
                            <div className={styles.skeletonInputGroup}>
                                <div className={styles.skeletonInputLabel}></div>
                                <div className={styles.skeletonInputField}></div>
                            </div>
                            
                            <div className={styles.skeletonInputGroup}>
                                <div className={styles.skeletonInputLabel}></div>
                                <div className={styles.skeletonInputField}></div>
                            </div>
                            
                            <div className={styles.skeletonRememberMe}>
                                <div className={styles.skeletonCheckbox}></div>
                                <div className={styles.skeletonRememberLabel}></div>
                            </div>
                            
                            <div className={styles.skeletonButton}></div>
                            
                            <div className={styles.skeletonForgotLink}></div>
                        </div>

                        <div className={styles.skeletonFooter}>
                            <div className={styles.skeletonFooterText}></div>
                        </div>
                    </div>
                </div>

                {/* Right: Carousel Skeleton */}
                <div className={styles.skeletonCarousel}>
                    <div className={styles.skeletonCarouselItem}>
                        <div className={styles.skeletonCarouselImage}></div>
                        <div className={styles.skeletonCarouselContent}>
                            <div className={styles.skeletonCarouselTitle}></div>
                            <div className={styles.skeletonCarouselDescription}></div>
                        </div>
                    </div>
                    <div className={styles.skeletonCarouselDots}>
                        <div className={styles.skeletonDot}></div>
                        <div className={styles.skeletonDot}></div>
                        <div className={styles.skeletonDot}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className={styles.dashboardSkeleton}>
            {/* Left Panel Skeleton */}
            <div className={styles.skeletonLeftPanel}>
                <div className={styles.skeletonSidebarHeader}></div>
                <div className={styles.skeletonNavSection}>
                    <div className={styles.skeletonNavItem}></div>
                    <div className={styles.skeletonNavItem}></div>
                    <div className={styles.skeletonNavItem}></div>
                    <div className={styles.skeletonNavItem}></div>
                </div>
                <div className={styles.skeletonNavSection}>
                    <div className={styles.skeletonNavItem}></div>
                    <div className={styles.skeletonNavItem}></div>
                    <div className={styles.skeletonNavItem}></div>
                </div>
            </div>
            
            {/* Main Content Skeleton */}
            <div className={styles.skeletonMainContent}>
                {/* Header Skeleton */}
                <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonLogo}></div>
                    <div className={styles.skeletonHeaderRight}>
                        <div className={styles.skeletonUserInfo}>
                            <div className={styles.skeletonUserName}></div>
                            <div className={styles.skeletonUserRole}></div>
                        </div>
                        <div className={styles.skeletonToggleButton}></div>
                        <div className={styles.skeletonLogoutButton}></div>
                    </div>
                </div>
                
                {/* Stats Grid Skeleton */}
                <div className={styles.skeletonStatsGrid}>
                    <div className={styles.skeletonStatCard}>
                        <div className={styles.skeletonStatHeader}></div>
                        <div className={styles.skeletonStatValue}></div>
                        <div className={styles.skeletonStatChange}></div>
                        <div className={styles.skeletonMoreInfoBtn}></div>
                    </div>
                    <div className={styles.skeletonStatCard}>
                        <div className={styles.skeletonStatHeader}></div>
                        <div className={styles.skeletonStatValue}></div>
                        <div className={styles.skeletonStatChange}></div>
                        <div className={styles.skeletonMoreInfoBtn}></div>
                    </div>
                    <div className={styles.skeletonStatCard}>
                        <div className={styles.skeletonStatHeader}></div>
                        <div className={styles.skeletonStatValue}></div>
                        <div className={styles.skeletonStatChange}></div>
                        <div className={styles.skeletonMoreInfoBtn}></div>
                    </div>
                    <div className={styles.skeletonStatCard}>
                        <div className={styles.skeletonStatHeader}></div>
                        <div className={styles.skeletonStatValue}></div>
                        <div className={styles.skeletonStatChange}></div>
                        <div className={styles.skeletonMoreInfoBtn}></div>
                    </div>
                    <div className={styles.skeletonStatCard}>
                        <div className={styles.skeletonStatHeader}></div>
                        <div className={styles.skeletonStatValue}></div>
                        <div className={styles.skeletonStatChange}></div>
                        <div className={styles.skeletonMoreInfoBtn}></div>
                    </div>
                    <div className={styles.skeletonStatCard}>
                        <div className={styles.skeletonStatHeader}></div>
                        <div className={styles.skeletonStatValue}></div>
                        <div className={styles.skeletonStatChange}></div>
                        <div className={styles.skeletonMoreInfoBtn}></div>
                    </div>
                </div>
                
                {/* Recent Activity Skeleton */}
                <div className={styles.skeletonRecentActivity}>
                    <div className={styles.skeletonActivityTitle}></div>
                    <div className={styles.skeletonActivityList}>
                        <div className={styles.skeletonActivityItem}>
                            <div className={styles.skeletonActivityIcon}></div>
                            <div className={styles.skeletonActivityDetails}>
                                <div className={styles.skeletonActivityDesc}></div>
                                <div className={styles.skeletonActivityMeta}></div>
                            </div>
                        </div>
                        <div className={styles.skeletonActivityItem}>
                            <div className={styles.skeletonActivityIcon}></div>
                            <div className={styles.skeletonActivityDetails}>
                                <div className={styles.skeletonActivityDesc}></div>
                                <div className={styles.skeletonActivityMeta}></div>
                            </div>
                        </div>
                        <div className={styles.skeletonActivityItem}>
                            <div className={styles.skeletonActivityIcon}></div>
                            <div className={styles.skeletonActivityDetails}>
                                <div className={styles.skeletonActivityDesc}></div>
                                <div className={styles.skeletonActivityMeta}></div>
                            </div>
                        </div>
                        <div className={styles.skeletonActivityItem}>
                            <div className={styles.skeletonActivityIcon}></div>
                            <div className={styles.skeletonActivityDetails}>
                                <div className={styles.skeletonActivityDesc}></div>
                                <div className={styles.skeletonActivityMeta}></div>
                            </div>
                        </div>
                        <div className={styles.skeletonActivityItem}>
                            <div className={styles.skeletonActivityIcon}></div>
                            <div className={styles.skeletonActivityDetails}>
                                <div className={styles.skeletonActivityDesc}></div>
                                <div className={styles.skeletonActivityMeta}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right Panel Skeleton */}
            <div className={styles.skeletonRightPanel}></div>
        </div>
    );
};

export default SkeletonLoading;