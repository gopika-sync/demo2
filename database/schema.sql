-- Quiz Management System Database Schema
CREATE DATABASE IF NOT EXISTS `lms_quiz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lms_quiz_db`;

-- 1. Users Table (for authentication and role management)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Students Table (profile details linked to users)
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `year` INT NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Quizzes Table
CREATE TABLE IF NOT EXISTS `quizzes` (
  `quiz_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `total_marks` INT NOT NULL,
  `duration` INT NOT NULL, -- in minutes
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS `questions` (
  `question_id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a` VARCHAR(255) NOT NULL,
  `option_b` VARCHAR(255) NOT NULL,
  `option_c` VARCHAR(255) NOT NULL,
  `option_d` VARCHAR(255) NOT NULL,
  `correct_answer` ENUM('A', 'B', 'C', 'D') NOT NULL,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS `quiz_attempts` (
  `attempt_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `quiz_id` INT NOT NULL,
  `score` INT NOT NULL,
  `total_questions` INT NOT NULL,
  `status` ENUM('pending', 'completed') DEFAULT 'completed',
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seeding Default Admin and Students
-- All passwords are 'password' (bcrypt hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)

-- Insert Admin
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'System Administrator', 'admin@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Insert Students (Users)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(2, 'Alice Johnson', 'alice@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
(3, 'Bob Smith', 'bob@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Insert Student Profiles
INSERT INTO `students` (`student_id`, `user_id`, `department`, `year`, `phone`) VALUES
(1, 2, 'Computer Science', 3, '1234567890'),
(2, 3, 'Electrical Engineering', 2, '0987654321')
ON DUPLICATE KEY UPDATE `student_id`=`student_id`;

-- Seed Sample Quiz: Web Development Basics
INSERT INTO `quizzes` (`quiz_id`, `title`, `description`, `total_marks`, `duration`, `created_by`) VALUES
(1, 'Web Development Basics', 'A starter quiz testing HTML, CSS, and basic JavaScript concepts.', 30, 10, 1)
ON DUPLICATE KEY UPDATE `quiz_id`=`quiz_id`;

-- Seed Questions for Quiz 1
INSERT INTO `questions` (`question_id`, `quiz_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`) VALUES
(1, 1, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language', 'A'),
(2, 1, 'Which CSS property controls the text size?', 'font-style', 'text-size', 'font-size', 'text-style', 'C'),
(3, 1, 'Which JavaScript keyword is used to declare a block-scoped variable?', 'var', 'let', 'const', 'Both B and C', 'D')
ON DUPLICATE KEY UPDATE `question_id`=`question_id`;

-- Seed Sample Quiz: Database Systems
INSERT INTO `quizzes` (`quiz_id`, `title`, `description`, `total_marks`, `duration`, `created_by`) VALUES
(2, 'Introduction to SQL', 'Test your knowledge on relational databases, primary keys, and joins.', 20, 15, 1)
ON DUPLICATE KEY UPDATE `quiz_id`=`quiz_id`;

-- Seed Questions for Quiz 2
INSERT INTO `questions` (`question_id`, `quiz_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`) VALUES
(4, 2, 'What does SQL stand for?', 'Structured Query Language', 'Strong Question Language', 'Structured Question List', 'Simple Query Language', 'A'),
(5, 2, 'Which clause is used to filter records based on conditions in SQL?', 'GROUP BY', 'HAVING', 'WHERE', 'ORDER BY', 'C')
ON DUPLICATE KEY UPDATE `question_id`=`question_id`;

-- Seed Sample Quiz Attempt
INSERT INTO `quiz_attempts` (`attempt_id`, `student_id`, `quiz_id`, `score`, `total_questions`, `status`) VALUES
(1, 1, 1, 20, 3, 'completed')
ON DUPLICATE KEY UPDATE `attempt_id`=`attempt_id`;
