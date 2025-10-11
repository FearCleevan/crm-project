-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 11, 2025 at 06:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crm-project`
--

-- --------------------------------------------------------

--
-- Table structure for table `crm-users`
--

CREATE TABLE `crm-users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `profile` varchar(255) DEFAULT NULL COMMENT 'Path to profile picture',
  `birthday` date DEFAULT NULL,
  `phone_no` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('IT Admin','Data Analyst','Agent') NOT NULL DEFAULT 'Data Analyst',
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Store hashed password only',
  `confirm_password` varchar(255) DEFAULT NULL COMMENT 'Temporary field for registration, should not be stored long-term',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Store additional permissions as JSON' CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `crm-users`
--

--
-- Table structure for table `import_sessions`
--

CREATE TABLE `import_sessions` (
  `id` int(11) NOT NULL,
  `session_id` varchar(100) NOT NULL,
  `total_chunks` int(11) NOT NULL,
  `processed_chunks` int(11) DEFAULT 0,
  `total_prospects` int(11) NOT NULL,
  `successful_imports` int(11) DEFAULT 0,
  `failed_imports` int(11) DEFAULT 0,
  `chunk_errors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`chunk_errors`)),
  `status` enum('processing','completed','failed') DEFAULT 'processing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Table structure for table `ip_blacklist`
--

CREATE TABLE `ip_blacklist` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ip_blacklist`
--

INSERT INTO `ip_blacklist` (`id`, `ip_address`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(2, '10.0.0.99', 'Former employee', 1, '2025-08-25 02:03:15', '2025-08-25 02:03:15'),
(3, '143.44.184.3', 'Home IP', 1, '2025-08-25 03:01:38', '2025-08-25 03:01:38');

-- --------------------------------------------------------

--
-- Table structure for table `ip_whitelist`
--

CREATE TABLE `ip_whitelist` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ip_whitelist`
--

INSERT INTO `ip_whitelist` (`id`, `ip_address`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(6, '192.168.1.2', 'Office main IP', 1, '2025-08-25 02:03:15', '2025-10-10 01:18:11'),
(7, '127.0.0.1', 'Localhost', 1, '2025-08-25 02:03:15', '2025-08-25 02:03:15'),
(8, '10.0.0.50', 'Admin workstation', 1, '2025-08-25 02:03:15', '2025-08-25 02:03:15');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `permission_name` varchar(100) NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `module_id`, `permission_name`, `permission_key`, `description`) VALUES
(1, 1, 'View Dashboard', 'dashboard_view', 'Can view the dashboard'),
(2, 2, 'View Leads', 'leads_view', 'Can view leads'),
(3, 2, 'Create Leads', 'leads_create', 'Can create new leads'),
(4, 2, 'Edit Leads', 'leads_edit', 'Can edit existing leads'),
(5, 2, 'Delete Leads', 'leads_delete', 'Can delete leads'),
(6, 3, 'View Contacts', 'contacts_view', 'Can view contacts'),
(7, 3, 'Create Contacts', 'contacts_create', 'Can create new contacts'),
(8, 3, 'Edit Contacts', 'contacts_edit', 'Can edit existing contacts'),
(9, 3, 'Delete Contacts', 'contacts_delete', 'Can delete contacts'),
(10, 4, 'View Accounts', 'accounts_view', 'Can view accounts'),
(11, 4, 'Create Accounts', 'accounts_create', 'Can create new accounts'),
(12, 4, 'Edit Accounts', 'accounts_edit', 'Can edit existing accounts'),
(13, 4, 'Delete Accounts', 'accounts_delete', 'Can delete accounts'),
(14, 5, 'View Deals', 'deals_view', 'Can view deals'),
(15, 5, 'Create Deals', 'deals_create', 'Can create new deals'),
(16, 5, 'Edit Deals', 'deals_edit', 'Can edit existing deals'),
(17, 5, 'Delete Deals', 'deals_delete', 'Can delete deals'),
(18, 6, 'View Calendar', 'calendar_view', 'Can view calendar'),
(19, 6, 'Create Events', 'calendar_create', 'Can create calendar events'),
(20, 6, 'Edit Events', 'calendar_edit', 'Can edit calendar events'),
(21, 6, 'Delete Events', 'calendar_delete', 'Can delete calendar events'),
(22, 7, 'View Emails', 'email_view', 'Can view emails'),
(23, 7, 'Send Emails', 'email_send', 'Can send emails'),
(24, 8, 'View Calls', 'calls_view', 'Can view call logs'),
(25, 8, 'Log Calls', 'calls_log', 'Can log new calls'),
(26, 9, 'View Tasks', 'tasks_view', 'Can view tasks'),
(27, 9, 'Create Tasks', 'tasks_create', 'Can create new tasks'),
(28, 9, 'Edit Tasks', 'tasks_edit', 'Can edit existing tasks'),
(29, 9, 'Delete Tasks', 'tasks_delete', 'Can delete tasks'),
(30, 10, 'View Users', 'users_view', 'Can view users'),
(31, 10, 'Create Users', 'users_create', 'Can create new users'),
(32, 10, 'Edit Users', 'users_edit', 'Can edit existing users'),
(33, 10, 'Delete Users', 'users_delete', 'Can delete users'),
(34, 11, 'View Permissions', 'permissions_view', 'Can view permissions'),
(35, 11, 'Manage Permissions', 'permissions_manage', 'Can manage user permissions'),
(36, 11, 'IP Control', 'ip_control', 'Can manage IP access control settings'),
(37, 12, 'View IP Management', 'ip_management_view', 'Can view IP management interface'),
(38, 12, 'Manage IP Settings', 'ip_management_manage', 'Can change IP access settings');

-- --------------------------------------------------------

--
-- Table structure for table `permission_modules`
--

CREATE TABLE `permission_modules` (
  `module_id` int(11) NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('crm','activities','account_settings') NOT NULL DEFAULT 'crm',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission_modules`
--

INSERT INTO `permission_modules` (`module_id`, `module_name`, `description`, `category`, `created_at`) VALUES
(1, 'Dashboard', 'Main dashboard with analytics and overview', 'crm', '2025-08-21 02:43:31'),
(2, 'Leads Management', 'Manage and track potential leads', 'crm', '2025-08-21 02:43:31'),
(3, 'Contacts', 'Manage contact information', 'crm', '2025-08-21 02:43:31'),
(4, 'Accounts', 'Manage company accounts', 'crm', '2025-08-21 02:43:31'),
(5, 'Deals', 'Track and manage sales deals', 'crm', '2025-08-21 02:43:31'),
(6, 'Calendar', 'Schedule and view events', 'activities', '2025-08-21 02:43:31'),
(7, 'Email', 'Send and manage emails', 'activities', '2025-08-21 02:43:31'),
(8, 'Calls', 'Track and log phone calls', 'activities', '2025-08-21 02:43:31'),
(9, 'Tasks', 'Create and assign tasks', 'activities', '2025-08-21 02:43:31'),
(10, 'User Management', 'Manage system users', 'account_settings', '2025-08-21 02:43:31'),
(11, 'Permissions', 'Manage user permissions and roles', 'account_settings', '2025-08-21 02:43:31'),
(12, 'IP Management', 'Manage IP access controls', 'account_settings', '2025-08-25 02:06:06');

-- --------------------------------------------------------

--
-- Table structure for table `permission_roles`
--

CREATE TABLE `permission_roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system_role` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission_roles`
--

INSERT INTO `permission_roles` (`role_id`, `role_name`, `description`, `is_system_role`, `created_at`, `updated_at`) VALUES
(1, 'IT Admin', 'Full system access with all privileges', 1, '2025-08-21 02:43:31', '2025-08-21 02:43:31'),
(2, 'Data Analyst', 'Basic access with limited permissions', 1, '2025-08-21 02:43:31', '2025-08-21 02:43:31'),
(3, 'Sales Manager', 'Access to sales-related features and team management', 0, '2025-08-21 02:43:31', '2025-08-21 02:43:31'),
(4, 'Marketing Specialist', 'Access to marketing tools and analytics', 0, '2025-08-21 02:43:31', '2025-08-21 02:43:31');

-- --------------------------------------------------------

--
-- Table structure for table `prospects`
--

CREATE TABLE `prospects` (
  `id` bigint(20) NOT NULL,
  `Fullname` varchar(500) DEFAULT NULL,
  `Firstname` varchar(500) DEFAULT NULL,
  `Lastname` varchar(500) DEFAULT NULL,
  `Jobtitle` varchar(500) DEFAULT NULL,
  `Company` varchar(500) DEFAULT NULL,
  `Website` varchar(500) DEFAULT NULL,
  `Personallinkedin` varchar(500) DEFAULT NULL,
  `Companylinkedin` varchar(500) DEFAULT NULL,
  `Altphonenumber` varchar(500) DEFAULT '0',
  `Companyphonenumber` varchar(500) DEFAULT '0',
  `Email` varchar(500) DEFAULT NULL,
  `Emailcode` varchar(50) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `Street` varchar(500) DEFAULT NULL,
  `City` varchar(500) DEFAULT NULL,
  `State` varchar(500) DEFAULT NULL,
  `Postalcode` varchar(500) DEFAULT NULL,
  `Country` varchar(500) DEFAULT NULL,
  `Annualrevenue` decimal(15,2) DEFAULT 0.00,
  `Industry` varchar(500) DEFAULT NULL,
  `Employeesize` int(11) DEFAULT 0,
  `Siccode` int(11) DEFAULT 0,
  `Naicscode` int(11) DEFAULT 0,
  `Dispositioncode` varchar(50) DEFAULT NULL,
  `Providercode` varchar(50) DEFAULT NULL,
  `Comments` text DEFAULT NULL,
  `isactive` tinyint(1) DEFAULT 1,
  `Status` varchar(50) DEFAULT 'New',
  `CreatedBy` varchar(50) DEFAULT 'SYSTEM',
  `CreatedOn` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdatedBy` varchar(50) DEFAULT NULL,
  `UpdatedOn` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `Department` varchar(500) DEFAULT NULL,
  `Seniority` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prospects_country`
--

CREATE TABLE `prospects_country` (
  `CountryCode` varchar(5) NOT NULL,
  `CountryName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prospects_country`
--

INSERT INTO `prospects_country` (`CountryCode`, `CountryName`) VALUES
('AU', 'Australia'),
('BR', 'Brazil'),
('CA', 'Canada'),
('CH', 'Switzerland'),
('CN', 'China'),
('DE', 'Germany'),
('ES', 'Spain'),
('FR', 'France'),
('IN', 'India'),
('IT', 'Italy'),
('JP', 'Japan'),
('KR', 'South Korea'),
('MX', 'Mexico'),
('NL', 'Netherlands'),
('NO', 'Norway'),
('RU', 'Russia'),
('SE', 'Sweden'),
('SG', 'Singapore'),
('UK', 'United Kingdom'),
('US', 'United States');

-- --------------------------------------------------------

--
-- Table structure for table `prospects_disposition`
--

CREATE TABLE `prospects_disposition` (
  `DispositionCode` varchar(50) NOT NULL,
  `DispositionName` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prospects_disposition`
--

INSERT INTO `prospects_disposition` (`DispositionCode`, `DispositionName`) VALUES
('A', 'Answering Machine'),
('APPT', 'Appointment'),
('B', 'Busy'),
('CA', 'Cadence'),
('CALLBK', 'Call Back'),
('CNA', 'Customer not available'),
('CR', 'Changed Role'),
('DAIR', 'Dead Air'),
('DC', 'Disconnected Number'),
('DEC', 'Declined Sale'),
('DISC001', 'Interested'),
('DISC002', 'Requested Information'),
('DISC003', 'Needs Pricing'),
('DISC004', 'Follow-up Required'),
('DISC005', 'Not Interested'),
('DNC', 'DO NOT CALL'),
('HU', 'Hang UP'),
('LB', 'Language Barrier'),
('N', 'No Answer'),
('NEW', 'New Prospect'),
('NI', 'Not Interested'),
('NP', 'No Pitch No Price'),
('NQ', 'Not Qualified'),
('RFI', 'Requested for INFO'),
('SALE', 'Sale Made'),
('VM', 'Voicemail'),
('WN', 'Wrong Number'),
('XFER', 'Call Transferred');

-- --------------------------------------------------------

--
-- Table structure for table `prospects_email_status`
--

CREATE TABLE `prospects_email_status` (
  `EmailCode` varchar(50) NOT NULL,
  `EmailName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prospects_email_status`
--

INSERT INTO `prospects_email_status` (`EmailCode`, `EmailName`) VALUES
('EMA000', 'Good'),
('EMA001', 'Bad'),
('EMA002', 'Invalid'),
('EMA003', 'Bounced'),
('EMA004', 'Unverified');

-- --------------------------------------------------------

--
-- Table structure for table `prospects_industry`
--

CREATE TABLE `prospects_industry` (
  `IndustryCode` varchar(50) NOT NULL,
  `IndustryName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prospects_industry`
--

INSERT INTO `prospects_industry` (`IndustryCode`, `IndustryName`) VALUES
('AGRI', 'Agriculture'),
('AUTO', 'Automotive'),
('BIOTECH', 'Biotechnology'),
('CONS', 'Construction'),
('CONSULT', 'Consulting'),
('EDU', 'Education'),
('ENERGY', 'Energy'),
('FIN', 'Finance'),
('GOV', 'Government'),
('HLTH', 'Healthcare'),
('HOSP', 'Hospitality'),
('INS', 'Insurance'),
('LEGAL', 'Legal Services'),
('MEDIA', 'Media & Entertainment'),
('MFG', 'Manufacturing'),
('NONPROF', 'Non-Profit'),
('PHARMA', 'Pharmaceuticals'),
('RE', 'Real Estate'),
('RET', 'Retail'),
('TECH', 'Technology'),
('TELECOM', 'Telecommunications'),
('TRANS', 'Transportation');

-- --------------------------------------------------------

--
-- Table structure for table `prospects_provider`
--

CREATE TABLE `prospects_provider` (
  `ProviderCode` varchar(50) NOT NULL,
  `ProviderName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prospects_provider`
--

INSERT INTO `prospects_provider` (`ProviderCode`, `ProviderName`) VALUES
('DA', 'Apollo.io'),
('HS', 'HubSpot'),
('LH', 'LinkedIn Helper'),
('PROV01', 'LinkedIn'),
('PROV02', 'Website Form'),
('PROV03', 'Referral'),
('PROV04', 'Trade Show'),
('PROV05', 'Cold Call'),
('SG', 'Seamless.ai'),
('VICI', 'Vici.com'),
('ZO', 'ZoomInfo');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_permission_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `has_permission` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_permission_id`, `role_id`, `permission_id`, `has_permission`) VALUES
(1, 1, 1, 1),
(2, 1, 3, 1),
(3, 1, 5, 1),
(4, 1, 4, 1),
(5, 1, 2, 1),
(6, 1, 7, 1),
(7, 1, 9, 1),
(8, 1, 8, 1),
(9, 1, 6, 1),
(10, 1, 11, 1),
(11, 1, 13, 1),
(12, 1, 12, 1),
(13, 1, 10, 1),
(14, 1, 15, 1),
(15, 1, 17, 1),
(16, 1, 16, 1),
(17, 1, 14, 1),
(18, 1, 19, 1),
(19, 1, 21, 1),
(20, 1, 20, 1),
(21, 1, 18, 1),
(22, 1, 23, 1),
(23, 1, 22, 1),
(24, 1, 25, 1),
(25, 1, 24, 1),
(26, 1, 27, 1),
(27, 1, 29, 1),
(28, 1, 28, 1),
(29, 1, 26, 1),
(30, 1, 31, 1),
(31, 1, 33, 1),
(32, 1, 32, 1),
(33, 1, 30, 1),
(34, 1, 35, 1),
(35, 1, 34, 1),
(64, 2, 1, 1),
(65, 2, 2, 1),
(66, 2, 6, 1),
(67, 2, 10, 1),
(68, 2, 14, 1),
(69, 2, 18, 1),
(70, 2, 22, 1),
(71, 2, 24, 1),
(72, 2, 26, 1),
(73, 1, 36, 1),
(76, 1, 37, 1),
(77, 1, 38, 1);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_name` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_name`, `setting_value`, `created_at`, `updated_at`) VALUES
(7, 'ip_control_mode', 'open', '2025-08-25 01:16:14', '2025-10-10 01:18:42');

-- --------------------------------------------------------

--
-- Table structure for table `user_requests`
--

CREATE TABLE `user_requests` (
  `request_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `request_type` enum('password_reset','account_creation') NOT NULL,
  `status` enum('pending','in_progress','completed','rejected') DEFAULT 'pending',
  `message` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `admin_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_requests`
--

INSERT INTO `user_requests` (`request_id`, `first_name`, `last_name`, `email`, `username`, `request_type`, `status`, `message`, `submitted_at`, `completed_at`, `admin_notes`) VALUES
(1, 'PETER PAUL', 'LAZAN', 'fearcleevan123@gmail.com', 'fearcleevan', 'password_reset', 'completed', 'Password reset requested', '2025-08-21 01:58:13', '2025-08-23 16:09:44', 'Password reset completed'),
(2, 'Sarah', 'Johnson', 'sarah.johnson@example.com', 'sjohnson', 'password_reset', 'completed', 'Password reset requested', '2025-08-21 02:01:20', '2025-08-21 02:22:11', 'Password reset completed');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_role_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_role_id`, `user_id`, `role_id`) VALUES
(1, 1, 1),
(13, 2, 2),
(14, 2, 3),
(15, 3, 2),
(17, 3, 3),
(16, 3, 4),
(29, 7, 1),
(31, 7, 3),
(30, 7, 4),
(35, 8, 2),
(32, 9, 1),
(34, 9, 3),
(33, 9, 4);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `crm-users`
--
ALTER TABLE `crm-users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email_unique` (`email`),
  ADD UNIQUE KEY `username_unique` (`username`);

--
-- Indexes for table `import_sessions`
--
ALTER TABLE `import_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`);

--
-- Indexes for table `ip_blacklist`
--
ALTER TABLE `ip_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ip_address` (`ip_address`);

--
-- Indexes for table `ip_whitelist`
--
ALTER TABLE `ip_whitelist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ip_address` (`ip_address`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `unique_module_permission` (`module_id`,`permission_key`);

--
-- Indexes for table `permission_modules`
--
ALTER TABLE `permission_modules`
  ADD PRIMARY KEY (`module_id`),
  ADD UNIQUE KEY `module_name` (`module_name`);

--
-- Indexes for table `permission_roles`
--
ALTER TABLE `permission_roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `prospects`
--
ALTER TABLE `prospects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_unique_active_email` (`Email`,`isactive`),
  ADD KEY `idx_prospects_email` (`Email`),
  ADD KEY `idx_prospects_company` (`Company`),
  ADD KEY `idx_prospects_status` (`Status`),
  ADD KEY `idx_prospects_industry` (`Industry`),
  ADD KEY `idx_prospects_country` (`Country`),
  ADD KEY `idx_prospects_createdon` (`CreatedOn`),
  ADD KEY `idx_prospects_isactive` (`isactive`),
  ADD KEY `fk_prospects_disposition` (`Dispositioncode`),
  ADD KEY `fk_prospects_email_status` (`Emailcode`),
  ADD KEY `fk_prospects_provider` (`Providercode`),
  ADD KEY `idx_prospects_fullname` (`Fullname`),
  ADD KEY `idx_prospects_jobtitle` (`Jobtitle`),
  ADD KEY `idx_prospects_city` (`City`),
  ADD KEY `idx_prospects_state` (`State`),
  ADD KEY `idx_prospects_employeesize` (`Employeesize`),
  ADD KEY `idx_prospects_createdby` (`CreatedBy`);

--
-- Indexes for table `prospects_country`
--
ALTER TABLE `prospects_country`
  ADD PRIMARY KEY (`CountryCode`);

--
-- Indexes for table `prospects_disposition`
--
ALTER TABLE `prospects_disposition`
  ADD PRIMARY KEY (`DispositionCode`);

--
-- Indexes for table `prospects_email_status`
--
ALTER TABLE `prospects_email_status`
  ADD PRIMARY KEY (`EmailCode`);

--
-- Indexes for table `prospects_industry`
--
ALTER TABLE `prospects_industry`
  ADD PRIMARY KEY (`IndustryCode`);

--
-- Indexes for table `prospects_provider`
--
ALTER TABLE `prospects_provider`
  ADD PRIMARY KEY (`ProviderCode`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_permission_id`),
  ADD UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_name` (`setting_name`);

--
-- Indexes for table `user_requests`
--
ALTER TABLE `user_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_user_requests_status` (`status`),
  ADD KEY `idx_user_requests_type` (`request_type`),
  ADD KEY `idx_user_requests_email` (`email`),
  ADD KEY `idx_user_requests_username` (`username`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_role_id`),
  ADD UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `crm-users`
--
ALTER TABLE `crm-users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `import_sessions`
--
ALTER TABLE `import_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ip_blacklist`
--
ALTER TABLE `ip_blacklist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ip_whitelist`
--
ALTER TABLE `ip_whitelist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `permission_modules`
--
ALTER TABLE `permission_modules`
  MODIFY `module_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `permission_roles`
--
ALTER TABLE `permission_roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `prospects`
--
ALTER TABLE `prospects`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `role_permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_requests`
--
ALTER TABLE `user_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `user_role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `permission_modules` (`module_id`) ON DELETE CASCADE;

--
-- Constraints for table `prospects`
--
ALTER TABLE `prospects`
  ADD CONSTRAINT `fk_prospects_disposition` FOREIGN KEY (`Dispositioncode`) REFERENCES `prospects_disposition` (`DispositionCode`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prospects_email_status` FOREIGN KEY (`Emailcode`) REFERENCES `prospects_email_status` (`EmailCode`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prospects_provider` FOREIGN KEY (`Providercode`) REFERENCES `prospects_provider` (`ProviderCode`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `permission_roles` (`role_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `crm-users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `permission_roles` (`role_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
