-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 16, 2026 at 07:27 PM
-- Server version: 12.2.2-MariaDB
-- PHP Version: 8.5.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tech_event`
--

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `max_participants` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `event_type` varchar(20) DEFAULT 'solo',
  `team_min` int(11) DEFAULT NULL,
  `team_max` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `event_date`, `max_participants`, `created_by`, `created_at`, `event_type`, `team_min`, `team_max`) VALUES
(1, 'AI & Machine Learning Workshop', 'Deep dive into neural networks, transformers, and hands-on model training with TensorFlow and PyTorch. Build your own image classifier by the end of the day!', '2026-04-15', 60, 1, '2026-03-16 19:22:17', 'solo', NULL, NULL),
(2, 'Web Development Bootcamp', 'Full-stack web development crash course covering React, Node.js, and MongoDB. Deploy a live project on the cloud.', '2026-04-18', 80, 1, '2026-03-16 19:22:17', 'solo', NULL, NULL),
(3, 'Robotics Competition', 'Design and program autonomous robots to navigate obstacle courses. Teams compete in timed trials with increasing difficulty.', '2026-04-20', 100, 1, '2026-03-16 19:22:17', 'team', 3, 5),
(4, 'Cybersecurity CTF Challenge', 'Capture The Flag competition — solve cryptography puzzles, exploit vulnerabilities, and defend systems. Beginner-friendly with tiered challenges.', '2026-04-22', 50, 1, '2026-03-16 19:22:17', 'team', 2, 4),
(5, 'Cloud Computing Seminar', 'Industry experts from AWS and Google Cloud share insights on serverless architecture, Kubernetes, and cloud-native development patterns.', '2026-04-25', 120, 1, '2026-03-16 19:22:17', 'solo', NULL, NULL),
(6, 'Hackathon: Build for Good', '24-hour hackathon focused on social impact. Build apps that solve real community problems. Cash prizes for top 3 teams!', '2026-05-01', 150, 1, '2026-03-16 19:22:17', 'team', 3, 6),
(7, 'Data Science with Python', 'Learn pandas, matplotlib, scikit-learn, and work through real-world datasets. Perfect for beginners wanting to break into data science.', '2026-05-05', 70, 1, '2026-03-16 19:22:17', 'solo', NULL, NULL),
(8, 'UI/UX Design Sprint', 'Hands-on workshop on Figma, user research methods, wireframing, and prototyping. Design a complete mobile app interface in one session.', '2026-05-08', 40, 1, '2026-03-16 19:22:17', 'solo', NULL, NULL),
(9, 'Competitive Programming Contest', 'Test your problem-solving skills with algorithmic challenges across easy, medium, and hard tiers. Leaderboard with live rankings.', '2026-05-10', 200, 1, '2026-03-16 19:22:17', 'solo', NULL, NULL),
(10, 'IoT & Embedded Systems Lab', 'Get hands-on with Arduino, Raspberry Pi, and sensor integration. Build a working smart home prototype by the end of the session.', '2026-05-12', 45, 1, '2026-03-16 19:22:17', 'team', 2, 3),
(11, 'Blockchain & Web3 Workshop', 'Understand blockchain fundamentals, write Solidity smart contracts, and deploy your first dApp on a test network.', '2026-05-15', 55, 1, '2026-03-16 19:22:17', 'solo', NULL, NULL),
(12, 'Game Development Jam', '48-hour game jam using Unity or Godot. Theme revealed at kickoff. Solo or team entries welcome. Best games showcased at closing ceremony.', '2026-05-18', 80, 1, '2026-03-16 19:22:17', 'team', 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `registered_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `event_registrations`
--

INSERT INTO `event_registrations` (`id`, `user_id`, `event_id`, `registered_at`) VALUES
(6, 2, 1, '2026-03-16 19:22:17'),
(7, 3, 1, '2026-03-16 19:22:17'),
(8, 4, 1, '2026-03-16 19:22:17'),
(9, 5, 1, '2026-03-16 19:22:17'),
(10, 7, 1, '2026-03-16 19:22:17'),
(11, 8, 1, '2026-03-16 19:22:17'),
(12, 11, 1, '2026-03-16 19:22:17'),
(13, 12, 1, '2026-03-16 19:22:17'),
(14, 14, 1, '2026-03-16 19:22:17'),
(15, 2, 2, '2026-03-16 19:22:17'),
(16, 3, 2, '2026-03-16 19:22:17'),
(17, 5, 2, '2026-03-16 19:22:17'),
(18, 7, 2, '2026-03-16 19:22:17'),
(19, 8, 2, '2026-03-16 19:22:17'),
(20, 11, 2, '2026-03-16 19:22:17'),
(21, 12, 2, '2026-03-16 19:22:17'),
(22, 14, 2, '2026-03-16 19:22:17'),
(23, 2, 3, '2026-03-16 19:22:17'),
(24, 3, 3, '2026-03-16 19:22:17'),
(25, 4, 3, '2026-03-16 19:22:17'),
(26, 5, 3, '2026-03-16 19:22:17'),
(27, 7, 3, '2026-03-16 19:22:17'),
(28, 3, 4, '2026-03-16 19:22:17'),
(29, 4, 4, '2026-03-16 19:22:17'),
(30, 8, 4, '2026-03-16 19:22:17'),
(31, 12, 4, '2026-03-16 19:22:17'),
(32, 2, 5, '2026-03-16 19:22:17'),
(33, 3, 5, '2026-03-16 19:22:17'),
(34, 4, 5, '2026-03-16 19:22:17'),
(35, 5, 5, '2026-03-16 19:22:17'),
(36, 7, 5, '2026-03-16 19:22:17'),
(37, 11, 5, '2026-03-16 19:22:17'),
(38, 14, 5, '2026-03-16 19:22:17'),
(39, 2, 6, '2026-03-16 19:22:17'),
(40, 3, 6, '2026-03-16 19:22:17'),
(41, 5, 6, '2026-03-16 19:22:17'),
(42, 8, 6, '2026-03-16 19:22:17'),
(43, 12, 6, '2026-03-16 19:22:17'),
(44, 14, 6, '2026-03-16 19:22:17'),
(45, 4, 7, '2026-03-16 19:22:17'),
(46, 7, 7, '2026-03-16 19:22:17'),
(47, 11, 7, '2026-03-16 19:22:17'),
(48, 2, 8, '2026-03-16 19:22:17'),
(49, 3, 8, '2026-03-16 19:22:17'),
(50, 4, 8, '2026-03-16 19:22:17'),
(51, 5, 8, '2026-03-16 19:22:17'),
(52, 7, 8, '2026-03-16 19:22:17'),
(53, 8, 8, '2026-03-16 19:22:17'),
(54, 11, 8, '2026-03-16 19:22:17'),
(55, 12, 8, '2026-03-16 19:22:17'),
(56, 14, 8, '2026-03-16 19:22:17'),
(57, 2, 9, '2026-03-16 19:22:17'),
(58, 3, 9, '2026-03-16 19:22:17'),
(59, 4, 9, '2026-03-16 19:22:17'),
(60, 5, 9, '2026-03-16 19:22:17'),
(61, 7, 9, '2026-03-16 19:22:17'),
(62, 8, 9, '2026-03-16 19:22:17'),
(63, 3, 10, '2026-03-16 19:22:17'),
(64, 5, 10, '2026-03-16 19:22:17'),
(65, 8, 10, '2026-03-16 19:22:17'),
(66, 14, 10, '2026-03-16 19:22:17'),
(67, 2, 11, '2026-03-16 19:22:17'),
(68, 4, 11, '2026-03-16 19:22:17'),
(69, 7, 11, '2026-03-16 19:22:17'),
(70, 12, 11, '2026-03-16 19:22:17'),
(71, 14, 11, '2026-03-16 19:22:17'),
(72, 2, 12, '2026-03-16 19:22:17'),
(73, 3, 12, '2026-03-16 19:22:17'),
(74, 4, 12, '2026-03-16 19:22:17'),
(75, 5, 12, '2026-03-16 19:22:17'),
(76, 7, 12, '2026-03-16 19:22:17'),
(77, 11, 12, '2026-03-16 19:22:17'),
(78, 12, 12, '2026-03-16 19:22:17'),
(79, 16, 1, '2026-03-16 19:24:05');

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `team_name` varchar(100) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `team_name`, `event_id`, `created_by`, `created_at`) VALUES
(1, 'RoboWarriors', 3, 2, '2026-03-16 19:22:17'),
(2, 'Circuit Breakers', 3, 4, '2026-03-16 19:22:17'),
(3, 'Cyber Phantoms', 4, 3, '2026-03-16 19:22:17'),
(4, 'Code Crusaders', 6, 2, '2026-03-16 19:22:17'),
(5, 'Impact Makers', 6, 5, '2026-03-16 19:22:17'),
(6, 'IoT Innovators', 10, 3, '2026-03-16 19:22:17'),
(7, 'Pixel Pirates', 12, 2, '2026-03-16 19:22:17'),
(8, 'Game Changers', 12, 4, '2026-03-16 19:22:17');

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` int(11) NOT NULL,
  `team_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `team_id`, `user_id`) VALUES
(4, 1, 2),
(5, 1, 3),
(6, 1, 5),
(7, 2, 4),
(8, 2, 7),
(9, 3, 3),
(10, 3, 4),
(11, 3, 8),
(12, 4, 2),
(13, 4, 3),
(14, 4, 12),
(15, 5, 5),
(16, 5, 8),
(17, 5, 14),
(18, 6, 3),
(19, 6, 5),
(20, 6, 14),
(21, 7, 2),
(22, 7, 3),
(23, 7, 11),
(24, 8, 4),
(25, 8, 5),
(26, 8, 7),
(27, 8, 12);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `phone` varchar(15) NOT NULL,
  `branch` varchar(50) DEFAULT NULL,
  `year_of_passing` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `phone`, `branch`, `year_of_passing`) VALUES
(1, 'Admin', 'admin@test.com', '$2y$12$f4BwWFfIBJjdxIsUc0aXeeouTYB0ZvBX3OKEbeeqc5eGaKLRe8Q7.', 'admin', '2026-03-12 12:28:41', '9876543210', NULL, NULL),
(2, 'John', 'john@test.com', '123456', 'user', '2026-03-12 12:28:41', '9123456780', NULL, NULL),
(3, 'Alice', 'alice@test.com', '123456', 'user', '2026-03-12 12:28:41', '9988776655', 'CSE', 2026),
(4, 'David', 'david@test.com', '123456', 'user', '2026-03-12 12:28:41', '9012345678', 'ECE', 2025),
(5, 'Mike', 'mike@test.com', '123456', 'user', '2026-03-12 12:42:20', '9898989898', 'IT', 2026),
(7, 'Rahul', 'rahul@test.com', '123456', 'user', '2026-03-12 12:48:37', '9078563412', NULL, NULL),
(8, 'Arjun', 'arjun@test.com', '123456', 'user', '2026-03-14 14:31:47', '9982345671', NULL, NULL),
(11, 'John Doe', 'john@example.com', '123456', 'user', '2026-03-14 18:45:35', '9876543210', NULL, NULL),
(12, 'Alex Johnson', 'alex@test.com', '$2y$10$QqQysQU9OVu/NH/M7F9couE9.D20QLE7b8nNfnt2oNre0lywS8eT6', 'user', '2026-03-15 10:10:44', '9876543210', 'Computer Science', 2026),
(14, 'John Doe', 'johndoe@test.com', '$2y$10$VzH9DZWrvRFpJLjdwcIBM.PdFXEIQuD0Bh6/BDKz56jlyk56.3ip2', 'user', '2026-03-15 10:52:32', '9876543210', 'Computer Science', 2026),
(15, 'Amal s kumar', 'amal@ajce.in', '$2y$12$f4BwWFfIBJjdxIsUc0aXeeouTYB0ZvBX3OKEbeeqc5eGaKLRe8Q7.', 'user', '2026-03-15 21:33:13', '8590774603', 'MCA', 2026),
(16, 'Amal s kumar', 'amals@ajce.in', '$2y$12$FgfXhy5Z4ui2qKSbgUp7q.bS07I3E7HMEb3o2q9pvkQGx7C8JssNC', 'user', '2026-03-16 19:23:50', '8590774603', 'B.Tech', 2026);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_event` (`user_id`,`event_id`),
  ADD KEY `idx_event_user` (`user_id`),
  ADD KEY `idx_event_event` (`event_id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_team_event` (`event_id`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_team_user` (`team_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `event_registrations`
--
ALTER TABLE `event_registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;