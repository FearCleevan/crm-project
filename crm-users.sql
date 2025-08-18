-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 18, 2025 at 04:48 AM
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
  `role` enum('IT Admin','Data Analyst') NOT NULL DEFAULT 'Data Analyst',
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Store hashed password only',
  `confirm_password` varchar(255) DEFAULT NULL COMMENT 'Temporary field for registration, should not be stored long-term',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Store additional permissions as JSON' CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `crm-users`
--

INSERT INTO `crm-users` (`user_id`, `first_name`, `middle_name`, `last_name`, `profile`, `birthday`, `phone_no`, `address`, `role`, `email`, `username`, `password`, `confirm_password`, `permissions`, `created_at`, `updated_at`) VALUES
(1, 'John', 'A', 'Smith', NULL, '1985-06-15', '+1234567890', '123 Main St, Anytown, USA', 'IT Admin', 'john.smith@example.com', 'jsmith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '{\"admin\": true, \"reports\": true, \"users\": true}', '2025-08-17 23:53:51', '2025-08-17 23:53:51'),
(2, 'Sarah', 'M', 'Johnson', NULL, '1990-11-22', '+1987654321', '456 Oak Ave, Somewhere, USA', 'Data Analyst', 'sarah.johnson@example.com', 'sjohnson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '{\"admin\": false, \"reports\": true, \"users\": false}', '2025-08-17 23:53:51', '2025-08-17 23:53:51'),
(3, 'Michael', 'T', 'Williams', NULL, '1988-03-08', '+1122334455', '789 Pine Rd, Nowhere, USA', 'Data Analyst', 'michael.williams@example.com', 'mwilliams', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, '{\"admin\": false, \"reports\": true, \"users\": false}', '2025-08-17 23:53:51', '2025-08-17 23:53:51'),
(4, 'Peter', 'Paul', 'Lazan', NULL, '2025-08-13', '09515379127', 'test', 'IT Admin', 'fearcleevan123@gmail.com', 'fearcleevan', 'password', 'password', NULL, '2025-08-18 01:11:12', '2025-08-18 01:11:12');

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `crm-users`
--
ALTER TABLE `crm-users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
