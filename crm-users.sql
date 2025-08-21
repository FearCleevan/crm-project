-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 21, 2025 at 01:19 PM
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

INSERT INTO `crm-users` (`user_id`, `first_name`, `middle_name`, `last_name`, `profile`, `birthday`, `phone_no`, `address`, `role`, `email`, `username`, `password`, `confirm_password`, `permissions`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'John', 'A', 'Smith', NULL, '1985-06-15', '+1234567890', '123 Main St, Anytown, USA', 'IT Admin', 'john.smith@example.com', 'jsmith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '{\"admin\": true, \"reports\": true, \"users\": true}', '2025-08-17 23:53:51', '2025-08-17 23:53:51', NULL),
(2, 'Sarah', 'M', 'Johnson', NULL, '1990-11-22', '+1987654321', '456 Oak Ave, Somewhere, USA', 'Data Analyst', 'sarah.johnson@example.com', 'sjohnson', '$2b$12$Q4kqwcjt6mkgf2TFZ0u5velVLW6N7JWEzKR.prbU5jN8ZdRhYEVW6', NULL, '{\"admin\": false, \"reports\": true, \"users\": false}', '2025-08-17 23:53:51', '2025-08-21 02:22:11', NULL),
(3, 'Michael', 'T', 'Williams', NULL, '1988-03-08', '+1122334455', '789 Pine Rd, Nowhere, USA', 'Data Analyst', 'michael.williams@example.com', 'mwilliams', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '{\"admin\": false, \"reports\": true, \"users\": false}', '2025-08-17 23:53:51', '2025-08-17 23:53:51', NULL),
(6, 'Peter Paul', 'Abillar', 'Lazan', NULL, '2000-01-02', '09515785632', 'MATINA APLAYA, DAVAO CITY', 'IT Admin', 'fearcleevan123@gmail.com', 'fearcleevan', '$2b$12$smk1Q1JDiYp.T97u6Ch7IuYSQpf1Cb69svpLhxtaL7g88YGaKWxBa', NULL, NULL, '2025-08-20 02:11:10', '2025-08-20 02:11:10', NULL),
(7, 'Fear', 'Clee', 'Van', NULL, '2003-02-23', '09515785632', '93 Sample St., Barangay Example', 'IT Admin', 'jonathan.mauring17@gmail.com', 'FearCleevan123', '$2b$12$Ei1eMCz06JFD65jY.SPzWu8b.WESQWLOBTsP7HYdgmgw5i9ssIeH6', NULL, NULL, '2025-08-20 11:02:33', '2025-08-20 11:28:43', NULL),
(8, 'KC Mae', 'Abellar', 'Lazan', NULL, '2000-02-05', '09515785632', '57 Sample St., Barangay Example', 'Data Analyst', 'kc@gmail.com', 'kcmae', '$2b$12$YfQCMX8.XUi4TnDC5QaQw.B2Tb4wbC28kyOeuJ0kMx93DxeroVHSu', NULL, NULL, '2025-08-20 11:37:32', '2025-08-20 11:37:32', NULL);

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
(35, 11, 'Manage Permissions', 'permissions_manage', 'Can manage user permissions');

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
(11, 'Permissions', 'Manage user permissions and roles', 'account_settings', '2025-08-21 02:43:31');

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
(72, 2, 26, 1);

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
(1, 'PETER PAUL', 'LAZAN', 'fearcleevan123@gmail.com', 'fearcleevan', 'password_reset', 'pending', 'Password reset requested', '2025-08-21 01:58:13', NULL, NULL),
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
(24, 7, 1),
(18, 8, 2),
(20, 8, 3),
(19, 8, 4);

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
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_permission_id`),
  ADD UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

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
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `permission_modules`
--
ALTER TABLE `permission_modules`
  MODIFY `module_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `permission_roles`
--
ALTER TABLE `permission_roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `role_permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `user_requests`
--
ALTER TABLE `user_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `user_role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `permission_modules` (`module_id`) ON DELETE CASCADE;

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
