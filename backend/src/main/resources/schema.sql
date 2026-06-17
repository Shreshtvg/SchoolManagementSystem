-- This schema is for reference and manual database setup.
-- The application will generate a similar schema automatically via Hibernate.

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS school_management_db;
USE school_management_db;

-- Table for user roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Table for users (authentication)
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB;

-- Join table for users and roles
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;

-- Table for teachers
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKb8b8p4h2p2sc5sb9a5mtkcs66` (`user_id`),
  CONSTRAINT `FKb8b8p4h2p2sc5sb9a5mtkcs66` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;

-- Table for parents
CREATE TABLE IF NOT EXISTS `parents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtk79b29s9l3x0w538ir569f1s` (`user_id`),
  CONSTRAINT `FKtk79b29s9l3x0w538ir569f1s` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;

-- Table for class details
CREATE TABLE IF NOT EXISTS `class_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_name` varchar(255) DEFAULT NULL,
  `section` varchar(255) DEFAULT NULL,
  `teacher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKk0ayrlq3393047s0gftg2h1o8` (`teacher_id`),
  CONSTRAINT `FKk0ayrlq3393047s0gftg2h1o8` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB;

-- Table for students
CREATE TABLE IF NOT EXISTS `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dob` date DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK10psm6v6n2fp2pefhda8s0vg9` (`class_id`),
  KEY `FKpf3hq13n343bfkvpx8de5k7ik` (`parent_id`),
  CONSTRAINT `FK10psm6v6n2fp2pefhda8s0vg9` FOREIGN KEY (`class_id`) REFERENCES `class_details` (`id`),
  CONSTRAINT `FKpf3hq13n343bfkvpx8de5k7ik` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`)
) ENGINE=InnoDB;

-- Table for subjects
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Table for marks
CREATE TABLE IF NOT EXISTS `marks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `grade` varchar(255) DEFAULT NULL,
  `marks_obtained` double NOT NULL,
  `student_id` bigint DEFAULT NULL,
  `subject_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKd2c9q6k6joc8hufbt436nr7k2` (`student_id`),
  KEY `FK8hrn6m653h3n4j9h6d1r0a34t` (`subject_id`),
  CONSTRAINT `FK8hrn6m653h3n4j9h6d1r0a34t` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `FKd2c9q6k6joc8hufbt436nr7k2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB;

-- Add other tables for fees, attendance, notifications as needed...```
> **Note**: To prevent `data.sql` from failing if this script is also active, you should either use one or the other for initialization, or set `spring.sql.init.mode=embedded` in `application.properties` when using Hibernate's `ddl-auto`.

---